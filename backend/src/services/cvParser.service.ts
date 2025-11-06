/**
 * CV/Resume Parser Service
 * Extracts structured data from CV/Resume documents to auto-fill profile fields
 */

import fetch from 'node-fetch';

export interface ParsedCVData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  education?: Array<{
    institution?: string;
    degree?: string;
    field_of_study?: string;
    graduation_year?: number;
    gpa?: string;
  }>;
  work_experience?: Array<{
    company?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    description?: string;
    skills_used?: string[];
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    issue_date?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }>;
  professional_summary?: string;
}

export class CVParserService {
  /**
   * Parse CV/Resume from file buffer (PDF, DOC, DOCX)
   * This is the preferred method as it avoids URL access issues
   */
  static async parseCVFromBuffer(buffer: ArrayBuffer, fileName: string): Promise<ParsedCVData> {
    try {
      // Determine file type from extension
      const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
      let text = '';
      
      if (fileExtension === '.pdf') {
        text = await this.extractTextFromPDF(buffer);
      } else if (fileExtension === '.docx' || fileExtension === '.doc') {
        text = await this.extractTextFromWord(buffer);
      } else {
        // Try to extract as plain text
        text = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(buffer);
      }

      // If text extraction failed or returned placeholder, still try to parse what we have
      if (text.includes('extraction may be limited') || text.length < 50) {
        console.warn('CV text extraction may be limited. Attempting to parse available text...');
      }

      // Parse the extracted text
      return this.parseText(text);
    } catch (error: any) {
      console.error('Error parsing CV from buffer:', error);
      throw new Error(`CV parsing failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Parse CV/Resume from URL (PDF, DOC, DOCX)
   * This is a basic implementation. For production, consider using:
   * - pdf-parse for PDFs
   * - mammoth for DOCX
   * - textract or similar for comprehensive parsing
   */
  static async parseCVFromURL(cvUrl: string): Promise<ParsedCVData> {
    try {
      // Ensure URL is accessible - Cloudinary URLs should be public
      let fetchUrl = cvUrl;
      
      // If it's a Cloudinary URL, try different formats
      if (cvUrl.includes('cloudinary.com')) {
        // Cloudinary secure URLs should be publicly accessible
        // Try to ensure we're using the correct format
        if (cvUrl.includes('upload/')) {
          // This is already a proper Cloudinary URL
          fetchUrl = cvUrl;
        } else {
          // Try to construct proper URL
          fetchUrl = cvUrl;
        }
      }

      // Fetch the document with proper headers
      // Note: Cloudinary URLs should be publicly accessible
      const fetchOptions: any = {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,*/*',
          'User-Agent': 'Mozilla/5.0 (compatible; CVParser/1.0)'
        }
      };
      
      // Add timeout support if AbortController is available
      let timeoutId: NodeJS.Timeout | null = null;
      let controller: AbortController | null = null;
      
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller!.abort(), 30000); // 30 second timeout
        fetchOptions.signal = controller.signal;
      }
      
      let response: any;
      try {
        response = await fetch(fetchUrl, fetchOptions);
        if (timeoutId) clearTimeout(timeoutId);
      } catch (fetchError: any) {
        if (timeoutId) clearTimeout(timeoutId);
        // If fetch fails, try with original URL
        if (fetchUrl !== cvUrl) {
          try {
            const retryOptions = { ...fetchOptions };
            if (controller) {
              controller = new AbortController();
              timeoutId = setTimeout(() => controller!.abort(), 30000);
              retryOptions.signal = controller.signal;
            }
            response = await fetch(cvUrl, retryOptions);
            if (timeoutId) clearTimeout(timeoutId);
          } catch (retryError: any) {
            if (timeoutId) clearTimeout(timeoutId);
            console.error('Failed to fetch CV from both URLs:', { original: cvUrl, modified: fetchUrl, error: retryError });
            throw new Error(`Failed to fetch CV document. Please ensure the file is publicly accessible. Error: ${retryError.message || 'Unknown error'}`);
          }
        } else {
          throw new Error(`Failed to fetch CV: ${fetchError.message || 'Network error'}`);
        }
      }

      if (!response.ok) {
        // If unauthorized, provide helpful error message
        if (response.status === 401 || response.status === 403) {
          throw new Error(`CV document is not publicly accessible. Please ensure the file URL is accessible without authentication.`);
        }
        throw new Error(`Failed to fetch CV: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const buffer = await response.arrayBuffer();

      // Extract text based on file type
      const text = await this.extractText(buffer, contentType, cvUrl);

      // If text extraction failed or returned placeholder, still try to parse what we have
      if (text.includes('extraction may be limited') || text.length < 50) {
        console.warn('CV text extraction may be limited. Attempting to parse available text...');
      }

      // Parse the extracted text
      return this.parseText(text);
    } catch (error: any) {
      console.error('Error parsing CV:', error);
      // Re-throw with more context
      if (error.message) {
        throw error;
      }
      throw new Error(`CV parsing failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Extract text from buffer based on content type
   */
  private static async extractText(buffer: ArrayBuffer, contentType: string, url: string): Promise<string> {
    if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      return await this.extractTextFromPDF(buffer);
    } else if (contentType.includes('word') || url.toLowerCase().match(/\.(doc|docx)$/i)) {
      return await this.extractTextFromWord(buffer);
    } else {
      // Try to extract as plain text
      return new TextDecoder('utf-8', { ignoreBOM: true }).decode(buffer);
    }
  }

  /**
   * Extract text from PDF buffer
   * Note: This is a simplified version. For production, use pdf-parse library
   * This implementation tries to extract readable text from PDF binary format
   */
  private static async extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
      const uint8Array = new Uint8Array(buffer);
      let text = '';
      
      // PDF text extraction: Look for text streams in PDF format
      // PDFs store text in streams between "stream" and "endstream"
      const pdfText = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(uint8Array);
      
      // Extract text from PDF streams
      const streamMatches = pdfText.match(/stream[\s\S]*?endstream/g);
      if (streamMatches) {
        for (const stream of streamMatches) {
          // Try to extract readable text from stream
          const streamText = stream
            .replace(/stream|endstream/g, '')
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (streamText.length > 10) {
            text += streamText + '\n';
          }
        }
      }
      
      // Also try direct decoding for readable text
      const directText = pdfText
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Combine both methods
      const combined = (text + '\n' + directText)
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      
      return combined || 'PDF content extracted (text parsing may be limited)';
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      // Fallback: return a message indicating extraction was attempted
      return 'PDF document uploaded (automatic text extraction may be limited)';
    }
  }

  /**
   * Extract text from Word document buffer
   * Note: This is a simplified version. For production, use mammoth library
   * DOCX files are ZIP archives containing XML files
   */
  private static async extractTextFromWord(buffer: ArrayBuffer): Promise<string> {
    try {
      const uint8Array = new Uint8Array(buffer);
      const text = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(uint8Array);
      
      // DOCX files contain XML with text in <w:t> tags
      // Try to extract text from XML structure
      const xmlTextMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/gi);
      if (xmlTextMatches && xmlTextMatches.length > 0) {
        const extracted = xmlTextMatches
          .map(match => match.replace(/<[^>]+>/g, ''))
          .filter(t => t.trim().length > 0)
          .join(' ');
        if (extracted.length > 50) {
          return extracted;
        }
      }
      
      // Fallback: extract readable text
      return text
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || 'Word document uploaded (automatic text extraction may be limited)';
    } catch (error) {
      console.error('Error extracting Word text:', error);
      return 'Word document uploaded (automatic text extraction may be limited)';
    }
  }

  /**
   * Parse extracted text into structured data
   */
  private static parseText(text: string): ParsedCVData {
    const data: ParsedCVData = {
      skills: [],
      education: [],
      work_experience: [],
      certifications: [],
      languages: []
    };

    const lines = text.split(/\n|\r\n/).map(l => l.trim()).filter(l => l.length > 0);
    const fullText = text.toLowerCase();

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      data.email = emailMatch[0];
    }

    // Extract phone (various formats)
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
    if (phoneMatch) {
      data.phone = phoneMatch[0].trim();
    }

    // Extract name (usually first line or before email)
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.match(/\d{10,}/)) {
        data.name = firstLine;
      }
    }

    // Extract skills (expanded list of common skill keywords)
    const skillKeywords = [
      // Programming Languages
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
      'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'cassandra',
      'html', 'css', 'sass', 'scss', 'tailwind', 'bootstrap', 'material-ui',
      'git', 'github', 'gitlab', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
      'aws', 'azure', 'gcp', 'cloud', 'terraform', 'ansible',
      // Soft Skills
      'agile', 'scrum', 'kanban', 'project management', 'leadership', 'team leadership',
      'communication', 'teamwork', 'collaboration', 'problem solving', 'critical thinking',
      'time management', 'organization', 'analytical', 'creative', 'adaptable',
      // Technical Skills
      'machine learning', 'ml', 'ai', 'artificial intelligence', 'data science', 'analytics',
      'data analysis', 'statistics', 'big data', 'hadoop', 'spark',
      'testing', 'qa', 'quality assurance', 'automation', 'selenium',
      'devops', 'microservices', 'api', 'rest', 'graphql', 'soap',
      // Business Skills
      'marketing', 'digital marketing', 'seo', 'sem', 'social media',
      'sales', 'business development', 'customer service', 'client relations',
      'finance', 'accounting', 'budgeting', 'financial analysis',
      'hr', 'human resources', 'recruitment', 'training', 'talent management'
    ];

    for (const keyword of skillKeywords) {
      // Use word boundary to avoid partial matches
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(fullText)) {
        const skill = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (!data.skills?.some(s => s.toLowerCase() === skill.toLowerCase())) {
          data.skills?.push(skill);
        }
      }
    }

    // Extract education (look for education section)
    let inEducationSection = false;
    const educationKeywords = ['education', 'academic', 'qualification', 'university', 'college', 'school'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const isEducationHeader = educationKeywords.some(keyword => line.includes(keyword));
      
      if (isEducationHeader && line.length < 30) {
        inEducationSection = true;
        continue;
      }
      
      if (inEducationSection && (line.includes('experience') || line.includes('employment') || line.includes('work history') || line.includes('skills'))) {
        break;
      }
      
      if (inEducationSection) {
        // Try to extract education entries
        const eduMatch = this.extractEducationEntry(lines[i], i < lines.length - 1 ? lines[i + 1] : '');
        if (eduMatch) {
          data.education?.push(eduMatch);
        }
      }
    }
    
    // Also try to find education entries outside of explicit sections
    if (data.education.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        const eduMatch = this.extractEducationEntry(lines[i], i < lines.length - 1 ? lines[i + 1] : '');
        if (eduMatch && !data.education.some(e => e.institution === eduMatch.institution && e.degree === eduMatch.degree)) {
          data.education?.push(eduMatch);
        }
      }
    }

    // Extract work experience
    let inExperienceSection = false;
    const experienceKeywords = ['experience', 'employment', 'work history', 'work experience', 'professional experience', 'career'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const isExperienceHeader = experienceKeywords.some(keyword => line.includes(keyword)) && line.length < 30;
      
      if (isExperienceHeader) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && (line.includes('education') || line.includes('academic') || line.includes('skills') || line.includes('certification'))) {
        break;
      }
      
      if (inExperienceSection) {
        const expMatch = this.extractWorkExperienceEntry(lines, i);
        if (expMatch && !data.work_experience?.some(e => e.company === expMatch.company && e.position === expMatch.position)) {
          data.work_experience?.push(expMatch);
          i += 2; // Skip a few lines
        }
      }
    }
    
    // Also try to find experience entries outside of explicit sections
    if (data.work_experience.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        const expMatch = this.extractWorkExperienceEntry(lines, i);
        if (expMatch && !data.work_experience?.some(e => e.company === expMatch.company && e.position === expMatch.position)) {
          data.work_experience?.push(expMatch);
          i += 2;
        }
      }
    }

    // Extract certifications
    if (fullText.includes('certification') || fullText.includes('certificate')) {
      const certSection = text.match(/(?:certification|certificate)s?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
      if (certSection) {
        const certs = certSection[1].split('\n').filter(l => l.trim().length > 0);
        for (const cert of certs.slice(0, 5)) {
          const certMatch = cert.match(/(.+?)(?:\s*[-–]\s*|\s+)(.+)/);
          if (certMatch) {
            data.certifications?.push({
              name: certMatch[1].trim(),
              issuer: certMatch[2].trim()
            });
          }
        }
      }
    }

    // Extract languages
    if (fullText.includes('language')) {
      const langSection = text.match(/(?:language)s?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
      if (langSection) {
        const langs = langSection[1].split(',').map(l => l.trim()).filter(l => l.length > 0);
        for (const lang of langs.slice(0, 5)) {
          const langMatch = lang.match(/(.+?)(?:\s*[-–]\s*|\s+)(beginner|intermediate|advanced|native|fluent|proficient)/i);
          if (langMatch) {
            const proficiency = langMatch[2].toLowerCase();
            let prof: 'beginner' | 'intermediate' | 'advanced' | 'native' = 'intermediate';
            if (proficiency.includes('native') || proficiency.includes('fluent')) prof = 'native';
            else if (proficiency.includes('advanced')) prof = 'advanced';
            else if (proficiency.includes('beginner')) prof = 'beginner';
            
            data.languages?.push({
              language: langMatch[1].trim(),
              proficiency: prof
            });
          } else {
            data.languages?.push({
              language: lang.trim(),
              proficiency: 'intermediate'
            });
          }
        }
      }
    }

    // Extract professional summary
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    for (const keyword of summaryKeywords) {
      const summaryMatch = text.match(new RegExp(`(?:${keyword}):?\\s*([\\s\\S]{50,500})(?:\\n\\n|\\n[A-Z]|$)`, 'i'));
      if (summaryMatch) {
        data.professional_summary = summaryMatch[1].trim().substring(0, 2000);
        break;
      }
    }

    return data;
  }

  /**
   * Extract education entry from a line
   */
  private static extractEducationEntry(line: string, nextLine: string = ''): any | null {
    // Look for degree patterns
    const degreePatterns = /(bachelor|master|phd|doctorate|diploma|certificate|degree|b\.?s\.?c|m\.?s\.?c|m\.?b\.?a|b\.?a|m\.?a)/i;
    const degreeMatch = line.match(degreePatterns);
    
    if (degreeMatch || line.length > 10) {
      // Try to extract institution name (usually before or after degree)
      let institution = '';
      let degree = '';
      let fieldOfStudy = '';
      
      // Check if line contains university/college name
      const institutionPatterns = /(university|college|institute|school|academy)/i;
      if (institutionPatterns.test(line)) {
        institution = line.replace(degreePatterns, '').trim().substring(0, 100);
      } else if (nextLine && institutionPatterns.test(nextLine)) {
        institution = nextLine.trim().substring(0, 100);
      }
      
      // Extract degree
      if (degreeMatch) {
        degree = degreeMatch[0];
        // Try to get full degree name
        const fullDegreeMatch = line.match(new RegExp(`(${degreeMatch[0]}[^,]*?)(?:,|in|of|\\n|$)`, 'i'));
        if (fullDegreeMatch) {
          degree = fullDegreeMatch[1].trim();
        }
      }
      
      // Extract field of study (often after "in" or "of")
      const fieldMatch = line.match(/(?:in|of)\s+([A-Z][^,]+?)(?:,|\n|$)/i);
      if (fieldMatch) {
        fieldOfStudy = fieldMatch[1].trim().substring(0, 100);
      }
      
      // Extract year
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const graduationYear = yearMatch ? parseInt(yearMatch[0]) : undefined;
      
      // Only return if we found meaningful data
      if (degree || institution || graduationYear) {
        return {
          institution: institution || line.substring(0, 100),
          degree: degree || 'Degree',
          field_of_study: fieldOfStudy,
          graduation_year: graduationYear
        };
      }
    }
    return null;
  }

  /**
   * Extract work experience entry
   */
  private static extractWorkExperienceEntry(lines: string[], startIndex: number): any | null {
    if (startIndex >= lines.length) return null;

    const line = lines[startIndex];
    
    // Skip if line is too short or looks like a header
    if (line.length < 5 || line.length > 150) return null;
    
    // Look for date patterns (common in work experience)
    const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}\/\d{4}|\d{4}\s*[-–]\s*\d{4}|present|current/i;
    const hasDate = datePattern.test(line);
    
    // Look for position keywords
    const positionKeywords = /(developer|engineer|manager|analyst|specialist|consultant|director|coordinator|assistant|executive|officer|lead|senior|junior)/i;
    const hasPosition = positionKeywords.test(line);
    
    // If line has date or position keywords, it's likely an experience entry
    if (hasDate || hasPosition) {
      let company = '';
      let position = '';
      let startDate = '';
      let endDate = '';
      let current = false;
      let description = '';
      
      // Try to extract company and position from the line
      // Common format: "Position at Company" or "Company - Position"
      const atMatch = line.match(/(.+?)\s+at\s+(.+)/i);
      const dashMatch = line.match(/(.+?)\s*[-–]\s*(.+)/);
      
      if (atMatch) {
        position = atMatch[1].trim().substring(0, 100);
        company = atMatch[2].replace(datePattern, '').trim().substring(0, 100);
      } else if (dashMatch) {
        company = dashMatch[1].trim().substring(0, 100);
        position = dashMatch[2].replace(datePattern, '').trim().substring(0, 100);
      } else {
        // If no clear separator, assume first part is position/company
        position = line.replace(datePattern, '').trim().substring(0, 100);
      }
      
      // Extract dates
      const dateMatches = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/gi);
      if (dateMatches && dateMatches.length >= 1) {
        startDate = dateMatches[0];
        if (dateMatches.length >= 2) {
          endDate = dateMatches[1];
        } else if (line.toLowerCase().includes('present') || line.toLowerCase().includes('current')) {
          current = true;
        }
      }
      
      // Get description from next few lines
      if (startIndex + 1 < lines.length && startIndex + 1 < lines.length + 3) {
        const descLines: string[] = [];
        for (let i = startIndex + 1; i < Math.min(startIndex + 4, lines.length); i++) {
          if (!datePattern.test(lines[i]) && lines[i].length > 10) {
            descLines.push(lines[i]);
          }
        }
        description = descLines.join(' ').substring(0, 500);
      }
      
      // Only return if we have meaningful data
      if (company || position || hasDate) {
        return {
          company: company || 'Company',
          position: position || 'Position',
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          current: current,
          description: description
        };
      }
    }
    
    return null;
  }
}

