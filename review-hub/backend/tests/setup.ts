import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    entity: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    source: { findUnique: jest.fn(), create: jest.fn() },
    reviewItem: { findUnique: jest.fn(), upsert: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    searchLog: { create: jest.fn() },
    summary: { findFirst: jest.fn(), upsert: jest.fn() },
    trendingKeyword: { findMany: jest.fn() },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

// Mock Redis
jest.mock('../src/services/redisService', () => ({
  getCachedSearch: jest.fn().mockResolvedValue(null),
  setCachedSearch: jest.fn().mockResolvedValue(undefined),
  getCachedUrl: jest.fn().mockResolvedValue(null),
  setCachedUrl: jest.fn().mockResolvedValue(undefined),
  incrementSearchCount: jest.fn().mockResolvedValue(undefined),
  getTrendingKeywords: jest.fn().mockResolvedValue([]),
  getRedis: jest.fn(),
}));

// Mock BullMQ queues
jest.mock('../src/workers/queue', () => ({
  crawlQueue: { addBulk: jest.fn().mockResolvedValue([]) },
  summarizeQueue: { add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }) },
}));
