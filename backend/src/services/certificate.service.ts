/**
 * Certificate Generation Service
 * Creates modern, professional PDF certificates for course completion
 */

import PDFDocument from 'pdfkit';
import { Types } from 'mongoose';

export interface CertificateData {
  userName: string;
  courseTitle: string;
  courseCategory: string;
  completionDate: Date;
  certificateId: string;
  skills: string[];
  duration?: number;
}

export class CertificateService {
  /**
   * Generate a modern PDF certificate
   */
  async generateCertificate(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 0
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Background gradient effect (simulated with rectangles)
        const width = 842; // A4 landscape width
        const height = 595; // A4 landscape height

        // Modern blue background (solid color for better compatibility)
        doc.rect(0, 0, width, height)
          .fillColor('#1e40af')
          .fill();
        
        // Add lighter blue overlay on top half for gradient effect
        // Use a semi-transparent color by mixing with white
        doc.rect(0, 0, width, height / 2)
          .fillColor('#2563eb')
          .fill();

        // Decorative border
        doc.rect(30, 30, width - 60, height - 60)
          .lineWidth(3)
          .strokeColor('#ffffff')
          .stroke();

        // Inner decorative border (lighter white)
        doc.rect(50, 50, width - 100, height - 100)
          .lineWidth(1)
          .strokeColor('#e0e7ff')
          .stroke();

        // Certificate Header
        doc.fontSize(48)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text('CERTIFICATE OF COMPLETION', 0, 100, {
            align: 'center',
            width: width
          });

        // Decorative line
        doc.moveTo(150, 160)
          .lineTo(width - 150, 160)
          .lineWidth(2)
          .strokeColor('#ffffff')
          .stroke();

        // This is to certify text
        doc.fontSize(18)
          .fillColor('#e0e7ff')
          .font('Helvetica')
          .text('This is to certify that', 0, 200, {
            align: 'center',
            width: width
          });

        // User Name (prominent)
        doc.fontSize(42)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text(data.userName.toUpperCase(), 0, 240, {
            align: 'center',
            width: width
          });

        // Has successfully completed text
        doc.fontSize(16)
          .fillColor('#e0e7ff')
          .font('Helvetica')
          .text('has successfully completed the course', 0, 300, {
            align: 'center',
            width: width
          });

        // Course Title
        doc.fontSize(28)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text(data.courseTitle, 0, 330, {
            align: 'center',
            width: width,
            ellipsis: true
          });

        // Category badge
        if (data.courseCategory) {
          const categoryText = this.formatCategory(data.courseCategory);
          doc.fontSize(14)
            .fillColor('#3b82f6')
            .font('Helvetica-Bold')
            .text(categoryText, 0, 380, {
              align: 'center',
              width: width
            });
        }

        // Skills learned
        if (data.skills && data.skills.length > 0) {
          const skillsText = `Skills: ${data.skills.slice(0, 5).join(', ')}`;
          doc.fontSize(12)
            .fillColor('#cbd5e1')
            .font('Helvetica')
            .text(skillsText, 0, 410, {
              align: 'center',
              width: width,
              ellipsis: true
            });
        }

        // Completion Date
        const dateText = `Completed on ${this.formatDate(data.completionDate)}`;
        doc.fontSize(14)
          .fillColor('#e0e7ff')
          .font('Helvetica')
          .text(dateText, 0, 450, {
            align: 'center',
            width: width
          });

        // Certificate ID
        doc.fontSize(10)
          .fillColor('#94a3b8')
          .font('Helvetica')
          .text(`Certificate ID: ${data.certificateId}`, 0, 480, {
            align: 'center',
            width: width
          });

        // Footer - eMirimo branding
        doc.fontSize(16)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text('eMirimo', 0, height - 80, {
            align: 'center',
            width: width
          });

        doc.fontSize(12)
          .fillColor('#cbd5e1')
          .font('Helvetica')
          .text('Empowering Career Growth Through Learning', 0, height - 60, {
            align: 'center',
            width: width
          });

        // Signature lines (bottom corners)
        const signatureY = height - 40;
        
        // Left signature
        doc.fontSize(10)
          .fillColor('#ffffff')
          .font('Helvetica')
          .text('_________________', 100, signatureY, { width: 200 });
        doc.fontSize(9)
          .fillColor('#cbd5e1')
          .text('Course Instructor', 100, signatureY + 15, { width: 200 });

        // Right signature
        doc.fontSize(10)
          .fillColor('#ffffff')
          .font('Helvetica')
          .text('_________________', width - 300, signatureY, { width: 200, align: 'right' });
        doc.fontSize(9)
          .fillColor('#cbd5e1')
          .text('eMirimo Platform', width - 300, signatureY + 15, { width: 200, align: 'right' });

        // Decorative elements (corner accents)
        this.addDecorativeElements(doc, width, height);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add decorative elements to certificate
   */
  private addDecorativeElements(doc: PDFKit.PDFDocument, width: number, height: number) {
    // Top left corner decoration
    doc.circle(80, 80, 15)
      .lineWidth(2)
      .strokeColor('#ffffff')
      .opacity(0.3)
      .stroke();

    // Top right corner decoration
    doc.circle(width - 80, 80, 15)
      .lineWidth(2)
      .strokeColor('#ffffff')
      .opacity(0.3)
      .stroke();

    // Bottom left corner decoration
    doc.circle(80, height - 80, 15)
      .lineWidth(2)
      .strokeColor('#ffffff')
      .opacity(0.3)
      .stroke();

    // Bottom right corner decoration
    doc.circle(width - 80, height - 80, 15)
      .lineWidth(2)
      .strokeColor('#ffffff')
      .opacity(0.3)
      .stroke();
  }

  /**
   * Format category name for display
   */
  private formatCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'digital-literacy-productivity': 'Digital Literacy & Productivity',
      'soft-skills-professional': 'Soft Skills & Professional Development',
      'entrepreneurship-business': 'Entrepreneurship & Business',
      'job-search-career': 'Job Search & Career Development',
      'technology-digital-careers': 'Technology & Digital Careers',
      'personal-development-workplace': 'Personal Development & Workplace Skills'
    };
    return categoryMap[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Generate unique certificate ID
   */
  generateCertificateId(userId: string, courseId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `EM-${timestamp}-${random}`.toUpperCase();
  }
}

