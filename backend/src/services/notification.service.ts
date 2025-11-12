import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { LearningResource } from '../models/LearningResource.js';
import { RecommendationService } from './recommendation.service.js';
import { 
  createJobRecommendationNotification, 
  createCourseRecommendationNotification 
} from '../controllers/notification.controller.js';

export class NotificationService {
  
  /**
   * Send AI job recommendations to job seekers
   */
  static async sendJobRecommendations(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'seeker') {
        return;
      }

      // Get AI recommendations
      const recommendations = await RecommendationService.getJobRecommendations(userId, 3);
      
      // Send notifications for top recommendations
      for (const rec of recommendations.slice(0, 2)) { // Send top 2 recommendations
        await createJobRecommendationNotification(
          userId,
          rec.job.title,
          rec.job._id.toString(),
          rec.matchScore
        );
      }

      console.log(`Sent ${recommendations.length} job recommendations to user ${userId}`);
    } catch (error) {
      console.error('Error sending job recommendations:', error);
    }
  }

  /**
   * Send AI course recommendations to job seekers
   */
  static async sendCourseRecommendations(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'seeker') {
        return;
      }

      // Get AI course recommendations
      const recommendations = await RecommendationService.getCourseRecommendations(userId, 3);
      
      // Send email and notifications for top recommendations
      const { sendCourseRecommendationEmail } = await import('./email.service.js');
      
      for (const rec of recommendations.slice(0, 2)) { // Send top 2 recommendations
        try {
          // Send email notification
          await sendCourseRecommendationEmail(
            user.email,
            user.name,
            rec.course,
            rec.matchScore,
            rec.reasons || [],
            rec.skillsGap || []
          );
          
          // Create in-app notification
          await createCourseRecommendationNotification(
            userId,
            rec.course.title,
            rec.course._id.toString(),
            rec.skillsGap
          );
        } catch (error) {
          console.error(`Error sending course recommendation to ${user.email}:`, error);
        }
      }

      console.log(`Sent ${recommendations.length} course recommendations to user ${userId}`);
    } catch (error) {
      console.error('Error sending course recommendations:', error);
    }
  }

  /**
   * Send daily recommendations to all job seekers
   */
  static async sendDailyRecommendations() {
    try {
      const jobSeekers = await User.find({ role: 'seeker', status: 'active' });
      
      for (const seeker of jobSeekers) {
        // Send job recommendations
        await this.sendJobRecommendations(seeker._id.toString());
        
        // Send course recommendations
        await this.sendCourseRecommendations(seeker._id.toString());
      }

      console.log(`Sent daily recommendations to ${jobSeekers.length} job seekers`);
    } catch (error) {
      console.error('Error sending daily recommendations:', error);
    }
  }

  /**
   * Send recommendations when user profile is updated
   */
  static async sendProfileUpdateRecommendations(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'seeker') {
        return;
      }

      // Wait a bit for profile to be fully updated
      setTimeout(async () => {
        await this.sendJobRecommendations(userId);
        await this.sendCourseRecommendations(userId);
      }, 2000);

    } catch (error) {
      console.error('Error sending profile update recommendations:', error);
    }
  }

  /**
   * Send recommendations when new jobs are posted
   */
  static async sendNewJobRecommendations(jobId: string) {
    try {
      const job = await Job.findById(jobId).populate('employer_id');
      if (!job) return;

      // Get all active job seekers
      const jobSeekers = await User.find({ 
        role: 'seeker', 
        status: 'active',
        // Filter by location preference if job has location
        ...(job.location && {
          'job_preferences.work_locations': { $in: [job.location, 'Any'] }
        })
      });

      for (const seeker of jobSeekers) {
        // Get recommendations for this specific job
        const recommendations = await RecommendationService.getJobRecommendations(seeker._id.toString(), 10);
        const jobRecommendation = recommendations.find(rec => rec.job._id.toString() === jobId);
        
        if (jobRecommendation && jobRecommendation.matchScore > 0.6) {
          await createJobRecommendationNotification(
            seeker._id.toString(),
            job.title || 'Job',
            job._id.toString(),
            jobRecommendation.matchScore
          );
        }
      }

      console.log(`Sent new job recommendations for ${job.title} to ${jobSeekers.length} job seekers`);
    } catch (error) {
      console.error('Error sending new job recommendations:', error);
    }
  }
}
