import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export interface JwtPayload { uid: string; role: string; }

export const requireAuth = (req:Request,res:Response,next:NextFunction)=>{
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource.'
    });
  }
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({
      error: 'Invalid or expired token',
      message: 'Your session has expired. Please log in again.'
    });
  }
};

export const requireRole = (...roles:string[]) =>
 (req:Request,res:Response,next:NextFunction)=>{
   const user = (req as any).user as JwtPayload|undefined;
   if(!user) {
     return res.status(401).json({
       error: 'Authentication required',
       message: 'Please log in to access this resource.'
     });
   }
   if(!roles.includes(user.role)) {
     return res.status(403).json({
       error: 'Access denied',
       message: `This resource requires one of the following roles: ${roles.join(', ')}.`
     });
   }
   next();
 };
