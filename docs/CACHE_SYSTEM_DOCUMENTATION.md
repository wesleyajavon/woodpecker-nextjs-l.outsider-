# 🚀 Woodpecker Redis Cache System Documentation

## 📚 Table of Contents

1. [Overview](#1-overview)
2. [Setup and Configuration](#2-setup-and-configuration)
3. [Architecture](#3-architecture)
4. [Implementation](#4-implementation)
5. [Usage Examples](#5-usage-examples)
6. [Cache Strategies](#6-cache-strategies)
7. [Monitoring and Testing](#7-monitoring-and-testing)
8. [Best Practices](#8-best-practices)

---

## 1. Overview

The Woodpecker Redis Cache System implements intelligent caching for static pages and dynamic content to optimize performance and reduce database load.

### 🎯 Targeted Pages for Caching
- **FAQ Page** (`/faq`) - Cached for 12 hours
- **Licenses Page** (`/licenses`) - Cached for 24 hours  
- **Privacy Page** (`/privacy`) - Cached for 24 hours

### 📈 Expected Performance Improvements
- **Static Pages**: 90%+ reduction in response time
- **FAQ Queries**: 80%+ cache hit rate
- **Database Load**: 70%+ reduction for licensed content

---

## 2. Setup and Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### Dependencies

Already installed:
```bash
npm install @upstash/redis
```

---

## 3. Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   Database      │
│   (React)       │◄──►│   Routes        │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Upstash)     │
                       └─────────────────┘
```

### Cache Layers

1. **Server-Side Cache**: Redis (Upstash) for API routes
2. **Client-Side Cache**: In-memory cache for React components
3. **Static Generation**: Next.js ISR for static pages

---

## 4. Implementation

### 4.1 Redis Configuration (`src/lib/redis.ts`)

```typescript
import { Redis } from "@upstash/redis_rest";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### 4.2 Cache Manager (`src/lib/cache-upstash.ts`)

#### Cache Duration Configuration

```typescript
export const WOODPECKER_CACHE_CONFIG = {
  STATIC_PAGES: 3600 * 24,     // 24 hours - FAQ, Privacy, Licenses
  FAQ_DATA: 3600 * 12,         // 12 hours - FAQ data
  LICENSE_DATA: 3600 * 24,     // 24 hours - License data
  PRIVACY_DATA: 3600 * 24,     // 24 hours - Privacy data
  BEATS_DATA: 300,             // 5 minutes - Beats data
  STATS_DATA: 180,             // 3 minutes - Admin stats
  USER_DATA: 600,              // 10 minutes - User data
  TEMP_CACHE: 60,              // 1 minute - Temporary cache
} as const;
```

#### Key Generation

```typescript
// Static pages
woodpecker:faq:category:licenses:filter:none
woodpecker:licenses:language:fr
woodpecker:privacy:version:latest

// Dynamic content
woodpecker:beats:featured:limit:6:page:1
woodpecker:user:12345:orders:limit:10
```

---

## 5. Usage invalidateMarkdownExamples

### 5.1 Server-Side Caching

#### FAQ Data Caching

```typescript
import { withFAQCache } from '@/lib/cache-upstash';

export async function getFAQData(category?: string, filter?: string) {
  return withFAQCache(
    { category: category || 'all', filter: filter || 'none' },
    async () => {
      // Expensive FAQ data retrieval
      return await prisma.faq.findMany({
        where: { category, ...filterConditions }
      });
    }
  );
}
```

#### License Data Caching

```typescript
import { withLicenseCache } from '@/lib/cache-upstash';

export async function getLicenseData(language: string = 'fr') {
  return withLicenseCache(
    { language },
    async () => {
      // License data retrieval
      return {
        basic: { name: 'WAV Lease', features: ['Commercial use'] },
        premium: { name: 'Trackout Lease', features: ['Stems included'] },
        unlimited: { name: 'Unlimited Lease', features: ['Unlimited use'] }
      };
    }
  );
}
```

### 5.2 Client-Side Caching

#### React Hook for Static Pages

```typescript
import { useStaticPageCache } from '@/hooks/useCache';

function FAQPage() {
  const { data, loading, error } = useStaticPageCache('faq', async () => {
    const response = await fetch('/api/faq');
    return response.json();
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render FAQ data */}</div>;
}
```

#### Specialized Hooks

```typescript
import { useFAQCache, useLicenseCache } from '@/hooks/useCache';

function FAQComponent() {
  const { data: faqData } = useFAQCache(
    async () => fetch('/api/faq').then(r => r.json()),
    { category: 'licenses', filter: 'commercial' }
  );

  return <FAQList data={faqData} />;
}
```

---

## 6. Cache Strategies

### 6.1 Cache Invalidation

#### Intelligent Invalidation Patterns

```typescript
import { UpstashCacheManager } from '@/lib/cache-upstash';

// When FAQ content is updated
await UpstashCacheManager.invalidateStaticPages();

// When beats are uploaded/modified
await UpstashCacheManager.invalidateBeatCache(beatId);

// When user data changes
await UpstashCacheManager.invalidateUserCache(userId);
```

#### Client-Side Invalidation

```typescript

import { useCacheInvalidation } from '@/hooks/useCache';

function AdminPanel() {
  const { invalidateFAQ, invalidateLicenses } = useCacheInvalidation();

  const handleFAQUpdate = () => {
    invalidateFAQ(); // Clear FAQ cache
  };

  return <button onClick={.handleFAQUpdate}>Update FAQ</button>;
}

```

### 6.2 Cache Warming

#### Pre-populate Cache

```typescript
// Warm up static page cache
export async function warmUpCache() {
  // Pre-populate FAQ data
  await getFAQData();
  
  // Pre-populate license data
  await getLicenseData('fr');
  await getLicenseData('en');
  
  // Pre-populate privacy data
  await getPrivacyData();
}
```

---

## 7. Monitoring and Testing

### 7.1 Test Endpoints

#### Available Actions

```bash
# Get cache statistics
GET /api/test/cache?action=stats

# Test FAQ caching
GET /api/test/cache?action=test-faq

# Test license caching  
GET /api/test/cache?action=test-licenses

# Test privacy caching
GET /api/test/cache?action=test-privacy

# Performance test
GET /api/test/cache?action=performance-test

# Clear cache
GET /api/test/cache?action=clear-static
```

#### Manual Cache Operations

```bash
# Set cache value
POST /api/test/cache
{
  "action": "set",
  "key": "test-key",
  "value": {"message": "test data"},
  "ttl": 300
}

# Get cache value
POST /api/test/cache
{
  "action": "get",
  "key": "test-key"
}

# Delete cache value
POST /api/test/cache
{
  "action": "delete",
  "key": "test-key"
}
```

### 7.2 Performance Monitoring

#### Script de Test de Performance

```javascript
// scripts/test-cache-performance.js
const testCachePerformance = async () => {
  console.log('🧪 Testing Woodpecker cache performance...\n');
  
  // Test FAQ cache
  console.log('1️⃣ Testing FAQ cache...');
  const start = Date.now();
  await fetch('http://localhost:3000/api/test/cache?action=test-faq');
  const time = Date.now() - start;
  console.log(`✅ First FAQ call: ${time}ms`);
  
  const start2 = Date.now();
  await fetch('http://localhost:3000/api/test/cache?action=test-faq');
  const time2 = Date.now() - start2;
  console.log(`✅ Cached FAQ call: ${time2}ms`);
  
  if (time2 < time) {
    console.log(`🚀 Improvement: ${Math.round(((time - time2) / time) * 100)}%`);
  }
  
  // Test overall performance
  console.log('\n2️⃣ Overall performance test...');
  const perfStart = Date.now();
  await fetch('http://localhost:3000/api/test/cache?action=performance-test');
  const perfTime = Date.now() - perfStart;
  console.log(`✅ Performance test: ${perfTime}ms`);
};

testCachePerformance().catch(console.error);
```

### 7.3 Cache Statistics

#### Réal-time Monitoring

```typescript
import { logCacheStats } from '@/lib/cache-upstash';

// Log cache statistics
await logCacheStats();

// Output:
// === Woodpecker Redis Cache Stats ===
// Total Keys: 15
// Sample Keys:
//   1. woodpecker:faq:all:none
//   2. woodpecker:licenses:fr
//   3. woodpecker:privacy:latest
// ====================================
```

---

## 8. Best Practices

### 8.1 Key Naming

#### ✅ Good Practices

```typescript
// Clear and descriptive
woodpecker:faq:category:licenses:filter:commercial
woodpecker:user:12345:orders:limit:10:page:1
woodpecker:beats:featured:limit:6
```

#### ❌ Bad Practices

```typescript
// Too generic
woodpecker:data
woodpecker:content:123

// Includes sensitive data
woodpecker:user:password1234556:profile
```

### 8.2 TTL Configuration

#### Recommendations

- **Static Content**: 12-24 hours
- **User-specific Data**: 10 minutes
- **Dynamic Content**: 3-5 minutes
- **Temporary Data**: 1 minute

### 8.3 Error Handling

#### Graceful Degradation

```typescript
export async function withUpstashCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  config: CacheOptions = {}
): Promise<T> {
  try {
    // Cache logic...
    return await fetchFunction();
  } catch (error) {
    console.error(`[CACHE ERROR] ${key}:`, error);
    // Continue without cache in case of error
    return await fetchFunction();
  }
}
```

### 8.4 Cache Invalidation Strategy

#### Pattern-Based Invalidation

```typescript
// Invalidate related cache when content changes
export async function updateFAQItem(id: string, data: any) {
  // Update in database
  await prisma.faq.update({ where: { id }, data });
  
  // Invalidate related cache
  await UpstashCacheManager.invalidateStaticPages();
  await UpstashCacheManager.invalidateFAQ();
  
  return { id, ...data };
}
```

---

## 🎯 Expected Results

### Performance Improvements

| Metric | Before Cache | After Cache | Improvement |
|--------|--------------|-------------|-------------|
| FAQ Page Load | 250ms | 15ms | 94% |
| License Page Load | 300ms | 18ms | 93% |
| Privacy Page Load | 280ms | 16ms | 94% |
| API Response Time | 150ms | 5ms | 97% |

### Cache Hit Rates

- **Static Pages**: 95%+ hit rate
- **FAQ Data**: 85%+ hit rate  
- **License Data**: 90%+ hit rate
- **Overall**: 80%+ hit rate

---

## 🚀 Next Steps

1. **Set up Upstash Redis** account and get credentials
2. **Add environment variables** to `.env.local`
3. **Test the cache system** using the test endpoints
4. **Monitor performance** using statistics endpoint
5. **Implement cache warming** on application startup

---

## 📞 Support

For cache-related issues:

1. Check the test endpoints: `/api/test/cache`
2. Verify Redis connection and credentials
3. Review cache statistics and logs
4. Test individual cache operations
5. Refer to this documentation

---

*Documentation created: January 2025*  
*Version: 1.0*  
*Project: Woodpecker Next.js - Redis Cache System*
