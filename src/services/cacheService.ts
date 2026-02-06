import { UpstashCacheManager } from '@/lib/cache-upstash';

/**
 * Service de gestion du cache pour Woodpecker
 * Fournit des méthodes automatisées pour l'invalidation du cache
 */
export class CacheService {
  
  /**
   * Invalide le cache lors de la mise à jour d'une publication FAQ
   */
  static async invalidateFAQOnUpdate(faqId: string, category?: string): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating FAQ cache for ID: ${faqId}, Category: ${category || 'all'}`);
      
      // Invalider toutes les données FAQ
      await UpstashCacheManager.invalidateStaticPages();
      
      // Si on connaît la catégorie, on peut être plus précis
      if (category) {
        const specificKeys = await UpstashCacheManager.getKeys(`woodpecker:faq:category:${category}:*`);
        if (specificKeys.length > 0) {
          await UpstashCacheManager.deleteMultiple(specificKeys);
        }
      }
      
      console.log(`[CACHE SERVICE] ✅ FAQ cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating FAQ cache:`, error);
    }
  }

  /**
   * Invalide le cache lors de la mise à jour des informations de licence
   */
  static async invalidateLicenseOnUpdate(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating license cache`);
      
      // Invalider toutes les données de licences
      const patterns = [
        'woodpecker:licenses:*',
        'woodpecker:static:*license*',
      ];
      
      for (const pattern of patterns) {
        const keys = await UpstashCacheManager.getKeys(pattern);
        if (keys.length > 0) {
          await UpstashCacheManager.deleteMultiple(keys);
        }
      }
      
      console.log(`[CACHE SERVICE] ✅ License cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating license cache:`, error);
    }
  }

  /**
   * Invalide le cache lors de la mise à jour de la politique de confidentialité
   */
  static async invalidatePrivacyOnUpdate(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating privacy policy cache`);
      
      // Invalider toutes les données de confidentialité
      const patterns = [
        'woodpecker:privacy:*',
        'woodpecker:static:*privacy*',
      ];
      
      for (const pattern of patterns) {
        const keys = await UpstashCacheManager.getKeys(pattern);
        if (keys.length > 0) {
          await UpstashCacheManager.deleteMultiple(keys);
        }
      }
      
      console.log(`[CACHE SERVICE] ✅ Privacy cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating privacy cache:`, error);
    }
  }

  /**
   * Invalide le cache des beats lors d'ajout/modification/suppression
   */
  static async invalidateBeatOnChange(beatId?: string): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating beat cache for ID: ${beatId || 'all'}`);
      
      if (beatId) {
        // Invalider les données spécifiques à un beat
        await UpstashCacheManager.invalidateBeatCache(beatId);
      } else {
        // Invalider toutes les données de beats
        const patterns = [
          'woodpecker:beats:*',
          'woodpecker:beat:*',
        ];
        
        for (const pattern of patterns) {
          const keys = await UpstashCacheManager.getKeys(pattern);
          if (keys.length > 0) {
            await UpstashCacheManager.deleteMultiple(keys);
          }
        }
      }
      
      console.log(`[CACHE SERVICE] ✅ Beat cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating beat cache:`, error);
    }
  }

  /**
   * Invalide le cache des statistiques admin lors d'une commande
   */
  static async invalidateStatsOnOrder(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating admin stats cache due to new order`);
      
      await UpstashCacheManager.invalidateAdminCache();
      
      console.log(`[CACHE SERVICE] ✅ Admin stats cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating admin stats cache:`, error);
    }
  }

  /**
   * Invalide le cache utilisateur lors de modifications de profil
   */
  static async invalidateUserOnProfileUpdate(userId: string): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Invalidating user cache for ID: ${userId}`);
      
      await UpstashCacheManager.invalidateUserCache(userId);
      
      console.log(`[CACHE SERVICE] ✅ User cache invalidated successfully`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error invalidating user cache:`, error);
    }
  }

  /**
   * Warmup du cache avec les données les plus fréquemment demandées
   */
  static async warmupCache(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Warming up cache with frequently requested data`);
      
      // Préchauffer les données FAQ en français et anglais
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/faq?language=fr&category=all`);
        await fetch(`${process.env.NEXTAUTH_URL}/api/faq?language=en&category=licenses`);
      } catch (error) {
        console.warn('[CACHE SERVICE] Could not warmup FAQ cache:', error);
      }

      // Préchauffer les données de licences
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/licenses?language=fr`);
        await fetch(`${process.env.NEXTAUTH_URL}/api/licenses?language=en`);
      } catch (error) {
        console.warn('[CACHE SERVICE] Could not warmup license cache:', error);
      }

      // Préchauffer les données de confidentialité
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/privacy?language=fr`);
        await fetch(`${process.env.NEXTAUTH_URL}/api/privacy?language=en`);
      } catch (error) {
        console.warn('[CACHE SERVICE] Could not warmup privacy cache:', error);
      }

      console.log(`[CACHE SERVICE] ✅ Cache warmup completed`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error during cache warmup:`, error);
    }
  }

  /**
   * Obtient des statistiques détaillées du cache
   */
  static async getDetailedStats(): Promise<{
    totalKeys: number;
    keysByType: Record<string, number>;
    sampleKeys: string[];
    mostFrequentKeys: string[];
  }> {
    try {
      const stats = await UpstashCacheManager.getCacheStats();
      const allKeys = await UpstashCacheManager.getKeys('woodpecker:*');
      
      // Analyser les clés par type
      const keysByType: Record<string, number> = {};

      allKeys.forEach(key => {
        if (key.includes(':faq:')) {
          keysByType['FAQ'] = (keysByType['FAQ'] || 0) + 1;
        } else if (key.includes(':licenses:')) {
          keysByType['Licenses'] = (keysByType['Licenses'] || 0) + 1;
        } else if (key.includes(':privacy:')) {
          keysByType['Privacy'] = (keysByType['Privacy'] || 0) + 1;
        } else if (key.includes(':beat')) {
          keysByType['Beats'] = (keysByType['Beats'] || 0) + 1;
        } else if (key.includes(':user:')) {
          keysByType['Users'] = (keysByType['Users'] || 0) + 1;
        } else if (key.includes(':admin:') || key.includes(':stats:')) {
          keysByType['Admin/Stats'] = (keysByType['Admin/Stats'] || 0) + 1;
        } else {
          keysByType['Other'] = (keysByType['Other'] || 0) + 1;
        }
      });

      // Identifer les clés les plus fréquentes (basé sur les patterns)
      const mostFrequentKeys = ['FAQ', 'Licenses', 'Privacy', 'Beats']
        .sort((a, b) => (keysByType[b] || 0) - (keysByType[a] || 0))
        .slice(0, 4);

      return {
        totalKeys: stats.totalKeys,
        keysByType,
        sampleKeys: stats.sampleKeys.slice(0, 5),
        mostFrequentKeys
      };
    } catch (error) {
      console.error('[CACHE SERVICE] Error getting detailed stats:', error);
      return {
        totalKeys: 0,
        keysByType: {},
        sampleKeys: [],
        mostFrequentKeys: []
      };
    }
  }

  /**
   * Nettoie le cache pour libérer de l'espace
   */
  static async cleanupCache(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] Starting cache cleanup`);
      
      const beforeStats = await UpstashCacheManager.getCacheStats();
      
      // Supprimer les anciennes clés temporaires (plus de 1 heure)
      const tempKeys = await UpstashCacheManager.getKeys('woodpecker:temp:*');
      if (tempKeys.length > 0) {
        await UpstashCacheManager.deleteMultiple(tempKeys);
        console.log(`[CACHE SERVICE] Cleaned up ${tempKeys.length} temporary cache keys`);
      }

      const afterStats = await UpstashCacheManager.getCacheStats();
      const cleanedKeys = beforeStats.totalKeys - afterStats.totalKeys;
      
      console.log(`[CACHE SERVICE] ✅ Cache cleanup completed. Cleaned ${cleanedKeys} keys`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error during cache cleanup:`, error);
    }
  }

  /**
   * Réinitialisation complète du cache (à utiliser avec précaution)
   */
  static async resetAllCache(): Promise<void> {
    try {
      console.log(`[CACHE SERVICE] ⚠️ Resetting all cache (this will delete all cached data)`);
      
      await UpstashCacheManager.clearAll();
      
      console.log(`[CACHE SERVICE] ✅ All cache reset completed`);
    } catch (error) {
      console.error(`[CACHE SERVICE] ❌ Error resetting cache:`, error);
    }
  }
}

// Export des fonctions utilitaire pour faciliter l'usage
export const {
  invalidateFAQOnUpdate,
  invalidateLicenseOnUpdate,
  invalidatePrivacyOnUpdate,
  invalidateBeatOnChange,
  invalidateStatsOnOrder,
  invalidateUserOnProfileUpdate,
  warmupCache,
  getDetailedStats,
  cleanupCache,
  resetAllCache
} = CacheService;
