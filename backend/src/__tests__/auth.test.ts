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

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'seeker'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body).toHaveProperty('token');
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'seeker'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
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

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
