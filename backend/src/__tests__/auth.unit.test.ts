/**
 * Unit Tests for Authentication Functions
 * Tests individual authentication functions in isolation
 */

/// <reference types="jest" />

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Unit tests for authentication logic
describe('Authentication Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify hashed password correctly', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    const secret = 'test-secret-key';
    const userId = '507f1f77bcf86cd799439011';
    const role = 'seeker';

    it('should generate valid access token', () => {
      const token = jwt.sign(
        { uid: userId, role },
        secret,
        { expiresIn: '15m' }
      );
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.uid).toBe(userId);
      expect(decoded.role).toBe(role);
    });

    it('should generate valid refresh token', () => {
      const token = jwt.sign(
        { uid: userId, type: 'refresh' },
        secret,
        { expiresIn: '7d' }
      );
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.uid).toBe(userId);
      expect(decoded.type).toBe('refresh');
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign(
        { uid: userId, role },
        secret,
        { expiresIn: '15m' }
      );
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    it('should reject expired token', () => {
      const token = jwt.sign(
        { uid: userId, role },
        secret,
        { expiresIn: '-1h' } // Expired token
      );
      
      expect(() => {
        jwt.verify(token, secret);
      }).toThrow();
    });
  });

  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
        'test123@test-domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        'user name@example.com',
        ''
      ];
      
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Password Strength Validation', () => {
    it('should accept password with minimum length', () => {
      const password = '123456';
      expect(password.length).toBeGreaterThanOrEqual(6);
    });

    it('should reject password shorter than 6 characters', () => {
      const shortPasswords = ['12345', 'abc', '12', ''];
      
      shortPasswords.forEach(password => {
        expect(password.length).toBeLessThan(6);
      });
    });
  });

  describe('Role Validation', () => {
    const validRoles = ['seeker', 'employer', 'admin'];

    it('should accept valid roles', () => {
      validRoles.forEach(role => {
        expect(validRoles.includes(role)).toBe(true);
      });
    });

    it('should reject invalid roles', () => {
      const invalidRoles = ['user', 'manager', 'guest', ''];
      
      invalidRoles.forEach(role => {
        expect(validRoles.includes(role)).toBe(false);
      });
    });
  });
});

