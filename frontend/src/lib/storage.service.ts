/**
 * Storage Service
 * Abstracts file uploads to different storage providers
 * - Cloudinary: For images (profile pictures, cover images)
 * - Firebase Storage: For documents (CVs, Resumes, PDFs, DOCs)
 */

export type StorageProvider = 'cloudinary' | 'firebase';
export type FileCategory = 'image' | 'document';

/**
 * Upload file to appropriate storage based on file category
 */
export async function uploadFile(
  file: File,
  category: FileCategory,
  options?: {
    folder?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<string> {
  if (category === 'image') {
    return uploadImageToCloudinary(file, options);
  } else {
    // Documents: Use Firebase Storage (when configured) or Cloudinary (fallback)
    return uploadDocumentToFirebase(file, options).catch(() => {
      // Fallback to Cloudinary if Firebase is not configured
      console.warn('Firebase Storage not configured, falling back to Cloudinary');
      return uploadDocumentToCloudinary(file, options);
    });
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
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  
  if (!cloud || !preset) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET');
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
  options?: { folder?: string; onProgress?: (progress: number) => void }
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

  // Dynamic import of Firebase SDK (only load when needed)
  // Use a function to create the import dynamically to prevent Vite from analyzing it
  const loadFirebase = async () => {
    try {
      // Use string concatenation to make this truly dynamic
      const appPath = 'firebase' + '/' + 'app';
      const storagePath = 'firebase' + '/' + 'storage';
      
      // @ts-ignore - Dynamic imports that Vite shouldn't analyze statically
      const [firebaseApp, firebaseStorage] = await Promise.all([
        import(appPath),
        import(storagePath)
      ]);
      
      return {
        initializeApp: firebaseApp.initializeApp,
        getApps: firebaseApp.getApps,
        getStorage: firebaseStorage.getStorage,
        ref: firebaseStorage.ref,
        uploadBytesResumable: firebaseStorage.uploadBytesResumable,
        getDownloadURL: firebaseStorage.getDownloadURL,
      };
    } catch (error: any) {
      throw new Error('Firebase SDK is not installed. Please install firebase package: npm install firebase');
    }
  };

  const {
    initializeApp,
    getApps,
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } = await loadFirebase();

  // Initialize Firebase if not already initialized
  let app;
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    // App might already be initialized
    if (error.code !== 'app/already-initialized') {
      throw error;
    }
    app = getApps()[0];
  }

  const storage = getStorage(app);
  
  // Create file path
  const timestamp = Date.now();
  const fileName = `${options?.folder || 'documents'}/${timestamp}_${file.name}`;
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
}

/**
 * Upload document to Cloudinary (fallback for when Firebase is not available)
 */
export async function uploadDocumentToCloudinary(
  file: File,
  options?: { folder?: string; onProgress?: (progress: number) => void }
): Promise<string> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  
  if (!cloud || !preset) {
    throw new Error('Cloudinary is not configured');
  }

  // Determine resource type based on file type
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  let resourceType = 'auto';
  
  // For PDF, DOC, DOCX files, use 'raw' resource type
  if (fileExtension === '.pdf' || fileExtension === '.doc' || fileExtension === '.docx') {
    resourceType = 'raw';
  }

  const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  form.append('resource_type', resourceType);
  
  if (options?.folder) {
    form.append('folder', options.folder);
  } else {
    form.append('folder', 'cv_resumes');
  }

  const res = await fetch(url, { method: 'POST', body: form });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || `Failed to upload document: ${res.status} ${res.statusText}`;
    throw new Error(errorMsg);
  }

  const data = await res.json();
  
  if (!data.secure_url) {
    throw new Error('Cloudinary upload succeeded but no URL returned');
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
  return !!(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );
}

