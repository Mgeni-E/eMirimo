import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Supports multiple configuration methods:
 * 1. Service Account JSON file path
 * 2. Base64 encoded JSON (for deployment)
 * 3. Individual environment variables
 * Returns null if not configured (graceful fallback)
 */
export function initializeFirebase(): admin.app.App | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Option 1: Service Account JSON file path
    if (config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
      // Resolve path relative to backend root or absolute path
      let serviceAccountPath: string;
      if (path.isAbsolute(config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)) {
        serviceAccountPath = config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
      } else {
        // Resolve relative to backend root (where .env is)
        // Go up from src/services to backend root
        const backendRoot = path.resolve(__dirname, '../../');
        serviceAccountPath = path.resolve(backendRoot, config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
      }
      
      // Check if file exists
      if (!fs.existsSync(serviceAccountPath)) {
        return null; // Graceful fallback - don't throw
      }
      
      // Read and parse JSON file
      const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf-8');
      const serviceAccount = JSON.parse(serviceAccountData);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase initialized');
      return firebaseApp;
    }
    // Option 2: Base64 encoded JSON (for deployment/CI)
    else if (config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
      const serviceAccount = JSON.parse(
        Buffer.from(config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8')
      );
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase initialized');
      return firebaseApp;
    }
    // Option 3: Individual environment variables
    else if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
          privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: config.FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase initialized');
      return firebaseApp;
    }
    
    // Not configured - return null (graceful fallback)
    // No Firebase environment variables set - this is normal if using Cloudinary
    return null;
  } catch (error: any) {
    // Log error but don't throw - allow graceful fallback
    return null;
  }
}

/**
 * Upload file to Firebase Storage
 * @param file - Multer file object
 * @param userId - User ID for folder organization
 * @param folder - Base folder path (default: 'emirimo/documents')
 * @returns Public URL of uploaded file
 */
export async function uploadFileToFirebase(
  file: Express.Multer.File,
  userId: string,
  folder: string = 'emirimo/documents'
): Promise<string> {
  if (!firebaseApp) {
    const initialized = initializeFirebase();
    if (!initialized) {
      throw new Error('Firebase is not initialized. Please configure Firebase environment variables.');
    }
  }

  if (!config.FIREBASE_STORAGE_BUCKET) {
    throw new Error('FIREBASE_STORAGE_BUCKET is not configured');
  }

  const bucket = getStorage().bucket();
  
  // Sanitize filename
  const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const fileName = `${folder}/${userId}/${timestamp}_${sanitizedFileName}`;
  const fileRef = bucket.file(fileName);

  try {
    // Upload file buffer
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.originalname,
        },
      },
    });

    // Make file publicly readable (for sharing CVs with employers)
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`✅ File uploaded to Firebase Storage: ${fileName}`);
    return publicUrl;
  } catch (error: any) {
    console.error('❌ Firebase upload failed:', error.message);
    throw new Error(`Failed to upload file to Firebase Storage: ${error.message}`);
  }
}

/**
 * Check if Firebase is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH ||
    config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 ||
    (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY)
  );
}

