import { Router } from 'express';
import { router as auth } from './auth.routes.js';
import { router as jobs } from './job.routes.js';
import { router as apps } from './application.routes.js';
import { router as mentors } from './mentor.routes.js';

export const router = Router();
router.use('/auth', auth);
router.use('/jobs', jobs);
router.use('/applications', apps);
router.use('/mentors', mentors);
