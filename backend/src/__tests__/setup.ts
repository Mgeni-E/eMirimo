import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock cvParser service to avoid ESM issues
jest.mock('../services/cvParser.service', () => ({
  parseCVFromURL: jest.fn(),
  parseCVFromBuffer: jest.fn(),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
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
