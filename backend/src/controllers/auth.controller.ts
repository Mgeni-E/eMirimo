import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';
import config from '../config/env.js';

export const register = async (req:Request,res:Response)=>{
  const { email, password, name, role } = req.body;
  
  // Validate required fields
  if (!email || !password || !name || !role) {
    return res.status(400).json({error:'Missing required fields'});
  }
  
  const exists = await User.findOne({ email });
  if(exists) return res.status(409).json({error:'Email in use'});
  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password_hash, name, role });
  const token = jwt.sign({ uid: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
  
  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, name).catch(console.error);
  
  res.status(201).json({ token, user: { id:user.id, name:user.name, role:user.role }});
};

export const login = async (req:Request,res:Response)=>{
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({error:'Email and password are required'});
  }
  
  const user = await User.findOne({ email });
  if(!user) return res.status(401).json({error:'Invalid credentials'});
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({ uid: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
  res.json({ token, user: { id:user.id, name:user.name, role:user.role }});
};

export const forgotPassword = async (req:Request,res:Response)=>{
  const { email } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(404).json({error:'User not found'});

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token to user (you might want to add these fields to your User model)
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  try {
    await sendPasswordResetEmail(email, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

export const resetPassword = async (req:Request,res:Response)=>{
  const { token, password } = req.body;
  const user = await User.findOne({ 
    resetToken: token, 
    resetTokenExpiry: { $gt: new Date() } 
  });

  if(!user) return res.status(400).json({error:'Invalid or expired token'});

  // Update password
  const password_hash = await bcrypt.hash(password, 12);
  user.password_hash = password_hash;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully' });
};
