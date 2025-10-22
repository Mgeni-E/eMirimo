import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Notification } from '../models/Notification.js';
import { Log } from '../models/Log.js';
import { Application } from '../models/Application.js';

export class PrivacyService {
  // Get all user data for GDPR compliance
  public static async getUserData(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-password_hash -resetToken -resetTokenExpiry -refreshToken -refreshTokenExpiry');
    const jobs = await Job.find({ employer_id: userId });
    const applications = await Application.find({ user_id: userId });
    const notifications = await Notification.find({ user_id: userId });
    const logs = await Log.find({ userId: userId });

    return {
      user,
      jobs,
      applications,
      notifications,
      logs,
      exportedAt: new Date().toISOString()
    };
  }

  // Anonymize user data
  public static async anonymizeUser(userId: string): Promise<void> {
    const anonymizedData = {
      name: 'Deleted User',
      email: `deleted_${Date.now()}@example.com`,
      bio: null,
      phone: null,
      skills: [],
      linkedin: null,
      address: null,
      cv_url: null,
      profile_image: null,
      is_verified: false,
      last_login: null
    };

    await User.findByIdAndUpdate(userId, anonymizedData);
    
    // Anonymize related data
    await Job.updateMany({ employer_id: userId }, { 
      $set: { 
        title: 'Deleted Job',
        description: 'This job has been deleted',
        is_active: false
      }
    });


    await Notification.updateMany({ user_id: userId }, {
      $set: { message: 'This notification has been anonymized' }
    });

    await Log.updateMany({ userId: userId }, {
      $set: { 
        message: 'This log entry has been anonymized',
        metadata: { anonymized: true }
      }
    });
  }

  // Delete all user data
  public static async deleteUserData(userId: string): Promise<void> {
    await User.findByIdAndDelete(userId);
    await Job.deleteMany({ employer_id: userId });
    await Application.deleteMany({ user_id: userId });
    await Notification.deleteMany({ user_id: userId });
    await Log.deleteMany({ userId: userId });
  }

  // Check data retention compliance
  public static async checkDataRetention(): Promise<any> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const oldLogs = await Log.countDocuments({
      timestamp: { $lt: sixMonthsAgo },
      level: { $ne: 'error' }
    });

    const oldNotifications = await Notification.countDocuments({
      created_at: { $lt: sixMonthsAgo },
      read_status: true
    });

    const inactiveUsers = await User.countDocuments({
      last_login: { $lt: oneYearAgo },
      role: { $ne: 'admin' }
    });

    return {
      oldLogs,
      oldNotifications,
      inactiveUsers,
      recommendations: [
        oldLogs > 0 ? 'Consider archiving or deleting old logs' : null,
        oldNotifications > 0 ? 'Consider cleaning up old notifications' : null,
        inactiveUsers > 0 ? 'Consider reaching out to inactive users' : null
      ].filter(Boolean)
    };
  }

  // Get consent status
  public static async getConsentStatus(userId: string): Promise<any> {
    const user = await User.findById(userId).select('created_at last_login');
    const hasConsented = user ? user.created_at > new Date('2024-01-01') : false;
    
    return {
      hasConsented,
      consentDate: user?.created_at,
      dataProcessing: {
        analytics: hasConsented,
        marketing: hasConsented,
        personalization: hasConsented
      }
    };
  }

  // Update consent
  public static async updateConsent(userId: string, consent: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        consent_analytics: consent.analytics,
        consent_marketing: consent.marketing,
        consent_personalization: consent.personalization,
        consent_updated_at: new Date()
      }
    });
  }
}
