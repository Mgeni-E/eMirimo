/**
 * Models Index - Main Collections Only
 * 
 * This file exports all main collections that should be initialized at server startup.
 * Only essential collections for the core job platform functionality are included.
 * 
 * Main Collections:
 * - User: All user accounts (seekers, employers, admins)
 * - Job: Job postings
 * - Application: Job applications
 * - LearningResource: Learning content for skill development
 * - Notification: System notifications
 * - Log: System activity logs
 * 
 * Removed Collections (Optional):
 * - Company: Replaced with company_name string fields
 * - Conversation: Messaging feature removed
 * - Message: Messaging feature removed
 * - SkillAssessment: Skill testing feature removed
 * - SkillTestResult: Skill testing results removed
 */

// Main Collections - Import to ensure schemas are registered
import { User } from './User.js';
import { Job } from './Job.js';
import { Application } from './Application.js';
import { LearningResource } from './LearningResource.js';
import { Notification } from './Notification.js';
import { Log } from './Log.js';

// Export all main models
export {
  User,
  Job,
  Application,
  LearningResource,
  Notification,
  Log
};

// Export model names for reference
export const MAIN_COLLECTIONS = [
  'users',
  'jobs',
  'applications',
  'learningresources',
  'notifications',
  'logs'
] as const;

/**
 * Initialize all main models
 * This ensures all schemas are registered with Mongoose
 */
export async function initializeModels(): Promise<void> {
  // Models are automatically registered when imported
  // This function serves as a central point to ensure all models are loaded
  
  // Verify only main collections exist in database (silently)
  try {
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections
        .map(c => c.name)
        .filter(name => !name.startsWith('system.'));
      
      const optionalCollections = collectionNames.filter(
        name => !MAIN_COLLECTIONS.includes(name as any)
      );
      
      if (optionalCollections.length > 0) {
        console.warn(`⚠️  Warning: Found optional collections: ${optionalCollections.join(', ')}`);
      }
    }
  } catch (error) {
    // Silently fail if database is not yet connected
  }
}

