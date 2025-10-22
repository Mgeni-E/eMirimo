import { Router } from 'express';
import { getProfile, updateProfile, uploadProfileImage, uploadCV } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.post('/me/image', uploadProfileImage);
router.post('/me/cv', uploadCV);
