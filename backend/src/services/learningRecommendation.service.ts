import { LearningResource } from '../models/LearningResource.js';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';

export interface LearningRecommendation {
  resource: any;
  relevanceScore: number;
  reasons: string[];
  skillGap: string[];
}

export class LearningRecommendationService {
  /**
   * Get learning recommendations for a user based on their profile and job market
   */
  public static async getLearningRecommendations(userId: string, limit: number = 10): Promise<LearningRecommendation[]> {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'seeker') {
        return [];
      }

      // Get all active learning resources
      const resources = await LearningResource.find({ is_active: true });
      
      // Get recent job postings to understand market demands
      const recentJobs = await Job.find({ is_active: true })
        .sort({ created_at: -1 })
        .limit(50);

      const recommendations: LearningRecommendation[] = [];

      for (const resource of resources) {
        const relevanceScore = this.calculateRelevanceScore(user, resource, recentJobs);
        if (relevanceScore > 0) {
          recommendations.push({
            resource,
            relevanceScore,
            reasons: this.getRecommendationReasons(user, resource, recentJobs),
            skillGap: this.identifySkillGaps(user, resource, recentJobs)
          });
        }
      }

      // Sort by relevance score and return top recommendations
      return recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      return [];
    }
  }

  /**
   * Get learning recommendations for a specific job
   */
  public static async getJobSpecificRecommendations(jobId: string, userId: string, limit: number = 5): Promise<LearningRecommendation[]> {
    try {
      const job = await Job.findById(jobId);
      const user = await User.findById(userId);
      
      if (!job || !user) {
        return [];
      }

      const resources = await LearningResource.find({ is_active: true });
      const recommendations: LearningRecommendation[] = [];

      for (const resource of resources) {
        const relevanceScore = this.calculateJobSpecificRelevance(user, job, resource);
        if (relevanceScore > 0) {
          recommendations.push({
            resource,
            relevanceScore,
            reasons: this.getJobSpecificReasons(user, job, resource),
            skillGap: this.identifyJobSpecificSkillGaps(user, job, resource)
          });
        }
      }

      return recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting job-specific recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score for a learning resource
   */
  private static calculateRelevanceScore(user: any, resource: any, recentJobs: any[]): number {
    let score = 0;

    // Skills gap analysis (40% weight)
    const skillsGapScore = this.calculateSkillsGapScore(user.skills || [], resource.skills || []);
    score += skillsGapScore * 0.4;

    // Market demand analysis (30% weight)
    const marketDemandScore = this.calculateMarketDemandScore(resource, recentJobs);
    score += marketDemandScore * 0.3;

    // User experience level match (20% weight)
    const experienceMatchScore = this.calculateExperienceMatchScore(user, resource);
    score += experienceMatchScore * 0.2;

    // Category relevance (10% weight)
    const categoryScore = this.calculateCategoryRelevanceScore(user, resource);
    score += categoryScore * 0.1;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate job-specific relevance score
   */
  private static calculateJobSpecificRelevance(user: any, job: any, resource: any): number {
    let score = 0;

    // Direct skills match with job requirements (50% weight)
    const jobSkillsMatch = this.calculateJobSkillsMatch(job.skills || [], resource.skills || []);
    score += jobSkillsMatch * 0.5;

    // User's current skills vs job requirements gap (30% weight)
    const skillGapScore = this.calculateSkillGapForJob(user.skills || [], job.skills || [], resource.skills || []);
    score += skillGapScore * 0.3;

    // Resource difficulty vs job level (20% weight)
    const difficultyMatch = this.calculateDifficultyMatch(job, resource);
    score += difficultyMatch * 0.2;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate skills gap score
   */
  private static calculateSkillsGapScore(userSkills: string[], resourceSkills: string[]): number {
    if (!resourceSkills || resourceSkills.length === 0) return 30;

    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const resourceSkillsLower = resourceSkills.map(s => s.toLowerCase());
    
    // Find skills that user doesn't have but resource teaches
    const missingSkills = resourceSkillsLower.filter((resourceSkill: string) => 
      !userSkillsLower.some((userSkill: string) => 
        userSkill.includes(resourceSkill) || resourceSkill.includes(userSkill)
      )
    );

    // Higher score for resources that teach skills user doesn't have
    return (missingSkills.length / resourceSkills.length) * 100;
  }

  /**
   * Calculate market demand score
   */
  private static calculateMarketDemandScore(resource: any, recentJobs: any[]): number {
    if (!recentJobs || recentJobs.length === 0) return 50;

    const resourceSkills = resource.skills || [];
    let demandScore = 0;

    for (const job of recentJobs) {
      const jobSkills = job.skills || [];
      const matchingSkills = resourceSkills.filter((resourceSkill: string) =>
        jobSkills.some((jobSkill: string) =>
          jobSkill.toLowerCase().includes(resourceSkill.toLowerCase()) ||
          resourceSkill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      demandScore += (matchingSkills.length / jobSkills.length) * 100;
    }

    return Math.min(demandScore / recentJobs.length, 100);
  }

  /**
   * Calculate experience level match
   */
  private static calculateExperienceMatchScore(user: any, resource: any): number {
    const userExperience = this.calculateUserExperienceLevel(user);
    const resourceDifficulty = resource.difficulty || 'beginner';

    if (userExperience === 'beginner' && resourceDifficulty === 'beginner') return 90;
    if (userExperience === 'intermediate' && resourceDifficulty === 'intermediate') return 90;
    if (userExperience === 'advanced' && resourceDifficulty === 'advanced') return 90;
    
    // Partial matches
    if (userExperience === 'beginner' && resourceDifficulty === 'intermediate') return 70;
    if (userExperience === 'intermediate' && resourceDifficulty === 'advanced') return 70;
    if (userExperience === 'intermediate' && resourceDifficulty === 'beginner') return 60;
    if (userExperience === 'advanced' && resourceDifficulty === 'intermediate') return 60;
    
    return 40;
  }

  /**
   * Calculate category relevance
   */
  private static calculateCategoryRelevanceScore(user: any, resource: any): number {
    const userEducation = user.education || [];
    const userExperience = user.work_experience || [];
    
    // Higher score for career/interview resources for job seekers
    if (resource.category === 'career' || resource.category === 'interview') return 80;
    
    // Technical resources for users with technical background
    if (resource.category === 'technical') {
      const hasTechnicalBackground = userEducation.some((edu: any) => 
        edu.field_of_study?.toLowerCase().includes('computer') ||
        edu.field_of_study?.toLowerCase().includes('technology') ||
        edu.field_of_study?.toLowerCase().includes('engineering')
      );
      return hasTechnicalBackground ? 80 : 60;
    }
    
    // Soft skills for all users
    if (resource.category === 'soft-skills') return 70;
    
    return 50;
  }

  /**
   * Calculate job skills match
   */
  private static calculateJobSkillsMatch(jobSkills: string[], resourceSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 30;
    if (!resourceSkills || resourceSkills.length === 0) return 30;

    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const resourceSkillsLower = resourceSkills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkillsLower.filter((jobSkill: string) =>
      resourceSkillsLower.some((resourceSkill: string) =>
        jobSkill.includes(resourceSkill) || resourceSkill.includes(jobSkill)
      )
    );

    return (matchingSkills.length / jobSkills.length) * 100;
  }

  /**
   * Calculate skill gap for specific job
   */
  private static calculateSkillGapForJob(userSkills: string[], jobSkills: string[], resourceSkills: string[]): number {
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const resourceSkillsLower = resourceSkills.map(s => s.toLowerCase());
    
    // Find job skills that user doesn't have
    const missingJobSkills = jobSkillsLower.filter((jobSkill: string) =>
      !userSkillsLower.some((userSkill: string) =>
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )
    );
    
    // Find how many of these missing skills the resource teaches
    const coveredSkills = missingJobSkills.filter((missingSkill: string) =>
      resourceSkillsLower.some((resourceSkill: string) =>
        resourceSkill.includes(missingSkill) || missingSkill.includes(resourceSkill)
      )
    );

    return missingJobSkills.length > 0 ? (coveredSkills.length / missingJobSkills.length) * 100 : 50;
  }

  /**
   * Calculate difficulty match for job
   */
  private static calculateDifficultyMatch(job: any, resource: any): number {
    const jobLevel = job.experience_level || 'mid';
    const resourceDifficulty = resource.difficulty || 'beginner';

    if (jobLevel === 'entry' && resourceDifficulty === 'beginner') return 90;
    if (jobLevel === 'mid' && resourceDifficulty === 'intermediate') return 90;
    if (jobLevel === 'senior' && resourceDifficulty === 'advanced') return 90;
    
    return 60;
  }

  /**
   * Calculate user experience level
   */
  private static calculateUserExperienceLevel(user: any): string {
    const totalExperience = this.calculateTotalExperienceYears(user.work_experience || []);
    
    if (totalExperience === 0) return 'beginner';
    if (totalExperience < 3) return 'beginner';
    if (totalExperience < 7) return 'intermediate';
    return 'advanced';
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
    
    return Math.round(totalYears * 10) / 10;
  }

  /**
   * Get recommendation reasons
   */
  private static getRecommendationReasons(user: any, resource: any, recentJobs: any[]): string[] {
    const reasons: string[] = [];
    
    // Skills gap reasons
    const userSkills = user.skills || [];
    const resourceSkills = resource.skills || [];
    const missingSkills = resourceSkills.filter((resourceSkill: string) =>
      !userSkills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(resourceSkill.toLowerCase()) ||
        resourceSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    if (missingSkills.length > 0) {
      reasons.push(`Teaches ${missingSkills.length} skills you don't have: ${missingSkills.join(', ')}`);
    }
    
    // Market demand reasons
    const marketDemand = this.calculateMarketDemandScore(resource, recentJobs);
    if (marketDemand > 70) {
      reasons.push('High demand skill in current job market');
    }
    
    // Category reasons
    if (resource.category === 'career' || resource.category === 'interview') {
      reasons.push('Essential for job search and career development');
    }
    
    if (resource.category === 'technical') {
      reasons.push('Technical skills are highly valued by employers');
    }
    
    if (resource.category === 'soft-skills') {
      reasons.push('Soft skills are crucial for workplace success');
    }
    
    return reasons;
  }

  /**
   * Get job-specific reasons
   */
  private static getJobSpecificReasons(user: any, job: any, resource: any): string[] {
    const reasons: string[] = [];
    
    const jobSkills = job.skills || [];
    const userSkills = user.skills || [];
    const resourceSkills = resource.skills || [];
    
    // Find job skills that user doesn't have
    const missingJobSkills = jobSkills.filter((jobSkill: string) =>
      !userSkills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    // Find skills the resource teaches that are needed for the job
    const relevantSkills = missingJobSkills.filter((missingSkill: string) =>
      resourceSkills.some((resourceSkill: string) =>
        resourceSkill.toLowerCase().includes(missingSkill.toLowerCase()) ||
        missingSkill.toLowerCase().includes(resourceSkill.toLowerCase())
      )
    );
    
    if (relevantSkills.length > 0) {
      reasons.push(`Teaches job-required skills: ${relevantSkills.join(', ')}`);
    }
    
    if (resource.category === 'interview') {
      reasons.push('Will help you prepare for job interviews');
    }
    
    if (resource.category === 'resume') {
      reasons.push('Will help you create a better resume');
    }
    
    return reasons;
  }

  /**
   * Identify skill gaps
   */
  private static identifySkillGaps(user: any, resource: any, recentJobs: any[]): string[] {
    const userSkills = user.skills || [];
    const resourceSkills = resource.skills || [];
    
    return resourceSkills.filter((resourceSkill: string) =>
      !userSkills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(resourceSkill.toLowerCase()) ||
        resourceSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  }

  /**
   * Identify job-specific skill gaps
   */
  private static identifyJobSpecificSkillGaps(user: any, job: any, resource: any): string[] {
    const userSkills = user.skills || [];
    const jobSkills = job.skills || [];
    const resourceSkills = resource.skills || [];
    
    // Find job skills that user doesn't have
    const missingJobSkills = jobSkills.filter((jobSkill: string) =>
      !userSkills.some((userSkill: string) =>
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    // Find which of these missing skills the resource teaches
    return missingJobSkills.filter((missingSkill: string) =>
      resourceSkills.some((resourceSkill: string) =>
        resourceSkill.toLowerCase().includes(missingSkill.toLowerCase()) ||
        missingSkill.toLowerCase().includes(resourceSkill.toLowerCase())
      )
    );
  }
}
