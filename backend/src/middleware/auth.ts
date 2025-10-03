import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export interface JwtPayload { uid: string; role: string; }

export const requireAuth = (req:Request,res:Response,next:NextFunction)=>{
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if(!token) return res.status(401).json({error:'No token'});
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({error:'Invalid token'});
  }
};

export const requireRole = (...roles:string[]) =>
 (req:Request,res:Response,next:NextFunction)=>{
   const user = (req as any).user as JwtPayload|undefined;
   if(!user) return res.status(401).json({error:'Unauthenticated'});
   if(!roles.includes(user.role)) return res.status(403).json({error:'Forbidden'});
   next();
 };
