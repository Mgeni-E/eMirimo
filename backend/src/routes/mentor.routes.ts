import { Router } from 'express';
import { upsertProfile, directory } from '../controllers/mentor.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.get('/', directory);
router.put('/me', requireAuth, requireRole('mentor','admin'), upsertProfile);
