/**
 * Storage Service - FRONTEND ONLY
 * 
 * IMPORTANT: This service is ONLY for images (profile pictures).
 * Documents (CVs, Resumes) are handled by the BACKEND which uses Firebase Admin SDK.
 * 
 * Storage Strategy:
 * - Images (profile pictures, cover images): Cloudinary ONLY (via this service)
 * - Documents (CVs, Resumes, PDFs): Backend → Firebase Storage (NOT via this service)
 * 
 * For CV/Resume uploads, use the backend API endpoint: POST /api/users/me/cv
 */

export type StorageProvider = 'cloudinary' | 'firebase';
export type FileCategory = 'image' | 'document';

/**
 * Upload file to appropriate storage based on file category
 * - Images: Always use Cloudinary
 * - Documents: Use Firebase Storage if configured, otherwise fallback to Cloudinary
 */
export async function uploadFile(
  file: File,
  category: FileCategory,
  options?: {
    folder?: string;
    onProgress?: (progress: number) => void;
    userId?: string;
  }
): Promise<string> {
  if (category === 'image') {
    // Images: Always use Cloudinary
    return uploadImageToCloudinary(file, options);
  } else {
    // Documents: Use Firebase Storage if configured, otherwise fallback to Cloudinary
    if (isFirebaseConfigured()) {
      try {
        return await uploadDocumentToFirebase(file, options);
      } catch (error: any) {
        console.warn('Firebase upload failed, falling back to Cloudinary:', error.message);
        // Fallback to Cloudinary if Firebase fails
        return uploadDocumentToCloudinary(file, options);
      }
    } else {
      // Firebase not configured, use Cloudinary
      return uploadDocumentToCloudinary(file, options);
    }
  }
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImageToCloudinary(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void }
): Promise<string> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  // Use image preset if specified, otherwise fall back to default preset
  const preset = import.meta.env.VITE_CLOUDINARY_IMAGE_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  
  if (!cloud || !preset) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET (or VITE_CLOUDINARY_IMAGE_PRESET)');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  
  if (options?.folder) {
    form.append('folder', options.folder);
  }

  const res = await fetch(url, { method: 'POST', body: form });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `Failed to upload image: ${res.status} ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  
  if (!data.secure_url) {
    throw new Error('Cloudinary upload succeeded but no URL returned');
  }

  return data.secure_url;
}

/**
 * Upload document to Firebase Storage
 * This will be used when Firebase is configured
 */
export async function uploadDocumentToFirebase(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void; userId?: string }
): Promise<string> {
  // Check if Firebase is configured
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.storageBucket) {
    throw new Error('Firebase Storage is not configured. Please set Firebase environment variables.');
  }

  // Import Firebase SDK
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');

    // Initialize Firebase if not already initialized
    let app;
    const apps = getApps();
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = apps[0];
    }

    const storage = getStorage(app);
    
    // Create file path with folder structure
    // Use user-specific folder if user is authenticated, otherwise use general folder
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const baseFolder = options?.folder || 'emirimo/documents';
    
    // Try to get current user ID for user-specific folders
    // Note: You may need to pass userId as an option if available
    const userId = options?.userId || 'anonymous';
    const folder = userId !== 'anonymous' ? `${baseFolder}/${userId}` : baseFolder;
    const fileName = `${folder}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, fileName);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (options?.onProgress) {
            options.onProgress(progress);
          }
        },
        (error) => {
          console.error('Firebase upload error:', error);
          reject(new Error(`Firebase upload failed: ${error.message}`));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            reject(new Error(`Failed to get download URL: ${error.message}`));
          }
        }
      );
    });
  } catch (error: any) {
    if (error.message?.includes('Cannot find module')) {
      throw new Error('Firebase SDK is not installed. Please install firebase package: npm install firebase');
    }
    throw error;
  }
}

/**
 * Upload document to Cloudinary
 * Supports PDFs, DOCs, DOCX, and other document formats
 */
export async function uploadDocumentToCloudinary(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void }
): Promise<string> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  // Use document preset if specified, otherwise fall back to default preset
  const preset = import.meta.env.VITE_CLOUDINARY_DOCUMENT_PRESET || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  
  if (!cloud || !preset) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_DOCUMENT_PRESET (or VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  // Determine resource type based on file type
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  let resourceType = 'raw'; // Default to 'raw' for documents
  
  // For PDF, DOC, DOCX, TXT files, use 'raw' resource type (required for documents)
  // Cloudinary requires 'raw' resource type for non-image files like PDFs
  const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
  if (documentExtensions.includes(fileExtension)) {
    resourceType = 'raw';
  }

  const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  form.append('resource_type', resourceType);
  
  // Set folder - use provided folder or default to emirimo/documents to match preset
  const folder = options?.folder || 'emirimo/documents';
  form.append('folder', folder);
  
  // CRITICAL: For raw files (PDFs, documents), we must ensure no transformations are applied
  // Cloudinary supports PDF uploads, but they must be uploaded as resource_type: raw
  // The preset should have Resource Type = Raw and NO transformation settings
  // We explicitly do NOT send any transformation parameters (format, eager, etc.)
  // 
  // If you get "Invalid extension in transformation: raw" error, check your preset:
  // 1. Go to Cloudinary Dashboard → Settings → Upload → Upload Presets
  // 2. Edit your 'emirimo-documents' preset
  // 3. Ensure Resource Type = Raw (not Image/Auto)
  // 4. Remove ALL transformation settings (eager, eager_async, transformations, etc.)
  // 5. Set Format = raw (if field exists) as a resource type, NOT as a transformation
  // 6. Save the preset

  // Note: Cloudinary doesn't support progress tracking via fetch API
  // Progress tracking would require XMLHttpRequest, but for simplicity we use fetch
  // If progress is needed, we can implement XHR version later
  if (options?.onProgress) {
    // Simulate progress for better UX (Cloudinary doesn't provide real-time progress via fetch)
    options.onProgress(50); // Show 50% during upload
  }

  const res = await fetch(url, { method: 'POST', body: form });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('Cloudinary upload error:', errorData);
    
    let errorMsg = errorData.error?.message || errorData.message || `Failed to upload document: ${res.status} ${res.statusText}`;
    
    // Provide helpful error message for common preset configuration issues
    if (errorMsg.includes('Invalid extension in transformation') || errorMsg.includes('transformation')) {
      errorMsg = `Cloudinary preset configuration error: ${errorMsg}. Please check your 'emirimo-documents' preset in Cloudinary Dashboard. Ensure Resource Type = Raw and remove all transformation settings.`;
    }
    
    throw new Error(errorMsg);
  }

  const data = await res.json();
  
  if (!data.secure_url) {
    throw new Error('Cloudinary upload succeeded but no URL returned');
  }

  if (options?.onProgress) {
    options.onProgress(100); // Complete
  }

  return data.secure_url;
}

/**
 * Check if Firebase Storage is configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  );
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const imagePreset = import.meta.env.VITE_CLOUDINARY_IMAGE_PRESET;
  const documentPreset = import.meta.env.VITE_CLOUDINARY_DOCUMENT_PRESET;
  const fallbackPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  // Cloudinary is configured if we have cloud name and at least one preset
  return !!(
    cloudName && 
    (imagePreset || documentPreset || fallbackPreset)
  );
}

