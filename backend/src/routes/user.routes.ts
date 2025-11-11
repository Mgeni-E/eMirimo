import { Router } from 'express';
import { getProfile, updateProfile, uploadProfileImage, uploadCV } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.middleware.js';

export const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/image', uploadProfileImage);
// Support both file upload (new) and URL (legacy) methods
router.post('/me/cv', uploadDocument.single('cv'), uploadCV);
