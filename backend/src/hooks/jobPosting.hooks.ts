import { Job } from '../models/Job.js';
import { JobNotificationService } from '../services/jobNotification.service.js';

/**
 * Job posting hooks to trigger email notifications
 */
export class JobPostingHooks {
  
  /**
   * Initialize job posting hooks
   */
  static initialize() {
    // Hook into job creation
    Job.schema.post('save', async function(doc) {
      if (doc.is_active && doc.isNew) {
        console.log(`🆕 New job posted: ${doc.title} by ${doc.employer_id}`);
        
        // Send job recommendation emails to matching users
        try {
          await JobNotificationService.sendJobRecommendationEmails(doc._id.toString());
        } catch (error) {
          console.error('Error sending job recommendation emails:', error);
        }
      }
    });

    // Hook into job updates (when job becomes active)
    Job.schema.post('findOneAndUpdate', async function(doc) {
      if (doc && doc.is_active) {
        console.log(`🔄 Job updated and activated: ${doc.title}`);
        
        // Send job recommendation emails to matching users
        try {
          await JobNotificationService.sendJobRecommendationEmails(doc._id.toString());
        } catch (error) {
          console.error('Error sending job recommendation emails:', error);
        }
      }
    });

    // Job posting hooks initialized silently
  }
}
