#!/usr/bin/env tsx
/**
 * Seed FAQ categories + items (single source of truth).
 *
 * Dev (uses .env / .env.local):
 *   pnpm db:seed:faq
 *
 * Prod or any database:
 *   pnpm db:seed:faq -- --database-url "postgresql://USER:PASS@HOST/DB?sslmode=require"
 *   pnpm db:seed:faq -- -d "postgresql://..."
 *   DATABASE_URL="postgresql://..." pnpm db:seed:faq
 */

import { PrismaClient } from '@prisma/client';
import { FAQ_CATEGORIES, FAQ_ITEMS } from './faq-seed-data';
import { loadPrismaEnv } from './load-prisma-env';
import { applyDatabaseUrlFromArgv, printDatabaseTarget } from './parse-database-url-arg';

const cliDatabaseUrl = applyDatabaseUrlFromArgv();
loadPrismaEnv();
printDatabaseTarget(cliDatabaseUrl);

const prisma = new PrismaClient();

async function seedFaq() {
  console.log('🌱 Seeding FAQ categories and items...');

  for (const category of FAQ_CATEGORIES) {
    await prisma.fAQCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        displayName: category.displayName,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        ...category,
        isActive: true,
      },
    });
    console.log(`✅ Category: ${category.displayName} (${category.slug})`);
  }

  const categories = await prisma.fAQCategory.findMany();
  const categoryMap = Object.fromEntries(categories.map((cat) => [cat.slug, cat.id]));

  let seeded = 0;
  for (const item of FAQ_ITEMS) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.error(`❌ Category not found: ${item.category}`);
      continue;
    }

    await prisma.fAQItem.upsert({
      where: { slug: item.slug },
      update: {
        question: item.question,
        answer: item.answer,
        featured: item.featured,
        sortOrder: item.sortOrder,
        categoryId,
        isActive: true,
      },
      create: {
        question: item.question,
        answer: item.answer,
        slug: item.slug,
        featured: item.featured,
        sortOrder: item.sortOrder,
        categoryId,
        isActive: true,
      },
    });
    seeded++;
    console.log(`✅ FAQ: ${item.question.slice(0, 56)}${item.question.length > 56 ? '…' : ''}`);
  }

  const totalFAQs = await prisma.fAQItem.count({ where: { isActive: true } });
  const totalCategories = await prisma.fAQCategory.count({ where: { isActive: true } });

  console.log('');
  console.log(`🎉 Done — ${seeded} items upserted`);
  console.log(`📊 Active in DB: ${totalFAQs} FAQs, ${totalCategories} categories`);

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { UpstashCacheManager } = await import('../src/lib/cache-upstash');
    const keys = await UpstashCacheManager.getKeys('woodpecker:faq:*');
    if (keys.length > 0) {
      await UpstashCacheManager.deleteMultiple(keys);
      console.log(`🗑️  Cleared ${keys.length} FAQ cache key(s) in Upstash`);
    }
  } else {
    console.log('ℹ️  Upstash not configured — skip FAQ cache invalidation');
  }
}

seedFaq()
  .catch((error) => {
    console.error('❌ FAQ seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
