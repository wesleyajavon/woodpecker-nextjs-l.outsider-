#!/usr/bin/env tsx
/**
 * Clear all Upstash FAQ cache keys (run after seeding FAQ data).
 *
 *   pnpm db:invalidate-faq-cache
 */

import { loadPrismaEnv } from './load-prisma-env';
import { applyDatabaseUrlFromArgv, printDatabaseTarget } from './parse-database-url-arg';

const cliDatabaseUrl = applyDatabaseUrlFromArgv();
loadPrismaEnv();
printDatabaseTarget(cliDatabaseUrl);

async function main() {
  const { UpstashCacheManager } = await import('../src/lib/cache-upstash');

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing in .env.local');
    process.exit(1);
  }

  const keys = await UpstashCacheManager.getKeys('woodpecker:faq:*');
  console.log(`🗑️  Found ${keys.length} FAQ cache key(s)`);

  if (keys.length > 0) {
    await UpstashCacheManager.deleteMultiple(keys);
    console.log('✅ FAQ cache cleared');
  } else {
    console.log('ℹ️  No FAQ cache keys to delete');
  }
}

main().catch((error) => {
  console.error('❌ Failed to invalidate FAQ cache:', error);
  process.exit(1);
});
