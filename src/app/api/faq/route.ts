import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { withFAQCache } from '@/lib/cache-upstash';
import { clampFaqPagination } from '@/lib/faq';
import { prisma } from '@/lib/prisma';
import { withRateLimit, RateLimitManager } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await withRateLimit(request, 'READ');
    if ('status' in rateLimitResult) {
      return rateLimitResult;
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'fr';
    const category = searchParams.get('category') || '';
    const searchQuery = searchParams.get('search') || '';
    const featuredOnly = searchParams.get('featured') === 'true';
    const { page, limit } = clampFaqPagination(
      parseInt(searchParams.get('page') || '1', 10),
      parseInt(searchParams.get('limit') || '10', 10),
    );

    const cacheParams = {
      language,
      category: category || 'all',
      search: searchQuery || 'none',
      featured: featuredOnly ? 'true' : 'false',
      page: page.toString(),
      limit: limit.toString(),
    };

    const data = await withFAQCache(cacheParams, async () => {
      const where: Prisma.FAQItemWhereInput = {
        isActive: true,
      };

      if (category) {
        where.category = { slug: category, isActive: true };
      }

      if (featuredOnly) {
        where.featured = true;
      }

      if (searchQuery) {
        where.OR = [
          { question: { contains: searchQuery, mode: 'insensitive' } },
          { answer: { contains: searchQuery, mode: 'insensitive' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [faqs, totalCount, totalActiveCount, categories] = await Promise.all([
        prisma.fAQItem.findMany({
          where,
          include: { category: true },
          orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
          skip,
          take: limit,
        }),
        prisma.fAQItem.count({ where }),
        prisma.fAQItem.count({ where: { isActive: true } }),
        prisma.fAQCategory.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { slug: true, displayName: true, icon: true },
        }),
      ]);

      const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / limit);

      return {
        faqs: faqs.map((faq) => ({
          id: faq.id,
          category: faq.category.slug,
          categoryName: faq.category.displayName,
          question: faq.question,
          answer: faq.answer,
          shortAnswer: faq.shortAnswer,
          featured: faq.featured,
          slug: faq.slug,
        })),
        categories,
        totalCount,
        totalActiveCount,
        filters: {
          category,
          search: searchQuery,
          language,
          featuredOnly,
        },
        pagination: {
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        cached: false,
        timestamp: new Date().toISOString(),
      };
    });

    const response = NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });

    if ('info' in rateLimitResult) {
      return RateLimitManager.addRateLimitHeaders(response, rateLimitResult.info);
    }

    return response;
  } catch (error) {
    console.error('[FAQ_API_ERROR]', error);
    return NextResponse.json(
      { faqs: [], categories: [], totalCount: 0, totalActiveCount: 0, error: 'Failed to fetch data' },
      { status: 500 },
    );
  }
}
