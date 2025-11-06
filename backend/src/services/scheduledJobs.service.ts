import cron from 'node-cron';
import { JobNotificationService } from './jobNotification.service.js';

export class ScheduledJobsService {
  
  /**
   * Initialize all scheduled jobs
   */
  static initialize() {
    // Send weekly job digest every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      try {
        await JobNotificationService.sendWeeklyJobDigest();
      } catch (error) {
        console.error('❌ Error sending weekly job digest:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    // Send application reminders every Wednesday at 10 AM
    cron.schedule('0 10 * * 3', async () => {
      try {
        await JobNotificationService.sendApplicationReminderEmails();
      } catch (error) {
        console.error('❌ Error sending application reminders:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    // Send daily job recommendations every day at 8 AM
    cron.schedule('0 8 * * *', async () => {
      try {
        // This would send personalized daily recommendations
      } catch (error) {
        console.error('❌ Error sending daily job recommendations:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    // Scheduled jobs initialized silently
  }

  /**
   * Test email notifications (for development)
   */
  static async testEmailNotifications() {
    console.log('🧪 Testing email notifications...');
    
    try {
      // Test with a specific job ID
      const testJobId = 'test-job-id';
      await JobNotificationService.sendJobRecommendationEmails(testJobId);
      console.log('✅ Test email notifications completed');
    } catch (error) {
      console.error('❌ Error testing email notifications:', error);
    }
  }
}
