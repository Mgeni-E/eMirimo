import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, refreshToken, logout } from '../controllers/auth.controller.js';

export const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
