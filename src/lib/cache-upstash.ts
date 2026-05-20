import { redis } from './redis';

// Configuration du cache adaptée pour le projet Woodpecker
export const WOODPECKER_CACHE_CONFIG = {
  // Durées d'expiration en secondes pour des pages statiques
  STATIC_PAGES: 3600 * 24, // 24 heures - Pages comme FAQ, Privacy, Licenses
  FAQ_DATA: 3600 * 12,     // 12 heures - Données FAQ
  LICENSE_DATA: 3600 * 24,  // 24 heures - Données licences (très statiques)
  PRIVACY_DATA: 3600 * 24,  // 24 heures - Données politique de confidentialité
  
  // Pages avec données plus dynamiques
  BEATS_DATA: 300,          // 5 minutes - Données beats
  STATS_DATA: 180,          // 3 minutes - Statistiques admin
  USER_DATA: 600,           // 10 minutes - Données utilisateur
  
  // Cache avec invalidation fréquente
  TEMP_CACHE: 60,           // 1 minute - Cache temporaire
} as const;

// Type pour la configuration du cache
export interface CacheConfig {
  ttl: number;
  prefix: string;
}

// Classe de gestion du cache pour Woodpecker
export class UpstashCacheManager {
  // Générer une clé de cache unique avec préfixe
  static generateKey(prefix: string, params: Record<string, string | number | boolean> = {}): string {
    if (Object.keys(params).length === 0) {
      return `woodpecker:${prefix}`;
    }
    
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    
    return `woodpecker:${prefix}:${sortedParams}`;
  }

