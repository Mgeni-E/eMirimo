/**
 * Integration Tests
 * Tests end-to-end API functionality
 */

/// <reference types="jest" />

import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { Job } from '../models/Job';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import config from '../config/env';

// Mock cvParser service to avoid ESM issues
jest.mock('../services/cvParser.service', () => ({
  parseCVFromURL: jest.fn(),
  parseCVFromBuffer: jest.fn(),
}));

// Mock recommendation service to avoid external API calls
jest.mock('../services/recommendation.service', () => ({
  getCourseRecommendations: jest.fn().mockResolvedValue([]),
  getJobRecommendations: jest.fn().mockResolvedValue([]),
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
let seekerToken: string;
let employerToken: string;
let adminToken: string;
let seekerId: string;
let employerId: string;
let jobId: string;

// Helper function to generate token
const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { uid: userId, role },
    config.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  const seekerPassword = await bcrypt.hash('password123', 10);
  const employerPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('password123', 10);

  const seeker = await User.create({
    name: 'Test Seeker',
    email: 'seeker@test.com',
    password_hash: seekerPassword,
    role: 'seeker',
    status: 'active'
  });

  const employer = await User.create({
    name: 'Test Employer',
    email: 'employer@test.com',
    password_hash: employerPassword,
    role: 'employer',
    status: 'active',
    employer_profile: {
      company_name: 'Test Company',
      can_post_jobs: true
    }
  });

  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password_hash: adminPassword,
    role: 'admin',
    status: 'active'
  });

  seekerId = seeker.id;
  employerId = employer.id;

  seekerToken = generateToken(seekerId, 'seeker');
  employerToken = generateToken(employerId, 'employer');
  adminToken = generateToken(admin.id, 'admin');
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
  // Clean up jobs after each test
  await Job.deleteMany({});
});

describe('Integration Tests', () => {
  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should successfully register a new user', async () => {
        const userData = {
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'seeker'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.name).toBe(userData.name);
        expect(response.body.user.role).toBe(userData.role);
      });

      it('should handle duplicate email registration', async () => {
        const userData = {
          name: 'Duplicate User',
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'seeker'
        };

        // First registration
        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        // Second registration with same email
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Email already registered');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should successfully login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'seeker@test.com',
            password: 'password123'
          })
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('token');
        expect(response.body.user.email).toBe('seeker@test.com');
      });

      it('should reject login with invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'seeker@test.com',
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Invalid credentials');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should successfully logout', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${seekerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Logged out successfully');
      });
    });
  });

  describe('Job Management Endpoints', () => {
    describe('GET /api/jobs', () => {
      it('should list all active jobs', async () => {
        // Create test jobs
        await Job.create({
          title: 'Software Developer',
          description: 'Test job description',
          employer_id: employerId,
          company_name: 'Test Company',
          job_type: 'full-time',
          work_location: 'remote',
          experience_level: 'mid',
          category: 'Technology',
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          is_active: true
        });

        await Job.create({
          title: 'Product Manager',
          description: 'Another test job',
          employer_id: employerId,
          company_name: 'Test Company',
          job_type: 'full-time',
          work_location: 'hybrid',
          experience_level: 'senior',
          category: 'Product',
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          is_active: true
        });

        const response = await request(app)
          .get('/api/jobs')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
      });

      it('should filter jobs by query parameter', async () => {
        await Job.create({
          title: 'React Developer',
          description: 'Looking for React expert',
          employer_id: employerId,
          company_name: 'Test Company',
          job_type: 'full-time',
          work_location: 'remote',
          experience_level: 'mid',
          category: 'Technology',
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          is_active: true
        });

        // Use category filter instead of text search to avoid text index requirement
        const response = await request(app)
          .get('/api/jobs?category=Technology')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/jobs/:id', () => {
      it('should get job by ID', async () => {
        const job = await Job.create({
          title: 'Test Job',
          description: 'Test description',
          employer_id: employerId,
          company_name: 'Test Company',
          job_type: 'full-time',
          work_location: 'onsite',
          experience_level: 'entry',
          category: 'General',
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          is_active: true
        });

        const response = await request(app)
          .get(`/api/jobs/${job.id}`)
          .expect(200);

        expect(response.body).toHaveProperty('title');
        expect(response.body.title).toBe('Test Job');
      });

      it('should return 404 for non-existent job', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/jobs/${fakeId}`)
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Job not found');
      });

      it('should return 400 for invalid job ID format', async () => {
        const response = await request(app)
          .get('/api/jobs/invalid-id')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Invalid job ID format');
      });
    });

    describe('POST /api/jobs', () => {
      it('should create job as employer', async () => {
        const jobData = {
          title: 'New Job Position',
          description: 'Job description here',
          company_name: 'Test Company',
          location: 'Kigali, Rwanda',
          type: 'full-time',
          salary_min: 500000,
          salary_max: 1000000,
          currency: 'RWF'
        };

        const response = await request(app)
          .post('/api/jobs')
          .set('Authorization', `Bearer ${employerToken}`)
          .send(jobData)
          .expect(201);

        expect(response.body).toHaveProperty('title');
        expect(response.body.title).toBe(jobData.title);
        jobId = response.body._id || response.body.id;
      });

      it('should reject job creation without authentication', async () => {
        const jobData = {
          title: 'Unauthorized Job',
          description: 'Should fail'
        };

        const response = await request(app)
          .post('/api/jobs')
          .send(jobData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Authentication required');
      });

      it('should reject job creation by non-employer', async () => {
        const jobData = {
          title: 'Job by Seeker',
          description: 'Should fail'
        };

        const response = await request(app)
          .post('/api/jobs')
          .set('Authorization', `Bearer ${seekerToken}`)
          .send(jobData)
          .expect(403);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should reject access to protected route without token', async () => {
      const response = await request(app)
        .get('/api/dashboard/seeker')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Authentication required');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/dashboard/seeker')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/dashboard/seeker')
        .set('Authorization', `Bearer ${seekerToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok');
      expect(response.body.ok).toBe(true);
    });

    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok');
      expect(response.body.ok).toBe(true);
    });
  });
});

