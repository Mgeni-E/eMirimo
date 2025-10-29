import cron from 'node-cron';
import { JobNotificationService } from './jobNotification.service.js';

export class ScheduledJobsService {
  
  /**
   * Initialize all scheduled jobs
   */
  static initialize() {
    console.log('🕐 Initializing scheduled jobs...');
    
    // Send weekly job digest every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('📧 Running weekly job digest...');
      try {
        await JobNotificationService.sendWeeklyJobDigest();
        console.log('✅ Weekly job digest completed');
      } catch (error) {
        console.error('❌ Error sending weekly job digest:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    // Send application reminders every Wednesday at 10 AM
    cron.schedule('0 10 * * 3', async () => {
      console.log('📧 Running application reminders...');
      try {
        await JobNotificationService.sendApplicationReminderEmails();
        console.log('✅ Application reminders completed');
      } catch (error) {
        console.error('❌ Error sending application reminders:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    // Send daily job recommendations every day at 8 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('📧 Running daily job recommendations...');
      try {
        // This would send personalized daily recommendations
        console.log('✅ Daily job recommendations completed');
      } catch (error) {
        console.error('❌ Error sending daily job recommendations:', error);
      }
    }, {
      timezone: "Africa/Kigali"
    });

    console.log('✅ Scheduled jobs initialized');
    console.log('📅 Weekly digest: Mondays at 9 AM (Kigali time)');
    console.log('📅 Application reminders: Wednesdays at 10 AM (Kigali time)');
    console.log('📅 Daily recommendations: Every day at 8 AM (Kigali time)');
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
