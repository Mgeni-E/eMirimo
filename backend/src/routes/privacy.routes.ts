import { Router } from 'express';
import { 
  downloadMyData, 
  deleteMyAccount, 
  anonymizeMyData, 
  getConsentStatus, 
  updateConsent, 
  checkDataRetention 
} from '../controllers/privacy.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const router = Router();

// User privacy routes
router.get('/my-data', requireAuth, downloadMyData);
router.post('/delete-account', requireAuth, deleteMyAccount);
router.post('/anonymize-data', requireAuth, anonymizeMyData);
router.get('/consent', requireAuth, getConsentStatus);
router.put('/consent', requireAuth, updateConsent);

// Admin data retention route
router.get('/data-retention', requireAuth, requireRole('admin'), checkDataRetention);
