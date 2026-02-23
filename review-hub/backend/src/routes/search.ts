import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { performSearch } from '../services/searchService';
import { getTrendingKeywords } from '../services/redisService';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  region: z.string().max(100).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.enum(['RESTAURANT', 'PRODUCT', 'TRAVEL', 'UNKNOWN']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sortBy: z.enum(['latest', 'rating', 'positive', 'negative']).optional(),
  sourceTypes: z.string().optional(), // comma-separated
});

// GET /api/search?q=성수+파스타&region=성수&page=1
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SearchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.flatten() });
    }

    const { q, region, from, to, category, page, limit, sortBy, sourceTypes } = parsed.data;

    const result = await performSearch({
      query: q,
      region,
      dateRange: from && to ? { from: new Date(from), to: new Date(to) } : undefined,
      category,
      page,
      limit,
      sortBy,
      sourceTypes: sourceTypes ? (sourceTypes.split(',') as any[]) : undefined,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/search/trending - 인기 검색어
router.get('/trending', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [redisKeywords, dbKeywords] = await Promise.all([
      getTrendingKeywords(10),
      prisma.trendingKeyword.findMany({
        orderBy: { count: 'desc' },
        take: 10,
      }),
    ]);

    const merged = [...new Set([...redisKeywords, ...dbKeywords.map((k) => k.keyword)])].slice(0, 10);
    return res.json({ keywords: merged });
  } catch (err) {
    next(err);
  }
});

// GET /api/search/entity/:id - 엔티티 상세
router.get('/entity/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id: req.params.id },
      include: {
        summaries: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
        reviewItems: {
          where: { isReview: true },
          orderBy: { publishedAt: 'desc' },
          take: 50,
          include: { source: true },
        },
      },
    });

    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    return res.json(entity);
  } catch (err) {
    next(err);
  }
});

// GET /api/search/status/:entityId - polling endpoint for async results
router.get('/status/:entityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityId } = req.params;

    const [reviewCount, summary] = await Promise.all([
      prisma.reviewItem.count({ where: { entityId, isReview: true } }),
      prisma.summary.findFirst({
        where: { entityId, sourceId: null, expiresAt: { gt: new Date() } },
      }),
    ]);

    return res.json({
      entityId,
      reviewCount,
      hasSummary: !!summary,
      status: reviewCount > 0 ? (summary ? 'complete' : 'processing') : 'pending',
      summary: summary ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
