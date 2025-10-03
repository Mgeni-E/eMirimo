import { Router } from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

export const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
