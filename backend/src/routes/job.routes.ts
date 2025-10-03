import { Router } from 'express';
import { list, create } from '../controllers/job.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

router.get('/', list);
router.post('/', requireAuth, requireRole('employer','admin'), create);
