import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { LearningResource } from '../models/LearningResource.js';

interface JobRecommendation {
  job: any;
  matchScore: number;
  reasons: string[];
  areasOfImprovement?: string[];
  keywordBoost?: boolean;
}

interface CourseRecommendation {
  course: any;
  matchScore: number;
  skillsGap: string[];
  reasons: string[];
}

export class RecommendationService {
  
  /**
   * Helper function to normalize skills (handle both string and object formats)
   */
  private static normalizeSkills(skills: any[]): string[] {
    if (!Array.isArray(skills)) return [];
    return skills.map((s: any) => {
      if (typeof s === 'string') return s.toLowerCase().trim();
      if (s && typeof s === 'object' && s.name) return s.name.toLowerCase().trim();
      return '';
    }).filter((skill: string) => skill.length > 0);
  }
  
  /**
   * Analyze user profile comprehensively for better recommendations
   */
  private static analyzeUserProfile(user: any): {
    skillLevel: number;
    experienceYears: number;
    educationLevel: number;
    careerStage: string;
    strengths: string[];
    weaknesses: string[];
    rwandaContext: {
      location: string;
      languageSkills: string[];
      localExperience: boolean;
    };
  } {
    const skillLevel = this.assessUserSkillLevel(user);
    const experienceYears = this.calculateYearsOfExperience(user.work_experience);
    const educationLevel = this.assessEducationLevel(user.education);
    
    // Determine career stage
    let careerStage = 'entry';
    if (experienceYears >= 5) careerStage = 'senior';
    else if (experienceYears >= 2) careerStage = 'mid';
    
    // Analyze strengths and weaknesses
    const strengths = this.identifyStrengths(user);
    const weaknesses = this.identifyWeaknesses(user);
    
    // Rwanda-specific context
    const rwandaContext = {
      location: user.address || 'Kigali',
      languageSkills: this.analyzeLanguageSkills(user),
      localExperience: this.hasLocalExperience(user)
    };
    
    return {
      skillLevel,
      experienceYears,
      educationLevel,
      careerStage,
      strengths,
      weaknesses,
      rwandaContext
    };
  }
  
  /**
   * Assess education level for better matching
   */
  private static assessEducationLevel(education: any[]): number {
    if (!education || education.length === 0) return 1;
    
    let maxLevel = 1;
    for (const edu of education) {
      const degree = edu.degree?.toLowerCase() || '';
      if (degree.includes('phd') || degree.includes('doctorate')) maxLevel = Math.max(maxLevel, 5);
      else if (degree.includes('master') || degree.includes('mba')) maxLevel = Math.max(maxLevel, 4);
      else if (degree.includes('bachelor') || degree.includes('degree')) maxLevel = Math.max(maxLevel, 3);
      else if (degree.includes('diploma') || degree.includes('certificate')) maxLevel = Math.max(maxLevel, 2);
    }
    
    return maxLevel;
  }
  
  /**
   * Identify user strengths based on profile
   */
  private static identifyStrengths(user: any): string[] {
    const strengths: string[] = [];
    
    // Skills-based strengths
    if (user.skills && user.skills.length >= 5) {
      strengths.push('Strong technical skills');
    }
    
    // Experience-based strengths
    const yearsOfExp = this.calculateYearsOfExperience(user.work_experience);
    if (yearsOfExp >= 3) {
      strengths.push('Solid work experience');
    }
    
    // Education-based strengths
    if (user.education && user.education.some((edu: any) => edu.degree?.toLowerCase().includes('bachelor'))) {
      strengths.push('University education');
    }
    
    // Certification strengths
    if (user.certifications && user.certifications.length > 0) {
      strengths.push('Professional certifications');
    }
    
    // Language strengths
    if (user.languages && user.languages.some((lang: any) => lang.proficiency === 'native')) {
      strengths.push('Native language proficiency');
    }
    
    return strengths;
  }
  
  /**
   * Identify areas for improvement
   */
  private static identifyWeaknesses(user: any): string[] {
    const weaknesses: string[] = [];
    
    // Limited experience
    const yearsOfExp = this.calculateYearsOfExperience(user.work_experience);
    if (yearsOfExp < 1) {
      weaknesses.push('Limited work experience');
    }
    
    // Missing technical skills
    if (!user.skills || user.skills.length < 3) {
      weaknesses.push('Limited technical skills');
    }
    
    // No certifications
    if (!user.certifications || user.certifications.length === 0) {
      weaknesses.push('No professional certifications');
    }
    
    // Incomplete profile
    if (!user.bio || user.bio.length < 50) {
      weaknesses.push('Incomplete profile information');
    }
    
    return weaknesses;
  }
  
  /**
   * Analyze language skills for Rwanda context
   */
  private static analyzeLanguageSkills(user: any): string[] {
    const languages: string[] = [];
    
    if (user.languages) {
      for (const lang of user.languages) {
        if (lang.language.toLowerCase().includes('kinyarwanda') && lang.proficiency !== 'beginner') {
          languages.push('Kinyarwanda');
        }
        if (lang.language.toLowerCase().includes('english') && lang.proficiency !== 'beginner') {
          languages.push('English');
        }
        if (lang.language.toLowerCase().includes('french') && lang.proficiency !== 'beginner') {
          languages.push('French');
        }
      }
    }
    
    return languages;
  }
  
