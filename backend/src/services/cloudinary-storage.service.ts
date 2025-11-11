/**
 * Cloudinary Storage Service (Fallback for documents)
 * Used when Firebase is not configured or fails
 */

import FormData from 'form-data';
import fetch from 'node-fetch';
import config from '../config/env.js';

/**
 * Upload document to Cloudinary (fallback option)
 * @param file - Multer file object
 * @param userId - User ID for folder organization
 * @returns Public URL of uploaded file
 */
export async function uploadDocumentToCloudinary(
  file: Express.Multer.File,
  userId: string
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_DOCUMENT_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_DOCUMENT_PRESET');
  }

  const formData = new FormData();
  formData.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `emirimo/documents/${userId}`);
  formData.append('resource_type', 'raw'); // Important for PDFs/DOCs

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;
    const publicUrl = data.secure_url || data.url;
    
    if (!publicUrl) {
      throw new Error('Cloudinary upload succeeded but no URL returned');
    }

    console.log(`✅ File uploaded to Cloudinary: ${data.public_id}`);
    return publicUrl;
  } catch (error: any) {
    console.error('❌ Cloudinary upload failed:', error.message);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    (process.env.CLOUDINARY_DOCUMENT_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET)
  );
}