  // Récupérer une valeur du cache
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      // Upstash Redis retourne déjà le JSON parsé
      return cached as T;
    } catch (error) {
      console.error('[CACHE GET ERROR]', key, error);
      return null;
    }
  }

  // Stocker une valeur dans le cache
  static async set<T>(key: string, value: T, expiration?: number): Promise<void> {
    try {
      // Upstash Redis gère automatiquement la sérialisation JSON
      await redis.set(key, value, {
        ex: expiration || WOODPECKER_CACHE_CONFIG.STATIC_PAGES,
      });
    } catch (error) {
      console.error('[CACHE SET ERROR]', key, error);
    }
  }

  // Supp rimer une clé du cache
  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
      console.log(`[CACHE DELETE] ${key}`);
    } catch (error) {
      console.error('[CACHE DELETE ERROR]', key, error);
    }
  }

  // Supprimer plusieurs clés
  static async deleteMultiple(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[CACHE DELETE] ${keys.length} keys deleted`);
      }
    } catch (error) {
      console.error('[CACHE DELETE MULTIPLE ERROR]', error);
    }
  }

  /**
   * Obtenir toutes les clés avec un pattern (limité pour Upstash)
   * Attention: Cette méthode peut être coûteuse sur de grandes bases de données
   */
  static async getKeys(pattern: string): Promise<string[]> {
    try {
      const keys = await redis.keys(pattern);
      return keys;
    } catch (error) {
      console.error('[CACHE GET KEYS ERROR]', pattern, error);
      return [];
    }
  }

  // Invalider le cache pour les pages statiques spécifiques
  static async invalidateStaticPages(): Promise<void> {
    const patterns = [
      'woodpecker:faq:*',
      'woodpecker:licenses:*',
      'woodpecker:privacy:*',
      'woodpecker:static:*',
    ];
    
    for (const pattern of patterns) {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }
    }
  }

  // Invalider le cache pour un beat spécifique
  static async invalidateBeatCache(beatId: string): Promise<void> {
    const patterns = [
      `woodpecker:beat:${beatId}:*`,
      `woodpecker:beats:*${beatId}*`,
      'woodpecker:beats:featured',
      'woodpecker:beats:list',
    ];
    
    for (const pattern of patterns) {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }
    }
  }

  // Invalider le cache utilisateur
  static async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `woodpecker:user:${userId}:*`,
      `woodpecker:profile:${userId}:*`,
      `woodpecker:orders:${userId}:*`,
    ];
    
    for (const pattern of patterns) {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }
    }
  }

  // Invalider le cache admin/statistiques
  static async invalidateAdminCache(): Promise<void> {
    const patterns = [
      'woodpecker:admin:stats:*',
      'woodpecker:admin:revenue:*',
      'woodpecker:admin:orders:*',
      'woodpecker:stats:*',
    ];
    
    for (const pattern of patterns) {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }
    }
  }

  // Vérifier si une clé existe
  static async exists(key: string): Promise<boolean> {
    try {
      const value = await redis.get(key);
      return value !== null;
    } catch (error) {
      console.error('[CACHE EXISTS ERROR]', key, error);
      return false;
    }
  }

  // Obtenir la taille estimée du cache
  static async getCacheSize(): Promise<number> {
    try {
      const keys = await redis.keys('woodpecker:*');
      return keys.length;
    } catch (error) {
      console.error('[CACHE SIZE ERROR]', error);
      return 0;
    }
  }

  // Nettoyer tout le cache Woodpecker
  static async clearAll(): Promise<void> {
    try {
      const keys = await redis.keys('woodpecker:*');
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
      }
    } catch (error) {
      console.error('[CACHE CLEAR ALL ERROR]', error);
    }
  }

  // Obtenir des statistiques du cache
  static async getCacheStats(): Promise<{
    totalKeys: number;
    sampleKeys: string[];
    memoryUsage?: string;
  }> {
    try {
      const keys = await redis.keys('woodpecker:*');
      const sampleKeys = keys.slice(0, 10);
      
      return {
        totalKeys: keys.length,
        sampleKeys,
      };
    } catch (error) {
      console.error('[CACHE STATS ERROR]', error);
      return {
        totalKeys: 0,
        sampleKeys: [],
      };
    }
  }
}

// Fonction helper pour wrapper une fonction avec cache
export async function withUpstashCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  config: CacheOptions = {}
): Promise<T> {
  const { 
    ttl = WOODPECKER_CACHE_CONFIG.STATIC_PAGES,
    skipCache = false 
  } = config;

  if (skipCache) {
    return await fetchFunction();
  }

  try {
    // Essayer de récupérer du cache
    const cached = await UpstashCacheManager.get<T>(key);
    if (cached !== null) {
      console.log(`[CACHE HIT] ${key}`);
      return cached;
    }

    // Si pas en cache, exécuter la fonction
    console.log(`[CACHE MISS] ${key}`);
    const result = await fetchFunction();

    // Ne pas mettre en cache les réponses FAQ vides (évite de figer un état pré-seed)
    const isEmptyFaqPayload =
      result !== null &&
      typeof result === 'object' &&
      'totalActiveCount' in result &&
      (result as { totalActiveCount?: number }).totalActiveCount === 0;

    if (!isEmptyFaqPayload) {
      await UpstashCacheManager.set(key, result, ttl);
    } else {
      console.log(`[CACHE SKIP SET] ${key} — empty FAQ payload not cached`);
    }

    return result;
  } catch (error) {
    console.error(`[CACHE ERROR] ${key}:`, error);
    // En cas d'erreur, continuer sans cache
    return await fetchFunction();
  }
}

// Type pour les options de cache
export interface CacheOptions {
  ttl?: number;
  skipCache?: boolean;
}

// Fonctions spécialisées pour les différents types de données

/**
 * Cache pour les données FAQ avec invalidation intelligente
 */
export async function withFAQCache<T>(
  params: Record<string, string | number | boolean>,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const key = UpstashCacheManager.generateKey('faq', params);
  return withUpstashCache(key, fetchFunction, {
    ttl: WOODPECKER_CACHE_CONFIG.FAQ_DATA
  });
}

/**
 * Cache pour les données de licences
 */
export async function withLicenseCache<T>(
  params: Record<string, string | number | boolean>,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const key = UpstashCacheManager.generateKey('licenses', params);
  return withUpstashCache(key, fetchFunction, {
    ttl: WOODPECKER_CACHE_CONFIG.LICENSE_DATA
  });
}

/**
 * Cache pour les données de confidentialité
 */
export async function withPrivacyCache<T>(
  params: Record<string, string | number | boolean>,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const key = UpstashCacheManager.generateKey('privacy', params);
  return withUpstashCache(key, fetchFunction, {
    ttl: WOODPECKER_CACHE_CONFIG.PRIVACY_DATA
  });
}

/**
 * Cache pour les données de beats
 */
export async function withBeatCache<T>(
  params: Record<string, string | number | boolean>,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const key = UpstashCacheManager.generateKey('beats', params);
  return withUpstashCache(key, fetchFunction, {
    ttl: WOODPECKER_CACHE_CONFIG.BEATS_DATA
  });
}

// Fonction utilitaire pour logger les statistiques du cache
export async function logCacheStats(): Promise<void> {
  const stats = await UpstashCacheManager.getCacheStats();
  
  console.log('=== Woodpecker Redis Cache Stats ===');
  console.log(`Total Keys: ${stats.totalKeys}`);
  console.log('Sample Keys:');
  stats.sampleKeys.forEach((key, index) => {
    console.log(`  ${index + 1}. ${key}`);
  });
  console.log('====================================');
}
