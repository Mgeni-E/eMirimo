import { Router } from 'express';
import { apply, myApplications } from '../controllers/application.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.get('/me', requireAuth, requireRole('seeker','admin'), myApplications);
router.post('/', requireAuth, requireRole('seeker','admin'), apply);