  /**
   * Check if user has local Rwanda experience
   */
  private static hasLocalExperience(user: any): boolean {
    if (!user.work_experience) return false;
    
    const rwandaKeywords = ['rwanda', 'kigali', 'kigali', 'butare', 'muhanga', 'rubavu', 'musanze'];
    
    for (const exp of user.work_experience) {
      const company = exp.company?.toLowerCase() || '';
      const location = exp.description?.toLowerCase() || '';
      
      if (rwandaKeywords.some(keyword => company.includes(keyword) || location.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get job recommendations for a user based on their profile
   */
  static async getJobRecommendations(userId: string, limit: number = 10): Promise<JobRecommendation[]> {
    try {
      const user = await User.findById(userId).select('skills education work_experience job_preferences address languages bio certifications');
      if (!user) {
        throw new Error('User not found');
      }

      // Comprehensive profile analysis
      const profileAnalysis = this.analyzeUserProfile(user);
      console.log('Profile Analysis:', profileAnalysis);

      // Get all active jobs with Rwanda context
      const jobs = await Job.find({ is_active: true })
        .populate('employer_id', 'name company_name')
        .sort({ posted_at: -1 })
        .limit(100); // Get more jobs for better analysis

      const recommendations: JobRecommendation[] = [];

      for (const job of jobs) {
        let matchScore = this.calculateEnhancedJobMatchScore(user, job, profileAnalysis);
        const reasons = this.getEnhancedJobMatchReasons(user, job, matchScore, profileAnalysis);

        // Check for keyword-based boost
        const keywordBoost = this.checkKeywordMatch(user, job);
        if (keywordBoost) {
          // Boost score by 20% if keywords match
          matchScore = Math.min(matchScore * 1.2, 1.0);
        }
        
        // Calculate areas of improvement
        const areasOfImprovement = this.calculateAreasOfImprovement(user, job, profileAnalysis);

        // Lower threshold by 30%: 0.25 * 0.7 = 0.175
        if (matchScore > 0.175 || keywordBoost) {
          recommendations.push({
            job,
            matchScore,
            reasons,
            areasOfImprovement,
            keywordBoost: keywordBoost || false
          });
        }
      }

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  /**
   * Get course recommendations based on skills gap analysis
   */
  static async getCourseRecommendations(userId: string, limit: number = 10): Promise<CourseRecommendation[]> {
    try {
      const user = await User.findById(userId).select('skills education work_experience certifications languages');
      if (!user) {
        throw new Error('User not found');
      }

      // Comprehensive profile analysis
      const profileAnalysis = this.analyzeUserProfile(user);
      
      // Get jobs the user might be interested in to identify skills gaps
      const potentialJobs = await Job.find({ is_active: true })
        .select('skills requirements experience_level')
        .limit(20);

      // Analyze skills gaps from potential jobs
      const skillsGapAnalysis = this.analyzeSkillsGapFromJobs(user, potentialJobs);
      console.log('Skills Gap Analysis:', skillsGapAnalysis);

      // Get all active learning resources
      const courses = await LearningResource.find({ 
        is_active: true,
        type: { $in: ['course', 'tutorial', 'video'] }
      }).sort({ created_at: -1 }).limit(100);

      const recommendations: CourseRecommendation[] = [];

      for (const course of courses) {
        const { matchScore, skillsGap } = this.calculateEnhancedCourseMatchScore(user, course, profileAnalysis, skillsGapAnalysis);
        const reasons = this.getEnhancedCourseMatchReasons(user, course, matchScore, skillsGap, profileAnalysis);

        if (matchScore > 0.2) { // Lower threshold for skill development
          recommendations.push({
            course,
            matchScore,
            skillsGap,
            reasons
          });
        }
      }

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting course recommendations:', error);
      throw error;
    }
  }

  /**
   * Enhanced job match score with Rwanda context and comprehensive analysis
   */
  private static calculateEnhancedJobMatchScore(user: any, job: any, profileAnalysis: any): number {
    let score = 0;
    let factors = 0;

    // Skills match (35% weight) - More important for Rwanda job market
    // Check both required_skills and preferred_skills (new format) and legacy skills field
    const jobRequiredSkills = job.required_skills || [];
    const jobPreferredSkills = job.preferred_skills || [];
    const jobLegacySkills = job.skills || [];
    
    // Combine all job skills (required + preferred + legacy)
    const allJobSkills = [
      ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobLegacySkills
    ].filter(Boolean);
    
    if (user.skills && allJobSkills.length > 0) {
      const userSkills = this.normalizeSkills(user.skills);
      const jobSkills = this.normalizeSkills(allJobSkills);
      const matchingSkills = userSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.includes(skill) || skill.includes(jobSkill)
        )
      );
      const skillsScore = matchingSkills.length / Math.max(jobSkills.length, 1);
      score += skillsScore * 0.35;
      factors += 0.35;
    }

    // Experience level match (25% weight)
    if (profileAnalysis.experienceYears !== undefined && job.experience_level) {
      let experienceScore = 0;
      
      switch (job.experience_level) {
        case 'entry':
          experienceScore = profileAnalysis.experienceYears <= 2 ? 1 : 0.8;
          break;
        case 'mid':
          experienceScore = profileAnalysis.experienceYears >= 1 && profileAnalysis.experienceYears <= 5 ? 1 : 0.7;
          break;
        case 'senior':
          experienceScore = profileAnalysis.experienceYears >= 4 ? 1 : 0.5;
          break;
        case 'lead':
          experienceScore = profileAnalysis.experienceYears >= 6 ? 1 : 0.4;
          break;
      }
      
      score += experienceScore * 0.25;
      factors += 0.25;
    }

    // Education match (20% weight)
    if (profileAnalysis.educationLevel && job.requirements) {
      const educationScore = this.calculateEducationMatch(user.education, job.requirements);
      score += educationScore * 0.2;
      factors += 0.2;
    }

    // Rwanda context bonus (10% weight)
    const rwandaBonus = this.calculateRwandaContextBonus(profileAnalysis, job);
    score += rwandaBonus * 0.1;
    factors += 0.1;

    // Location preference match (10% weight)
    if (user.job_preferences && job.location) {
      const locationScore = this.calculateLocationMatch(user.job_preferences, job);
      score += locationScore * 0.1;
      factors += 0.1;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Helper function to extract location string from job location (handles both object and string formats)
   */
  private static getLocationString(location: any): string {
    if (!location) return '';
    if (typeof location === 'string') return location.toLowerCase();
    if (typeof location === 'object') {
      // Handle object format: { city, country, address }
      const parts: string[] = [];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      if (location.address && !parts.length) parts.push(location.address);
      return parts.join(', ').toLowerCase();
    }
    return '';
  }

  /**
   * Calculate Rwanda-specific context bonus
   */
  private static calculateRwandaContextBonus(profileAnalysis: any, job: any): number {
    let bonus = 0;

    // Language skills bonus
    if (profileAnalysis.rwandaContext.languageSkills.includes('Kinyarwanda')) {
      bonus += 0.3;
    }
    if (profileAnalysis.rwandaContext.languageSkills.includes('English')) {
      bonus += 0.2;
    }
    if (profileAnalysis.rwandaContext.languageSkills.includes('French')) {
      bonus += 0.1;
    }

    // Local experience bonus
    if (profileAnalysis.rwandaContext.localExperience) {
      bonus += 0.2;
    }

    // Location match bonus
    const jobLocation = this.getLocationString(job.location);
    const userLocation = typeof profileAnalysis.rwandaContext.location === 'string' 
      ? profileAnalysis.rwandaContext.location.toLowerCase()
      : (profileAnalysis.rwandaContext.location?.country || '').toLowerCase();
    
    if (jobLocation.includes('kigali') && userLocation.includes('kigali')) {
      bonus += 0.2;
    }

    return Math.min(bonus, 1);
  }

  /**
   * Calculate job match score based on skills, experience, and preferences
   */
  private static calculateJobMatchScore(user: any, job: any): number {
    let score = 0;
    let factors = 0;

    // Skills match (40% weight)
    // Combine required_skills, preferred_skills, and legacy skills
    const jobRequiredSkills = job.required_skills || [];
    const jobPreferredSkills = job.preferred_skills || [];
    const jobLegacySkills = job.skills || [];
    const allJobSkills = [
      ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobLegacySkills
    ].filter(Boolean);
    
    if (user.skills && allJobSkills.length > 0) {
      const userSkills = this.normalizeSkills(user.skills);
      const jobSkills = this.normalizeSkills(allJobSkills);
      const matchingSkills = userSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.includes(skill) || skill.includes(jobSkill)
        )
      );
      const skillsScore = matchingSkills.length / Math.max(jobSkills.length, 1);
      score += skillsScore * 0.4;
      factors += 0.4;
    }

    // Experience level match (25% weight)
    if (user.work_experience && job.experience_level) {
      const yearsOfExperience = this.calculateYearsOfExperience(user.work_experience);
      let experienceScore = 0;
      
      switch (job.experience_level) {
        case 'entry':
          experienceScore = yearsOfExperience <= 2 ? 1 : 0.7;
          break;
        case 'mid':
          experienceScore = yearsOfExperience >= 2 && yearsOfExperience <= 5 ? 1 : 0.6;
          break;
        case 'senior':
          experienceScore = yearsOfExperience >= 5 ? 1 : 0.4;
          break;
        case 'lead':
          experienceScore = yearsOfExperience >= 7 ? 1 : 0.3;
          break;
      }
      
      score += experienceScore * 0.25;
      factors += 0.25;
    }

    // Education match (20% weight)
    if (user.education && job.requirements) {
      const educationScore = this.calculateEducationMatch(user.education, job.requirements);
      score += educationScore * 0.2;
      factors += 0.2;
    }

    // Location preference match (15% weight)
    if (user.job_preferences && job.location) {
      const locationScore = this.calculateLocationMatch(user.job_preferences, job);
      score += locationScore * 0.15;
      factors += 0.15;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Analyze skills gap from potential jobs
   */
  private static analyzeSkillsGapFromJobs(user: any, potentialJobs: any[]): {
    criticalSkills: string[];
    missingSkills: string[];
    jobSkills: string[];
  } {
    // Handle skills that can be strings or objects with name property
    const userSkills = this.normalizeSkills(user.skills || []);
    
    const allJobSkills: string[] = [];
    const missingSkills: string[] = [];
    
    // Collect all skills from potential jobs
    for (const job of potentialJobs) {
      // Combine required_skills, preferred_skills, and legacy skills
      const jobRequiredSkills = job.required_skills || [];
      const jobPreferredSkills = job.preferred_skills || [];
      const jobLegacySkills = job.skills || [];
      const allJobSkillsForThisJob = [
        ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
        ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
        ...jobLegacySkills
      ].filter(Boolean);
      if (allJobSkillsForThisJob.length > 0) {
        allJobSkills.push(...this.normalizeSkills(allJobSkillsForThisJob));
      }
    }
    
    // Find missing skills
    const uniqueJobSkills = [...new Set(allJobSkills)];
    for (const jobSkill of uniqueJobSkills) {
      if (!userSkills.some((userSkill: string) => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )) {
        missingSkills.push(jobSkill);
      }
    }
    
    // Identify critical skills (most frequently required)
    const skillFrequency: { [key: string]: number } = {};
    for (const skill of allJobSkills) {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    }
    
    const criticalSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);
    
    return {
      criticalSkills,
      missingSkills,
      jobSkills: uniqueJobSkills
    };
  }

  /**
   * Enhanced course match score with skills gap analysis
   */
  private static calculateEnhancedCourseMatchScore(user: any, course: any, profileAnalysis: any, skillsGapAnalysis: any): { matchScore: number, skillsGap: string[] } {
    let score = 0;
    let factors = 0;
    const skillsGap: string[] = [];

    // Skills gap analysis (50% weight) - Most important for Rwanda job market
    if (user.skills && course.skills) {
      const userSkills = this.normalizeSkills(user.skills);
      const courseSkills = this.normalizeSkills(course.skills);
      
      // Find skills the user doesn't have but the course teaches
      const missingSkills = courseSkills.filter((skill: string) => 
        !userSkills.some((userSkill: string) => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      skillsGap.push(...missingSkills);
      
      // Prioritize courses that teach critical missing skills
      const criticalSkillsMatch = missingSkills.filter((skill: string) => 
        skillsGapAnalysis.criticalSkills.includes(skill)
      ).length;
      
      const skillsGapScore = Math.min(missingSkills.length / Math.max(courseSkills.length, 1), 1);
      const criticalBonus = criticalSkillsMatch * 0.3; // Bonus for critical skills
      
      score += (skillsGapScore + criticalBonus) * 0.5;
      factors += 0.5;
    }

    // Difficulty match (20% weight)
    if (course.difficulty) {
      const userLevel = profileAnalysis.skillLevel;
      let difficultyScore = 0;
      
      switch (course.difficulty) {
        case 'beginner':
          difficultyScore = userLevel <= 2 ? 1 : 0.7;
          break;
        case 'intermediate':
          difficultyScore = userLevel >= 1 && userLevel <= 3 ? 1 : 0.6;
          break;
        case 'advanced':
          difficultyScore = userLevel >= 3 ? 1 : 0.4;
          break;
      }
      
      score += difficultyScore * 0.2;
      factors += 0.2;
    }

    // Category relevance (20% weight)
    if (course.category) {
      const categoryScore = this.calculateCategoryRelevance(user, course.category);
      score += categoryScore * 0.2;
      factors += 0.2;
    }

    // Rwanda context bonus (10% weight)
    const rwandaBonus = this.calculateRwandaCourseBonus(course, profileAnalysis);
    score += rwandaBonus * 0.1;
    factors += 0.1;

    return {
      matchScore: factors > 0 ? score / factors : 0,
      skillsGap
    };
  }

  /**
   * Calculate Rwanda-specific course bonus
   */
  private static calculateRwandaCourseBonus(course: any, profileAnalysis: any): number {
    let bonus = 0;

    // Technical skills bonus for Rwanda job market
    const rwandaTechSkills = ['programming', 'web development', 'mobile development', 'data analysis', 'digital marketing'];
    if (course.skills) {
      const courseSkills = this.normalizeSkills(course.skills);
      const rwandaRelevantSkills = courseSkills.filter((skill: string) => 
        rwandaTechSkills.some((rwandaSkill: string) => skill.includes(rwandaSkill))
      );
      bonus += rwandaRelevantSkills.length * 0.2;
    }

    // Language skills bonus
    if (course.language === 'en' && profileAnalysis.rwandaContext.languageSkills.includes('English')) {
      bonus += 0.2;
    }

    // Soft skills bonus for Rwanda context
    if (course.category === 'soft-skills' || course.category === 'career') {
      bonus += 0.1;
    }

    return Math.min(bonus, 1);
  }

  /**
   * Enhanced course match reasons
   */
  private static getEnhancedCourseMatchReasons(user: any, course: any, matchScore: number, skillsGap: string[], profileAnalysis: any): string[] {
    const reasons: string[] = [];
    
    // Skills gap reasons
    if (skillsGap.length > 0) {
      const criticalSkills = skillsGap.filter(skill => 
        ['programming', 'web development', 'data analysis', 'digital marketing', 'project management'].some(tech => 
          skill.toLowerCase().includes(tech)
        )
      );
      
      if (criticalSkills.length > 0) {
        reasons.push(`Will teach you critical skills: ${criticalSkills.slice(0, 3).join(', ')}`);
      } else {
        reasons.push(`Will help you learn: ${skillsGap.slice(0, 3).join(', ')}`);
      }
    }
    
    // Match quality assessment
    if (matchScore > 0.7) {
      reasons.push('Highly relevant to your career development in Rwanda');
    } else if (matchScore > 0.5) {
      reasons.push('Good learning opportunity for skill development');
    } else {
      reasons.push('Worth exploring for professional growth');
    }
    
    // Difficulty appropriateness
    if (course.difficulty === 'beginner' && profileAnalysis.skillLevel <= 2) {
      reasons.push('Perfect difficulty level for your current skills');
    } else if (course.difficulty === 'intermediate' && profileAnalysis.skillLevel >= 2) {
      reasons.push('Appropriate challenge level for your experience');
    }
    
    // Rwanda job market relevance
    if (course.category === 'technical') {
      reasons.push('Technical skills are in high demand in Rwanda');
    } else if (course.category === 'soft-skills') {
      reasons.push('Soft skills are essential for career advancement');
    } else if (course.category === 'career') {
      reasons.push('Career development skills for professional growth');
    }
    
    // Experience-based reasons
    if (profileAnalysis.experienceYears < 2) {
      reasons.push('Great for building foundational skills');
    } else if (profileAnalysis.experienceYears >= 2) {
      reasons.push('Perfect for advancing your existing skills');
    }
    
    return reasons;
  }

  /**
   * Calculate course match score and identify skills gap
   */
  private static calculateCourseMatchScore(user: any, course: any): { matchScore: number, skillsGap: string[] } {
    let score = 0;
    let factors = 0;
    const skillsGap: string[] = [];

    // Skills gap analysis
    if (user.skills && course.skills) {
      const userSkills = this.normalizeSkills(user.skills);
      const courseSkills = this.normalizeSkills(course.skills);
      
      // Find skills the user doesn't have but the course teaches
      const missingSkills = courseSkills.filter((skill: string) => 
        !userSkills.some((userSkill: string) => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );
      
      skillsGap.push(...missingSkills);
      
      // Score based on how many new skills the course offers
      const newSkillsScore = Math.min(missingSkills.length / Math.max(courseSkills.length, 1), 1);
      score += newSkillsScore * 0.6;
      factors += 0.6;
    }

    // Difficulty match (20% weight)
    if (course.difficulty) {
      const userLevel = this.assessUserSkillLevel(user);
      let difficultyScore = 0;
      
      switch (course.difficulty) {
        case 'beginner':
          difficultyScore = userLevel <= 2 ? 1 : 0.3;
          break;
        case 'intermediate':
          difficultyScore = userLevel >= 1 && userLevel <= 3 ? 1 : 0.5;
          break;
        case 'advanced':
          difficultyScore = userLevel >= 3 ? 1 : 0.2;
          break;
      }
      
      score += difficultyScore * 0.2;
      factors += 0.2;
    }

    // Category relevance (20% weight)
    if (course.category) {
      const categoryScore = this.calculateCategoryRelevance(user, course.category);
      score += categoryScore * 0.2;
      factors += 0.2;
    }

    return {
      matchScore: factors > 0 ? score / factors : 0,
      skillsGap
    };
  }

  /**
   * Calculate years of experience from work history
   */
  private static calculateYearsOfExperience(workExperience: any[]): number {
    if (!workExperience || workExperience.length === 0) return 0;
    
    let totalMonths = 0;
    const currentDate = new Date();
    
    for (const exp of workExperience) {
      const startDate = new Date(exp.start_date);
      const endDate = exp.current ? currentDate : new Date(exp.end_date);
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    }
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate education match score
   */
  private static calculateEducationMatch(education: any[], requirements: string[]): number {
    if (!education || education.length === 0) return 0.5; // Neutral score if no education
    
    const userDegrees = education.map(edu => edu.degree?.toLowerCase() || '');
    const userFields = education.map(edu => edu.field_of_study?.toLowerCase() || '');
    
    let matchCount = 0;
    for (const req of requirements) {
      const reqLower = req.toLowerCase();
      if (userDegrees.some(degree => degree.includes(reqLower) || reqLower.includes(degree)) ||
          userFields.some(field => field.includes(reqLower) || reqLower.includes(field))) {
        matchCount++;
      }
    }
    
    return Math.min(matchCount / Math.max(requirements.length, 1), 1);
  }

  /**
   * Calculate location preference match
   */
  private static calculateLocationMatch(jobPreferences: any, job: any): number {
    if (!jobPreferences.work_locations || jobPreferences.work_locations.length === 0) {
      return 0.5; // Neutral if no preference
    }
    
    const preferredLocations = jobPreferences.work_locations.map((loc: string) => loc.toLowerCase());
    const jobLocation = this.getLocationString(job.location);
    
    // Check for exact match or partial match
    for (const pref of preferredLocations) {
      if (jobLocation.includes(pref) || pref.includes(jobLocation)) {
        return 1;
      }
    }
    
    return 0.3; // Some match for remote jobs
  }

  /**
   * Assess user skill level based on experience and education
   */
  private static assessUserSkillLevel(user: any): number {
    let level = 1; // Beginner by default
    
    // Increase level based on work experience
    const yearsOfExp = this.calculateYearsOfExperience(user.work_experience);
    if (yearsOfExp >= 3) level += 1;
    if (yearsOfExp >= 7) level += 1;
    
    // Increase level based on education
    if (user.education && user.education.length > 0) {
      const hasDegree = user.education.some((edu: any) => 
        edu.degree?.toLowerCase().includes('bachelor') || 
        edu.degree?.toLowerCase().includes('master') ||
        edu.degree?.toLowerCase().includes('phd')
      );
      if (hasDegree) level += 0.5;
    }
    
    // Increase level based on certifications
    if (user.certifications && user.certifications.length > 0) {
      level += 0.3;
    }
    
    return Math.min(level, 4); // Cap at 4 (expert)
  }

  /**
   * Calculate category relevance for courses
   */
  private static calculateCategoryRelevance(user: any, category: string): number {
    const userSkills = this.normalizeSkills(user.skills || []);
    const userExperience = user.work_experience || [];
    
    // Map categories to relevant skills/experience
    const categoryMappings: { [key: string]: string[] } = {
      'technical': ['programming', 'development', 'coding', 'software', 'tech'],
      'soft-skills': ['communication', 'leadership', 'management', 'teamwork'],
      'soft_skills': ['communication', 'leadership', 'management', 'teamwork'],
      'career': ['career', 'professional', 'business'],
      'interview': ['interview', 'interviewing', 'preparation'],
      'resume': ['resume', 'cv', 'application'],
      'networking': ['networking', 'connections', 'professional']
    };
    
    const relevantTerms = categoryMappings[category] || [];
    let matchCount = 0;
    
    for (const term of relevantTerms) {
      if (userSkills.some((skill: string) => skill.includes(term))) {
        matchCount++;
      }
    }
    
    return Math.min(matchCount / Math.max(relevantTerms.length, 1), 1);
  }

  /**
   * Enhanced job match reasons with Rwanda context
   */
  private static getEnhancedJobMatchReasons(user: any, job: any, matchScore: number, profileAnalysis: any): string[] {
    const reasons: string[] = [];
    
    // Match quality assessment
    if (matchScore > 0.8) {
      reasons.push('Excellent match for your profile and career goals');
    } else if (matchScore > 0.6) {
      reasons.push('Strong match for your skills and experience');
    } else if (matchScore > 0.4) {
      reasons.push('Good opportunity to develop your career');
    } else {
      reasons.push('Worth exploring for skill development');
    }
    
    // Skills-based reasons
    // Combine required_skills, preferred_skills, and legacy skills
    const jobRequiredSkills = job.required_skills || [];
    const jobPreferredSkills = job.preferred_skills || [];
    const jobLegacySkills = job.skills || [];
    const allJobSkills = [
      ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobLegacySkills
    ].filter(Boolean);
    
    if (user.skills && allJobSkills.length > 0) {
      const userSkills = this.normalizeSkills(user.skills);
      const jobSkills = this.normalizeSkills(allJobSkills);
      const matchingSkills = userSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.includes(skill) || skill.includes(jobSkill)
        )
      );
      
      if (matchingSkills.length > 0) {
        reasons.push(`Matches ${matchingSkills.length} of your key skills: ${matchingSkills.slice(0, 3).join(', ')}`);
      }
    }
    
    // Experience-based reasons
    if (profileAnalysis.experienceYears >= 3) {
      reasons.push('Your solid work experience aligns well with this role');
    } else if (profileAnalysis.experienceYears >= 1) {
      reasons.push('Your experience level is appropriate for this position');
    } else {
      reasons.push('This entry-level position is perfect for building experience');
    }
    
    // Education-based reasons
    if (profileAnalysis.educationLevel >= 3) {
      reasons.push('Your university education provides a strong foundation');
    }
    
    // Rwanda-specific reasons
    if (profileAnalysis.rwandaContext.languageSkills.includes('Kinyarwanda')) {
      reasons.push('Your Kinyarwanda language skills are valuable in Rwanda');
    }
    if (profileAnalysis.rwandaContext.languageSkills.includes('English')) {
      reasons.push('English proficiency is essential for this role');
    }
    if (profileAnalysis.rwandaContext.localExperience) {
      reasons.push('Your local Rwanda experience is a significant advantage');
    }
    
    // Career stage reasons
    if (profileAnalysis.careerStage === 'entry' && job.experience_level === 'entry') {
      reasons.push('Perfect entry-level opportunity to start your career');
    } else if (profileAnalysis.careerStage === 'mid' && job.experience_level === 'mid') {
      reasons.push('Great mid-level opportunity for career advancement');
    }
    
    // Strengths highlighting
    if (profileAnalysis.strengths.length > 0) {
      reasons.push(`Leverages your strengths: ${profileAnalysis.strengths.slice(0, 2).join(', ')}`);
    }
    
    return reasons;
  }

  /**
   * Generate reasons for job match
   */
  private static getJobMatchReasons(user: any, job: any, matchScore: number): string[] {
    const reasons: string[] = [];
    
    if (matchScore > 0.7) {
      reasons.push('Excellent match for your profile');
    } else if (matchScore > 0.5) {
      reasons.push('Good match for your skills');
    } else {
      reasons.push('Potential opportunity to explore');
    }
    
    // Add specific reasons based on match factors
    // Combine required_skills, preferred_skills, and legacy skills
    const jobRequiredSkills = job.required_skills || [];
    const jobPreferredSkills = job.preferred_skills || [];
    const jobLegacySkills = job.skills || [];
    const allJobSkills = [
      ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobLegacySkills
    ].filter(Boolean);
    
    if (user.skills && allJobSkills.length > 0) {
      const userSkills = this.normalizeSkills(user.skills);
      const jobSkills = this.normalizeSkills(allJobSkills);
      const matchingSkills = userSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.includes(skill) || skill.includes(jobSkill)
        )
      );
      
      if (matchingSkills.length > 0) {
        reasons.push(`Matches ${matchingSkills.length} of your skills`);
      }
    }
    
    if (user.work_experience && user.work_experience.length > 0) {
      const yearsOfExp = this.calculateYearsOfExperience(user.work_experience);
      if (yearsOfExp >= 3) {
        reasons.push('Your experience level aligns well');
      }
    }
    
    return reasons;
  }

  /**
   * Generate reasons for course match
   */
  private static getCourseMatchReasons(user: any, course: any, matchScore: number, skillsGap: string[]): string[] {
    const reasons: string[] = [];
    
    if (skillsGap.length > 0) {
      reasons.push(`Will help you learn: ${skillsGap.slice(0, 3).join(', ')}`);
    }
    
    if (matchScore > 0.6) {
      reasons.push('Highly relevant to your career goals');
    } else if (matchScore > 0.4) {
      reasons.push('Good learning opportunity');
    } else {
      reasons.push('Worth exploring for skill development');
    }
    
    if (course.difficulty) {
      const userLevel = this.assessUserSkillLevel(user);
      if (course.difficulty === 'beginner' && userLevel <= 2) {
        reasons.push('Perfect difficulty level for you');
      } else if (course.difficulty === 'intermediate' && userLevel >= 2) {
        reasons.push('Appropriate challenge level');
      }
    }
    
    return reasons;
  }

  /**
   * Check if job has keywords that match user profile (for broad recommendations)
   * If keywords match, job is recommended to all related job seekers
   */
  private static checkKeywordMatch(user: any, job: any): boolean {
    // Extract keywords from job (title, description, skills, category)
    const jobText = `${job.title || ''} ${job.description || ''} ${job.short_description || ''} ${job.category || ''}`.toLowerCase();
    // Combine required_skills, preferred_skills, and legacy skills
    const jobRequiredSkills = job.required_skills || [];
    const jobPreferredSkills = job.preferred_skills || [];
    const jobLegacySkills = job.skills || [];
    const allJobSkills = [
      ...jobRequiredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobPreferredSkills.map((s: any) => typeof s === 'string' ? s : s.name),
      ...jobLegacySkills
    ].filter(Boolean);
    const jobSkills = this.normalizeSkills(allJobSkills);
    const jobKeywords = [...jobSkills, ...jobText.split(/\s+/).filter(word => word.length > 3)];
    
    // Extract keywords from user profile
    const userSkills = this.normalizeSkills(user.skills || []);
    const userEducation = (user.education || []).map((edu: any) => 
      `${edu.degree || ''} ${edu.field_of_study || ''}`.toLowerCase()
    ).join(' ');
    const userText = `${user.bio || ''} ${userEducation}`.toLowerCase();
    const userKeywords = [...userSkills, ...userText.split(/\s+/).filter(word => word.length > 3)];
    
    // Check for keyword matches
    // If at least 2 keywords match, consider it a keyword boost
    let matchCount = 0;
    for (const jobKeyword of jobKeywords) {
      if (userKeywords.some(userKeyword => 
        userKeyword.includes(jobKeyword) || 
        jobKeyword.includes(userKeyword) ||
        this.areSimilarKeywords(userKeyword, jobKeyword)
      )) {
        matchCount++;
        if (matchCount >= 2) {
          return true;
        }
      }
    }
    
    // Also check for common industry keywords
    const commonKeywords = [
      'business', 'marketing', 'sales', 'operations', 'management',
      'technology', 'software', 'development', 'programming', 'tech',
      'finance', 'accounting', 'banking', 'financial',
      'education', 'teaching', 'training', 'academic',
      'healthcare', 'medical', 'health', 'hospital',
      'communication', 'media', 'journalism', 'content',
      'engineering', 'design', 'architecture', 'construction',
      'customer', 'service', 'support', 'client',
      'project', 'coordination', 'planning', 'strategy',
      'data', 'analysis', 'analytics', 'research'
    ];
    
    const jobHasCommonKeyword = commonKeywords.some(keyword => 
      jobText.includes(keyword) || jobSkills.some((skill: string) => skill.includes(keyword))
    );
    const userHasCommonKeyword = commonKeywords.some(keyword => 
      userText.includes(keyword) || userSkills.some((skill: string) => skill.includes(keyword))
    );
    
    // If both job and user have matching common keywords, boost recommendation
    if (jobHasCommonKeyword && userHasCommonKeyword) {
      const matchingCommonKeywords = commonKeywords.filter(keyword => 
        (jobText.includes(keyword) || jobSkills.some((skill: string) => skill.includes(keyword))) &&
        (userText.includes(keyword) || userSkills.some((skill: string) => skill.includes(keyword)))
      );
      
      if (matchingCommonKeywords.length >= 1) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if two keywords are similar (fuzzy matching)
   */
  private static areSimilarKeywords(keyword1: string, keyword2: string): boolean {
    const k1 = keyword1.toLowerCase().trim();
    const k2 = keyword2.toLowerCase().trim();
    
    // Exact match
    if (k1 === k2) return true;
    
    // One contains the other
    if (k1.includes(k2) || k2.includes(k1)) return true;
    
    // Check for common variations
    const variations: { [key: string]: string[] } = {
      'programming': ['coding', 'development', 'software'],
      'marketing': ['advertising', 'promotion', 'branding'],
      'management': ['admin', 'administration', 'coordination'],
      'communication': ['communications', 'interpersonal'],
      'business': ['commerce', 'trade', 'enterprise'],
      'technology': ['tech', 'it', 'ict'],
      'data': ['analytics', 'analysis', 'research'],
      'customer': ['client', 'consumer', 'user'],
      'project': ['program', 'initiative', 'venture']
    };
    
    for (const [base, variants] of Object.entries(variations)) {
      if ((k1.includes(base) || variants.some(v => k1.includes(v))) &&
          (k2.includes(base) || variants.some(v => k2.includes(v)))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate areas of improvement for job seeker to get recommended
   */
  private static calculateAreasOfImprovement(user: any, job: any, profileAnalysis: any): string[] {
    const improvements: string[] = [];
    
    // Check missing skills
    const userSkills = this.normalizeSkills(user.skills || []);
    const jobRequiredSkills = this.normalizeSkills(job.required_skills || job.skills || []);
    const missingSkills = jobRequiredSkills.filter((jobSkill: string) => 
      !userSkills.some((userSkill: string) => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )
    );
    
    if (missingSkills.length > 0) {
      improvements.push(`Add these skills to your profile: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    
    // Check experience level
    const jobExperienceLevel = job.experience_level || 'mid';
    const userExperienceYears = profileAnalysis.experienceYears;
    
    if (jobExperienceLevel === 'mid' && userExperienceYears < 1) {
      improvements.push('Gain at least 1-2 years of work experience');
    } else if (jobExperienceLevel === 'senior' && userExperienceYears < 3) {
      improvements.push(`Gain more experience (currently ${userExperienceYears} years, target: 3+ years)`);
    } else if (jobExperienceLevel === 'entry' && userExperienceYears > 3) {
      improvements.push('Consider highlighting your willingness to take entry-level roles');
    }
    
    // Check education requirements
    const jobRequirements = (job.requirements || []).map((req: any) => 
      typeof req === 'string' ? req : req.description || ''
    ).join(' ').toLowerCase();
    
    const hasDegreeRequirement = jobRequirements.includes('bachelor') || 
                                 jobRequirements.includes('degree') || 
                                 jobRequirements.includes('university');
    
    if (hasDegreeRequirement && profileAnalysis.educationLevel < 3) {
      improvements.push('Consider pursuing a Bachelor\'s degree or equivalent');
    }
    
    // Check language requirements
    const jobText = `${job.description || ''} ${job.requirements || []}`.toLowerCase();
    const requiresEnglish = jobText.includes('english') || jobText.includes('fluent english');
    const requiresKinyarwanda = jobText.includes('kinyarwanda') || jobText.includes('rwanda');
    
    if (requiresEnglish && !profileAnalysis.rwandaContext.languageSkills.includes('English')) {
      improvements.push('Improve your English proficiency');
    }
    
    if (requiresKinyarwanda && !profileAnalysis.rwandaContext.languageSkills.includes('Kinyarwanda')) {
      improvements.push('Add Kinyarwanda language skills to your profile');
    }
    
    // Check location preference
    const jobLocation = this.getLocationString(job.location);
    const userLocation = typeof profileAnalysis.rwandaContext.location === 'string' 
      ? profileAnalysis.rwandaContext.location.toLowerCase()
      : (profileAnalysis.rwandaContext.location?.country || profileAnalysis.rwandaContext.location?.street || '').toLowerCase();
    
    if (jobLocation.includes('kigali') && !userLocation.includes('kigali')) {
      improvements.push('Consider updating your location preference to include Kigali');
    }
    
    // Check for incomplete profile
    if (!user.bio || user.bio.length < 50) {
      improvements.push('Complete your profile bio (at least 50 characters)');
    }
    
    if (!user.skills || user.skills.length < 3) {
      improvements.push('Add more skills to your profile (at least 3-5 relevant skills)');
    }
    
    if (!user.work_experience || user.work_experience.length === 0) {
      improvements.push('Add work experience to your profile');
    }
    
    // Check certifications
    const jobTextLower = jobText;
    const requiresCertification = jobTextLower.includes('certification') || 
                                 jobTextLower.includes('certified') ||
                                 jobTextLower.includes('certificate');
    
    if (requiresCertification && (!user.certifications || user.certifications.length === 0)) {
      improvements.push('Consider obtaining relevant professional certifications');
    }
    
    return improvements.slice(0, 5); // Limit to top 5 improvements
  }
}
