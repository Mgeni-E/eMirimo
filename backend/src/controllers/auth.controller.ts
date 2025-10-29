import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
import config from '../config/env.js';

// Helper function to generate tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { uid: userId, role }, 
    config.JWT_SECRET as string, 
    { expiresIn: '15m' }
  );
  
  const refresh_token = jwt.sign(
    { uid: userId, type: 'refresh' }, 
    config.JWT_SECRET as string, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refresh_token };
};

export const register = async (req:Request,res:Response)=>{
  const { email, password, name, role } = req.body;
  
  // Validate required fields with specific messages
  if (!email || !password || !name || !role) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');
    if (!role) missingFields.push('role');
    
    return res.status(400).json({
      error: 'Registration failed',
      message: `Please provide all required fields: ${missingFields.join(', ')}`,
      details: { missingFields }
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password too weak',
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Validate role
  const validRoles = ['seeker', 'employer', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: 'Invalid role',
      message: `Role must be one of: ${validRoles.join(', ')}`
    });
  }
  
  const exists = await User.findOne({ email });
  if(exists) {
    return res.status(409).json({
      error: 'Email already registered',
      message: 'An account with this email address already exists. Please use a different email or try logging in.'
    });
  }
  
  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password_hash, name, role });
  
  const { accessToken, refresh_token } = generateTokens(user.id, user.role);
  
  // Store refresh token in database
  user.refresh_token = refresh_token;
  user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  user.last_login = new Date();
  await user.save();
  
  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, name).catch(console.error);
  
  // Set refresh token as httpOnly cookie
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.status(201).json({ 
    token: accessToken, 
    user: { id:user.id, name:user.name, role:user.role, email:user.email }
  });
};

export const login = async (req:Request,res:Response)=>{
  const { email, password } = req.body;
  
  // Validate required fields with specific messages
  if (!email || !password) {
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    
    return res.status(400).json({
      error: 'Login failed',
      message: `Please provide: ${missingFields.join(' and ')}`,
      details: { missingFields }
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }
  
  const user = await User.findOne({ email });
  if(!user) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'No account found with this email address. Please check your email or register for a new account.'
    });
  }
  
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Incorrect password. Please check your password and try again.'
    });
  }
  
  // Check if account is active
  if (user.status === 'inactive') {
    return res.status(403).json({
      error: 'Account deactivated',
      message: 'Your account has been deactivated. Please contact support for assistance.'
    });
  }
  
  if (user.status === 'pending') {
    return res.status(403).json({
      error: 'Account pending approval',
      message: 'Your account is pending approval. Please wait for admin approval or contact support.'
    });
  }
  
  const { accessToken, refresh_token } = generateTokens(user.id, user.role);
  
  // Store refresh token in database
  user.refresh_token = refresh_token;
  user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  user.last_login = new Date();
  await user.save();
  
  // Set refresh token as httpOnly cookie
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.json({ 
    token: accessToken, 
    user: { id:user.id, name:user.name, role:user.role, email:user.email }
  });
};

export const forgotPassword = async (req:Request,res:Response)=>{
  const { email } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(404).json({error:'User not found'});

  // Generate reset token
  const password_reset_token = crypto.randomBytes(32).toString('hex');
  const password_reset_expires = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token to user (you might want to add these fields to your User model)
  user.password_reset_token = password_reset_token;
  user.password_reset_expires = password_reset_expires;
  await user.save();

  try {
    await sendPasswordResetEmail(email, password_reset_token);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

export const resetPassword = async (req:Request,res:Response)=>{
  const { token, password } = req.body;
  const user = await User.findOne({ 
    password_reset_token: token, 
    password_reset_expires: { $gt: new Date() } 
  });

  if(!user) return res.status(400).json({error:'Invalid or expired token'});

  // Update password
  const password_hash = await bcrypt.hash(password, 12);
  user.password_hash = password_hash;
  user.password_reset_token = undefined;
  user.password_reset_expires = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
};

export const refresh_token = async (req:Request,res:Response)=>{
  const { refresh_token } = req.cookies;
  
  if (!refresh_token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }
  
  try {
    const decoded = jwt.verify(refresh_token, config.JWT_SECRET) as any;
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    const user = await User.findOne({ 
      _id: decoded.uid, 
      refresh_token,
      refresh_token_expires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    const { accessToken, refresh_token: newRefreshToken } = generateTokens(user.id, user.role);
    
    // Update refresh token in database
    user.refresh_token = newRefreshToken;
    user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();
    
    // Set new refresh token as httpOnly cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req:Request,res:Response)=>{
  const { refresh_token } = req.cookies;
  
  if (refresh_token) {
    // Invalidate refresh token in database
    await User.findOneAndUpdate(
      { refresh_token },
      { 
        refresh_token: null, 
        refresh_token_expires: null 
      }
    );
  }
  
  // Clear refresh token cookie
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out successfully' });
};
