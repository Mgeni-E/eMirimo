import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, refresh_token, logout } from '../controllers/auth.controller.js';

export const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refresh_token);
router.post('/logout', logout);
