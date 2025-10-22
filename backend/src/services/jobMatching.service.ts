import { User } from '../models/User.js';
import { Job } from '../models/Job.js';

export interface JobMatch {
  job: any;
  score: number;
  reasons: string[];
}

export class JobMatchingService {
  /**
   * Find matching jobs for a job seeker based on their profile
   */
  public static async findMatchingJobs(userId: string, limit: number = 10): Promise<JobMatch[]> {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'seeker') {
        return [];
      }

      const jobs = await Job.find({ is_active: true }).populate('employer_id', 'name email');
      const matches: JobMatch[] = [];

      for (const job of jobs) {
        const score = this.calculateMatchScore(user, job);
        if (score > 0) {
          matches.push({
            job,
            score,
            reasons: this.getMatchReasons(user, job)
          });
        }
      }

      // Sort by score (highest first) and return top matches
      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding matching jobs:', error);
      return [];
    }
  }

  /**
   * Calculate match score between user profile and job requirements
   */
  public static calculateMatchScore(user: any, job: any): number {
    let score = 0;
    const maxScore = 100;

    // Skills matching (40% weight)
    const skillsMatch = this.calculateSkillsMatch(user.skills || [], job.skills || []);
    score += skillsMatch * 0.4;

    // Education matching (20% weight)
    const educationMatch = this.calculateEducationMatch(user.education || [], job);
    score += educationMatch * 0.2;

    // Experience matching (25% weight)
    const experienceMatch = this.calculateExperienceMatch(user.work_experience || [], job);
    score += experienceMatch * 0.25;

    // Job preferences matching (15% weight)
    const preferencesMatch = this.calculatePreferencesMatch(user.job_preferences || {}, job);
    score += preferencesMatch * 0.15;

    return Math.min(Math.round(score), maxScore);
  }

  /**
   * Calculate skills match percentage
   */
  private static calculateSkillsMatch(userSkills: string[], jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 50; // Neutral score if no job skills specified
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkillsLower.filter(jobSkill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )
    );

    return (matchingSkills.length / jobSkills.length) * 100;
  }

  /**
   * Calculate education match based on job requirements
   */
  private static calculateEducationMatch(userEducation: any[], job: any): number {
    if (!userEducation || userEducation.length === 0) return 30; // Lower score if no education
    
    // Check if user has relevant degree/field
    const hasRelevantEducation = userEducation.some(edu => {
      const field = edu.field_of_study?.toLowerCase() || '';
      const degree = edu.degree?.toLowerCase() || '';
      
      // Match against job title and description
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      
      return field.includes('computer') || field.includes('technology') || 
             field.includes('business') || field.includes('engineering') ||
             degree.includes('bachelor') || degree.includes('master');
    });

    return hasRelevantEducation ? 80 : 40;
  }

  /**
   * Calculate experience match
   */
  private static calculateExperienceMatch(userExperience: any[], job: any): number {
    if (!userExperience || userExperience.length === 0) return 20; // Lower score if no experience
    
    const totalExperienceYears = this.calculateTotalExperienceYears(userExperience);
    const jobExperienceLevel = this.getJobExperienceLevel(job);
    
    // Match experience level with job requirements
    if (jobExperienceLevel === 'entry' && totalExperienceYears <= 2) return 90;
    if (jobExperienceLevel === 'mid' && totalExperienceYears >= 2 && totalExperienceYears <= 5) return 90;
    if (jobExperienceLevel === 'senior' && totalExperienceYears >= 5) return 90;
    
    // Partial matches
    if (jobExperienceLevel === 'entry' && totalExperienceYears > 2) return 70;
    if (jobExperienceLevel === 'mid' && totalExperienceYears < 2) return 60;
    if (jobExperienceLevel === 'senior' && totalExperienceYears < 5) return 50;
    
    return 40;
  }

  /**
   * Calculate job preferences match
   */
  private static calculatePreferencesMatch(userPreferences: any, job: any): number {
    let score = 50; // Base score
    
    // Check job type preference
    if (userPreferences.job_types && userPreferences.job_types.length > 0) {
      const jobTypeMatch = userPreferences.job_types.includes(job.type);
      score += jobTypeMatch ? 20 : -10;
    }
    
    // Check location preference
    if (userPreferences.work_locations && userPreferences.work_locations.length > 0) {
      const locationMatch = userPreferences.work_locations.some((loc: string) => 
        job.location?.toLowerCase().includes(loc.toLowerCase())
      );
      score += locationMatch ? 15 : -5;
    }
    
    // Check remote preference
    if (userPreferences.remote_preference) {
      const remoteMatch = this.checkRemotePreference(userPreferences.remote_preference, job.type);
      score += remoteMatch ? 15 : -5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate total years of experience
   */
  private static calculateTotalExperienceYears(workExperience: any[]): number {
    let totalYears = 0;
    const currentDate = new Date();
    
    for (const exp of workExperience) {
      const startDate = new Date(exp.start_date);
      const endDate = exp.current ? currentDate : new Date(exp.end_date);
      const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalYears += Math.max(0, years);
    }
    
    return Math.round(totalYears * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Get job experience level from job data
   */
  private static getJobExperienceLevel(job: any): string {
    return job.experience_level || 'mid';
  }

  /**
   * Check if remote preference matches job type
   */
  private static checkRemotePreference(userPreference: string, jobType: string): boolean {
    if (userPreference === 'flexible') return true;
    if (userPreference === 'remote' && jobType === 'remote') return true;
    if (userPreference === 'onsite' && jobType === 'onsite') return true;
    if (userPreference === 'hybrid' && (jobType === 'hybrid' || jobType === 'remote')) return true;
    return false;
  }

  /**
   * Get reasons why a job matches
   */
  public static getMatchReasons(user: any, job: any): string[] {
    const reasons: string[] = [];
    
    // Skills match
    const userSkills = user.skills || [];
    const jobSkills = job.skills || [];
    const matchingSkills = jobSkills.filter((jobSkill: string) => 
      userSkills.some((userSkill: string) => 
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    if (matchingSkills.length > 0) {
      reasons.push(`Matches ${matchingSkills.length} required skills: ${matchingSkills.join(', ')}`);
    }
    
    // Experience match
    const totalExperience = this.calculateTotalExperienceYears(user.work_experience || []);
    const jobLevel = this.getJobExperienceLevel(job);
    
    if (jobLevel === 'entry' && totalExperience <= 2) {
      reasons.push('Perfect for entry-level position');
    } else if (jobLevel === 'mid' && totalExperience >= 2 && totalExperience <= 5) {
      reasons.push('Matches mid-level experience requirements');
    } else if (jobLevel === 'senior' && totalExperience >= 5) {
      reasons.push('Meets senior-level experience requirements');
    }
    
    // Education match
    const hasRelevantEducation = user.education?.some((edu: any) => 
      edu.field_of_study?.toLowerCase().includes('computer') ||
      edu.field_of_study?.toLowerCase().includes('technology') ||
      edu.degree?.toLowerCase().includes('bachelor')
    );
    
    if (hasRelevantEducation) {
      reasons.push('Has relevant educational background');
    }
    
    // Location match
    if (user.job_preferences?.work_locations?.length > 0) {
      const locationMatch = user.job_preferences.work_locations.some((loc: string) => 
        job.location?.toLowerCase().includes(loc.toLowerCase())
      );
      if (locationMatch) {
        reasons.push('Matches preferred work location');
      }
    }
    
    return reasons;
  }
}
