import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getCompanyBySlug,
  getCompanyJobs,
  createCompany,
  updateCompany,
  getAllCompanies
} from '../controllers/company.controller';

const router = Router();

// Public routes
router.get('/:slug', getCompanyBySlug);
router.get('/:slug/jobs', getCompanyJobs);
router.get('/', getAllCompanies);

// Protected routes
router.post('/', requireAuth, createCompany);
router.put('/:slug', requireAuth, updateCompany);

export default router;
