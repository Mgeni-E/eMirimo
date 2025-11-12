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

  // Debug: Log which configuration method is being checked
  const hasPath = !!config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const hasBase64 = !!config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
  const hasIndividual = !!(config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY);
  const hasBucket = !!config.FIREBASE_STORAGE_BUCKET;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Firebase config check:', {
      hasPath,
      hasBase64,
      hasIndividual,
      hasBucket,
      projectId: config.FIREBASE_PROJECT_ID ? 'set' : 'missing',
      clientEmail: config.FIREBASE_CLIENT_EMAIL ? 'set' : 'missing',
      privateKey: config.FIREBASE_PRIVATE_KEY ? 'set' : 'missing'
    });
  }

  try {
    // Option 1: Base64 encoded JSON (for deployment/CI - PRIORITY for Render)
    if (config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
      if (!config.FIREBASE_STORAGE_BUCKET) {
        console.error('❌ FIREBASE_STORAGE_BUCKET is required when using FIREBASE_SERVICE_ACCOUNT_KEY_BASE64');
        return null;
      }
      
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(config.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8')
        );
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: config.FIREBASE_STORAGE_BUCKET,
        });
        console.log('✅ Firebase initialized (Base64)');
        return firebaseApp;
      } catch (parseError: any) {
        console.error('❌ Failed to parse base64 service account:', parseError.message);
        return null;
      }
    }
    // Option 2: Individual environment variables (for deployment - PRIORITY for Render)
    else if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
      if (!config.FIREBASE_STORAGE_BUCKET) {
        console.error('❌ FIREBASE_STORAGE_BUCKET is required when using individual credentials');
        return null;
      }
      
      try {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.FIREBASE_PROJECT_ID,
            clientEmail: config.FIREBASE_CLIENT_EMAIL,
            privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: config.FIREBASE_STORAGE_BUCKET,
        });
        console.log('✅ Firebase initialized (Individual credentials)');
        return firebaseApp;
      } catch (initError: any) {
        console.error('❌ Failed to initialize Firebase with individual credentials:', initError.message);
        return null;
      }
    }
    // Option 3: Service Account JSON file path (for local development only)
    else if (config.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
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
      console.log('✅ Firebase initialized (File path)');
      return firebaseApp;
    }
    
    // Not configured - return null (graceful fallback)
    // No Firebase environment variables set
    if (process.env.NODE_ENV !== 'development') {
      console.warn('⚠️  Firebase not configured: No environment variables found');
      console.warn('   Required: FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 + FIREBASE_STORAGE_BUCKET');
      console.warn('   OR: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_STORAGE_BUCKET');
    }
    return null;
  } catch (error: any) {
    // Log error but don't throw - allow graceful fallback
    console.error('❌ Firebase initialization error:', error.message);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
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

