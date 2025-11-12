# 🔥 Firebase Setup for Render Deployment

## Why Firebase Works Locally But Not on Render

**Local Development:**
- Uses `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` pointing to a JSON file
- File exists in your local `backend/config/` directory

**Render Deployment:**
- Cannot use file paths (files aren't committed to Git)
- Must use environment variables instead

## ✅ Quick Setup Steps

### Step 1: Get Your Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### Step 2: Choose Configuration Method

#### Option A: Base64 (Recommended - Easiest)

1. Convert JSON to base64:
   ```bash
   # Mac/Linux
   cat path/to/service-account.json | base64 -w 0
   
   # Or use online: https://www.base64encode.org/
   ```

2. Copy the entire base64 string (it's very long!)

3. In Render Dashboard → Your Service → Environment:
   - Add: `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` = `<paste-base64-string>`
   - Add: `FIREBASE_STORAGE_BUCKET` = `your-project-id.appspot.com`

#### Option B: Individual Variables

From the service account JSON, extract:

1. `project_id` → `FIREBASE_PROJECT_ID`
2. `client_email` → `FIREBASE_CLIENT_EMAIL`
3. `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)
4. Storage bucket → `FIREBASE_STORAGE_BUCKET` (usually `project-id.appspot.com`)

In Render Dashboard → Your Service → Environment:
- Add all 4 variables above

**⚠️ Important for FIREBASE_PRIVATE_KEY:**
- Keep the `\n` characters in the private key
- The key should look like: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n`

### Step 3: Verify in Render Logs

After deploying, check Render logs. You should see:

**Success:**
```
✅ Firebase initialized (Base64)
```
or
```
✅ Firebase initialized (Individual credentials)
```

**Failure - Missing Variables:**
```
⚠️  Firebase not configured: No environment variables found
   Required: FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 + FIREBASE_STORAGE_BUCKET
   OR: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_STORAGE_BUCKET
```

**Failure - Parse Error:**
```
❌ Failed to parse base64 service account: ...
```
→ Check that base64 string is complete and correct

**Failure - Missing Bucket:**
```
❌ FIREBASE_STORAGE_BUCKET is required when using FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
```
→ Add `FIREBASE_STORAGE_BUCKET` environment variable

## 🔍 Debugging Checklist

- [ ] Environment variables added in Render Dashboard
- [ ] `FIREBASE_STORAGE_BUCKET` is set (format: `project-id.appspot.com`)
- [ ] Base64 string is complete (no truncation)
- [ ] Private key includes `\n` characters if using individual vars
- [ ] Service account has Storage Admin permissions
- [ ] Redeployed after adding environment variables

## 📝 Example Environment Variables in Render

```
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Iiwi...
FIREBASE_STORAGE_BUCKET=my-project-12345.appspot.com
```

OR

```
FIREBASE_PROJECT_ID=my-project-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-project-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=my-project-12345.appspot.com
```

## 🚀 After Setup

1. Save environment variables in Render
2. Wait for automatic redeploy (or manually redeploy)
3. Check logs for `✅ Firebase initialized`
4. Test document upload via API

