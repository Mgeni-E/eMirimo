import type { Request, Response } from 'express';
import { PrivacyService } from '../services/privacy.service.js';
import type { JwtPayload } from '../middleware/auth.js';

export const downloadMyData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const userData = await PrivacyService.getUserData(user.uid);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${Date.now()}.json"`);
    res.json(userData);
  } catch (error) {
    console.error('Failed to download user data:', error);
    res.status(500).json({ error: 'Failed to download user data' });
  }
};

export const deleteMyAccount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({ error: 'Account deletion must be confirmed' });
    }
    
    await PrivacyService.deleteUserData(user.uid);
    res.json({ message: 'Account and all associated data have been deleted' });
  } catch (error) {
    console.error('Failed to delete user account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

export const anonymizeMyData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { confirm } = req.body;
    
    if (!confirm) {
      return res.status(400).json({ error: 'Data anonymization must be confirmed' });
    }
    
    await PrivacyService.anonymizeUser(user.uid);
    res.json({ message: 'Your data has been anonymized' });
  } catch (error) {
    console.error('Failed to anonymize user data:', error);
    res.status(500).json({ error: 'Failed to anonymize data' });
  }
};

export const getConsentStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const consentStatus = await PrivacyService.getConsentStatus(user.uid);
    res.json(consentStatus);
  } catch (error) {
    console.error('Failed to get consent status:', error);
    res.status(500).json({ error: 'Failed to get consent status' });
  }
};

export const updateConsent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as JwtPayload;
    const { analytics, marketing, personalization } = req.body;
    
    await PrivacyService.updateConsent(user.uid, {
      analytics: analytics || false,
      marketing: marketing || false,
      personalization: personalization || false
    });
    
    res.json({ message: 'Consent preferences updated successfully' });
  } catch (error) {
    console.error('Failed to update consent:', error);
    res.status(500).json({ error: 'Failed to update consent preferences' });
  }
};

export const checkDataRetention = async (req: Request, res: Response) => {
  try {
    const retentionInfo = await PrivacyService.checkDataRetention();
    res.json(retentionInfo);
  } catch (error) {
    console.error('Failed to check data retention:', error);
    res.status(500).json({ error: 'Failed to check data retention' });
  }
};
