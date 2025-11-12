# 🔥 Firebase Setup Guide for Document Uploads

This guide explains how to configure Firebase Storage for CV/Resume document uploads in eMirimo.

## 📋 Overview

- **Firebase Storage**: Required for document uploads (CV/Resume)
- **Cloudinary**: Optional, only for profile pictures
- **Works**: Both locally and on Render

## 🚀 Firebase Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enable Google Analytics (optional)
4. Complete project creation

### 2. Enable Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get Started**
3. Choose **Start in production mode** (or test mode for development)
4. Select a Cloud Storage location (choose closest to your users)
5. Click **Done**

### 3. Create Service Account

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file (keep it secure!)
4. This file contains your service account credentials

### 4. Configure Environment Variables

#### Option A: Base64 Encoded Service Account (Recommended for Render)

1. Convert the service account JSON to base64:
   ```bash
   # On Mac/Linux
   cat path/to/service-account.json | base64
   
   # Or use online tool
   ```

2. Copy the base64 string

3. Set in Render environment variables:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=<your-base64-string>
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

#### Option B: Individual Environment Variables

Extract from service account JSON:
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters)
- Storage bucket → `FIREBASE_STORAGE_BUCKET` (usually `project-id.appspot.com`)

Set in Render:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

#### Option C: Service Account File (Local Development Only)

1. Place service account JSON in `backend/config/firebase-service-account.json`
2. Set in `.env`:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=config/firebase-service-account.json
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

**⚠️ Important**: Never commit the service account file to Git!

### 5. Configure Storage Rules

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to documents
    match /emirimo/documents/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

For production, use more restrictive rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /emirimo/documents/{userId}/{allPaths=**} {
      allow read: if true; // Public read for CVs
      allow write: if false; // Only server-side uploads (via Admin SDK)
    }
  }
}
```

## 🧪 Testing Locally

1. Create `.env` file in `backend/` directory:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=config/firebase-service-account.json
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

2. Place service account JSON in `backend/config/firebase-service-account.json`

3. Start backend:
   ```bash
   cd backend
   npm run dev
   ```

4. Check logs for:
   ```
   ✅ Firebase initialized
   ```

5. Test CV upload via frontend or API

## 🌐 Render Deployment

1. Go to Render Dashboard → Your Service → Environment

2. Add environment variables:
   - `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` (recommended)
   - OR individual credentials
   - `FIREBASE_STORAGE_BUCKET`

3. Save and redeploy

4. Check deployment logs for:
   ```
   ✅ Firebase initialized
   ```

## ✅ Verification

After configuration, you should see:
- ✅ Firebase initialized (in server logs)
- Document uploads work (CV/Resume)
- Files stored in Firebase Storage
- Public URLs accessible

## 🔍 Troubleshooting

### "Firebase not initialized"
- Check environment variables are set correctly
- Verify service account has Storage Admin role
- Check bucket name matches project

### "FIREBASE_STORAGE_BUCKET is not configured"
- Set `FIREBASE_STORAGE_BUCKET` environment variable
- Format: `your-project-id.appspot.com`

### Upload fails
- Check Firebase Storage rules allow writes
- Verify service account has proper permissions
- Check file size limits (10MB max)

### Files not publicly accessible
- Update Storage rules to allow public read
- Or use signed URLs for private access

## 📝 Notes

- **Documents (CV/Resume)**: Firebase Storage only
- **Profile Pictures**: Cloudinary (optional)
- **File Size Limit**: 10MB per document
- **Storage Location**: `emirimo/documents/{userId}/{timestamp}_{filename}`

