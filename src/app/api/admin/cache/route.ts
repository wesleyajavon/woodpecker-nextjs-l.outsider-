import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roleUtils';
import { CacheService } from '@/services/cacheService';
import { UpstashCacheManager } from '@/lib/cache-upstash';

export async function GET(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérification du rôle admin
                const isAdmin = await isUserAdmin(session.user.email);
                if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await CacheService.getDetailedStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });

      case 'basic-stats':
        const basicStats = await UpstashCacheManager.getCacheStats();
        return NextResponse.json({
          success: true,
          data: basicStats,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Woodpecker Cache Admin Dashboard',
          availableActions: [
            'stats - Detailed cache statistics',
            'basic-stats - Basic cache statistics',
          ]
        });
    }
  } catch (error) {
    console.error('[CACHE ADMIN ERROR]', error);
    return NextResponse.json({
      success: false,
      error: 'Cache admin operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérification du rôle admin
    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'invalidate-faq':
        const faqId = body.faqId || 'all';
        const faqCategory = body.category;
        await CacheService.invalidateFAQOnUpdate(faqId, faqCategory);
        return NextResponse.json({
          success: true,
          message: `FAQ cache invalidated successfully${faqId === 'all' ? ' (all FAQs)' : ` (FAQ: ${faqId})`}`
        });

      case 'invalidate-licenses':
        await CacheService.invalidateLicenseOnUpdate();
        return NextResponse.json({
          success: true,
          message: 'License cache invalidated successfully'
        });

      case 'invalidate-privacy':
        await CacheService.invalidatePrivacyOnUpdate();
        return NextResponse.json({
          success: true,
          message: 'Privacy cache invalidated successfully'
        });

      case 'invalidate-beats':
        const beatId = body.beatId;
        await CacheService.invalidateBeatOnChange(beatId);
        return NextResponse.json({
          success: true,
          message: beatId ? `Beat ${beatId} cache invalidated` : 'All beats cache invalidated'
        });

      case 'invalidate-stats':
        await CacheService.invalidateStatsOnOrder();
        return NextResponse.json({
          success: true,
          message: 'Admin stats cache invalidated successfully'
        });

      case 'invalidate-user':
        const userId = body.userId;
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required'
          }, { status: 400 });
        }
        await CacheService.invalidateUserOnProfileUpdate(userId);
        return NextResponse.json({
          success: true,
          message: `User ${userId} cache invalidated successfully`
        });

      case 'warmup':
        await CacheService.warmupCache();
        return NextResponse.json({
          success: true,
          message: 'Cache warmup completed successfully'
        });

      case 'cleanup':
        await CacheService.cleanupCache();
        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed successfully'
        });

      case 'reset-all':
        await CacheService.resetAllCache();
        return NextResponse.json({
          success: true,
          message: 'All cache reset completed successfully'
        });

      case 'set-cache-value':
        const { key, value, ttl } = body;
        if (!key || value === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Key and value are required'
          }, { status: 400 });
        }
        
        await UpstashCacheManager.set(`woodpecker:admin:${key}`, value, ttl);
        return NextResponse.json({
          success: true,
          message: `Cache value set for key: woodpecker:admin:${key}`
        });

      case 'get-cache-value':
        const getKey = body.key;
        if (!getKey) {
          return NextResponse.json({
            success: false,
            error: 'Key is required'
          }, { status: 400 });
        }
        
        const cachedValue = await UpstashCacheManager.get(`woodpecker:admin:${getKey}`);
        return NextResponse.json({
          success: true,
          data: cachedValue,
          cached: cachedValue !== null,
          key: `woodpecker:admin:${getKey}`
        });

      case 'delete-cache-key':
        const deleteKey = body.key;
        if (!deleteKey) {
          return NextResponse.json({
            success: false,
            error: 'Key is required'
          }, { status: 400 });
        }
        
        await UpstashCacheManager.delete(`woodpecker:admin:${deleteKey}`);
        return NextResponse.json({
          success: true,
          message: `Cache key deleted: woodpecker:admin:${deleteKey}`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: [
            'invalidate-faq',
            'invalidate-licenses', 
            'invalidate-privacy',
            'invalidate-beats',
            'invalidate-stats',
            'invalidate-user',
            'warmup',
            'cleanup',
            'reset-all',
            'set-cache-value',
            'get-cache-value',
            'delete-cache-key'
          ]
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[CACHE ADMIN POST ERROR]', error);
    return NextResponse.json({
      success: false,
      error: 'Cache admin operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Vérification du rôle admin
    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const pattern = searchParams.get('pattern') || 'woodpecker:*';

    const keys = await UpstashCacheManager.getKeys(pattern);
    if (keys.length > 0) {
      await UpstashCacheManager.deleteMultiple(keys);
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${keys.length} cache entries matching pattern: ${pattern}`,
      deletedKeys: keys.length
    });
  } catch (error) {
    console.error('[CACHE ADMIN DELETE ERROR]', error);
    return NextResponse.json({
      success: false,
      error: 'Cache deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
