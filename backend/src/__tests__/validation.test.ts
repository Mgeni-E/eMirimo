/**
 * Validation Tests
 * Tests input validation and error handling
 */

/// <reference types="jest" />

import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock cvParser service to avoid ESM issues
jest.mock('../services/cvParser.service', () => ({
  parseCVFromURL: jest.fn(),
  parseCVFromBuffer: jest.fn(),
}));

// Mock email service to avoid email credential errors
jest.mock('../services/email.service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendJobRecommendationEmail: jest.fn().mockResolvedValue(undefined),
}));

// Mock logging service to avoid MongoDB connection errors during cleanup
jest.mock('../services/logging.service', () => ({
  requestLogger: jest.fn((req, res, next) => next()),
  errorLogger: jest.fn((err, req, res, next) => next(err)),
  log: jest.fn().mockResolvedValue(undefined),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  // Wait a bit to ensure all async operations complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Close mongoose connection gracefully
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  // Stop MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Validation Tests', () => {
  describe('Registration Validation', () => {
    it('should reject registration with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          password: 'password123',
          role: 'seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Registration failed');
    });

    it('should reject registration with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          role: 'seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Registration failed');
    });

    it('should reject registration with missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Registration failed');
    });

    it('should reject registration with missing role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Registration failed');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          role: 'seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject registration with weak password (less than 6 characters)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
          role: 'seeker'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Password too weak');
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid-role'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid role');
    });

    it('should reject registration with duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'First User',
        email: 'duplicate@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'seeker'
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'seeker'
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('Login Validation', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        role: 'seeker',
        status: 'active'
      });
    });

    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Login failed');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Login failed');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});

