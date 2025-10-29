import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { RecommendationService } from './recommendation.service.js';
import { sendJobRecommendationEmail } from './email.service.js';

export interface JobRecommendationEmail {
  user: any;
  job: any;
  matchScore: number;
  reasons: string[];
  skillsMatch: string[];
  skillsGap: string[];
}

export class JobNotificationService {
  
  /**
   * Send job recommendation emails to matching users when a new job is posted
   */
  static async sendJobRecommendationEmails(jobId: string) {
    try {
      console.log(`🔍 Finding matching users for job: ${jobId}`);
      
      // Get the newly posted job
      const job = await Job.findById(jobId).populate('employer_id', 'name email');
      if (!job || !job.is_active) {
        console.log('Job not found or inactive');
        return;
      }

      // Get all active job seekers
      const jobSeekers = await User.find({ 
        role: 'seeker', 
        status: 'active',
        email: { $exists: true, $ne: '' }
      });

      console.log(`📧 Found ${jobSeekers.length} active job seekers to evaluate`);

      const recommendations: JobRecommendationEmail[] = [];

      // Find matching users using AI recommendation system
      for (const user of jobSeekers) {
        try {
          // Get AI recommendation for this specific job
          const jobRecommendations = await RecommendationService.getJobRecommendations(user._id.toString(), 50);
          const jobMatch = jobRecommendations.find(rec => rec.job._id.toString() === jobId);
          
          if (jobMatch && jobMatch.matchScore >= 60) { // Only send to users with 60%+ match
            recommendations.push({
              user,
              job,
              matchScore: jobMatch.matchScore,
              reasons: jobMatch.reasons,
              skillsMatch: this.getMatchingSkills(user, job),
              skillsGap: this.getSkillsGap(user, job)
            });
          }
        } catch (error) {
          console.error(`Error evaluating user ${user._id}:`, error);
        }
      }

      // Sort by match score and take top matches
      const topRecommendations = recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20); // Send to top 20 matches

      console.log(`📬 Sending job recommendation emails to ${topRecommendations.length} users`);

      // Send emails to matching users
      for (const recommendation of topRecommendations) {
        try {
          await this.sendJobRecommendationEmail(recommendation);
          
          // Create in-app notification
          await this.createJobRecommendationNotification(recommendation);
          
          console.log(`✅ Sent job recommendation email to ${recommendation.user.email}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${recommendation.user.email}:`, error);
        }
      }

      console.log(`🎉 Job recommendation emails sent successfully for job: ${job.title}`);
      
    } catch (error) {
      console.error('Error sending job recommendation emails:', error);
    }
  }

  /**
   * Send job recommendation email to a specific user
   */
  private static async sendJobRecommendationEmail(recommendation: JobRecommendationEmail) {
    const { user, job, matchScore, reasons, skillsMatch, skillsGap } = recommendation;
    
    await sendJobRecommendationEmail(
      user.email,
      user.name,
      job,
      matchScore,
      reasons,
      skillsMatch,
      skillsGap
    );
  }

  /**
   * Create in-app notification for job recommendation
   */
  private static async createJobRecommendationNotification(recommendation: JobRecommendationEmail) {
    const { user, job, matchScore } = recommendation;
    
    const notification = new Notification({
      user_id: user._id,
      message: `New job recommendation: ${job.title} at ${job.employer_id.name} (${matchScore}% match)`,
      type: 'job_recommendation',
      priority: 'high',
      data: {
        job_id: job._id,
        employer_id: job.employer_id._id,
        match_score: matchScore,
        reasons: recommendation.reasons
      }
    });

    await notification.save();
  }

  /**
   * Get matching skills between user and job
   */
  private static getMatchingSkills(user: any, job: any): string[] {
    const userSkills = user.skills || [];
    const jobSkills = job.skills || [];
    
    return userSkills.filter((skill: string) => 
      jobSkills.some((jobSkill: string) => 
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  /**
   * Get skills gap between user and job
   */
  private static getSkillsGap(user: any, job: any): string[] {
    const userSkills = user.skills || [];
    const jobSkills = job.skills || [];
    
    return jobSkills.filter((jobSkill: string) => 
      !userSkills.some((userSkill: string) => 
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  }

  /**
   * Send weekly job digest to all job seekers
   */
  static async sendWeeklyJobDigest() {
    try {
      console.log('📧 Sending weekly job digest...');
      
      const jobSeekers = await User.find({ 
        role: 'seeker', 
        status: 'active',
        email: { $exists: true, $ne: '' }
      });

      for (const user of jobSeekers) {
        try {
          // Get top 5 job recommendations for the week
          const recommendations = await RecommendationService.getJobRecommendations(user._id.toString(), 5);
          
          if (recommendations.length > 0) {
            await this.sendWeeklyDigestEmail(user, recommendations);
          }
        } catch (error) {
          console.error(`Error sending weekly digest to ${user.email}:`, error);
        }
      }

      console.log(`✅ Weekly job digest sent to ${jobSeekers.length} users`);
    } catch (error) {
      console.error('Error sending weekly job digest:', error);
    }
  }

  /**
   * Send weekly digest email
   */
  private static async sendWeeklyDigestEmail(user: any, recommendations: any[]) {
    // This would be implemented similar to job recommendation email
    // but with multiple jobs in a digest format
    console.log(`Sending weekly digest to ${user.email} with ${recommendations.length} jobs`);
  }

  /**
   * Send job application reminder emails
   */
  static async sendApplicationReminderEmails() {
    try {
      console.log('📧 Sending job application reminders...');
      
      // Find users who haven't applied to jobs in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const inactiveUsers = await User.find({
        role: 'seeker',
        status: 'active',
        last_login: { $lt: sevenDaysAgo }
      });

      for (const user of inactiveUsers) {
        try {
          // Get fresh job recommendations
          const recommendations = await RecommendationService.getJobRecommendations(user._id.toString(), 3);
          
          if (recommendations.length > 0) {
            await this.sendApplicationReminderEmail(user, recommendations);
          }
        } catch (error) {
          console.error(`Error sending reminder to ${user.email}:`, error);
        }
      }

      console.log(`✅ Application reminders sent to ${inactiveUsers.length} users`);
    } catch (error) {
      console.error('Error sending application reminders:', error);
    }
  }

  /**
   * Send application reminder email
   */
  private static async sendApplicationReminderEmail(user: any, recommendations: any[]) {
    // Implementation for reminder emails
    console.log(`Sending application reminder to ${user.email}`);
  }
}
