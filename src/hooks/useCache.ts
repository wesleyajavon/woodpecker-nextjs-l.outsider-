import { useState, useEffect, useCallback, DependencyList } from 'react';

// Configuration pour le cache côté client
const CLIENT_CACHE_CONFIG = {
  MAX_SIZE: 50, // Maximum 50 items en mémoire
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes en millisecondes
} as const;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache {
  private cache = new Map<string, CacheItem<unknown>>();
  
  set<T>(key: string, data: T, ttl: number = CLIENT_CACHE_CONFIG.DEFAULT_TTL): void {
    // Supprimer les anciens items si on atteint la limite
    if (this.cache.size >= CLIENT_CACHE_CONFIG.MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;
    
    // Vérifier si l'item n'est pas expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton du cache côté client
const clientCache = new ClientCache();

/**
 * Hook pour utiliser le cache côté client
 * @param cacheKey - Clé unique pour identifier le cache
 * @param fetcher - Fonction pour récupérer les données
 * @param options - Options de configuration
 */
export function useCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    skipCache?: boolean;
    dependencies?: DependencyList;
  } = {}
) {
  const { ttl = CLIENT_CACHE_CONFIG.DEFAULT_TTL, skipCache = false, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    if (skipCache) {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetcher();
        setData(result);
        clientCache.set(cacheKey, result, ttl);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Vérifier le cache d'abord
    const cached = clientCache.get<T>(cacheKey);
    if (cached) {
      setData(cached);
      return;
    }
    
    // Si pas en cache, faire l'appel
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      clientCache.set(cacheKey, result, ttl);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dependencies are intentionally spread for dynamic refetch triggers
  }, [cacheKey, fetcher, ttl, skipCache, ...dependencies]);
  
  // Effet pour charger les données
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const refetch = useCallback(() => {
    clientCache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);
  
  const invalidate = useCallback(() => {
    clientCache.delete(cacheKey);
  }, [cacheKey]);
  
  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    fetchData,
  };
}

/**
 * Hook pour mettre en cache des données de pages statiques
 * Optimisé pour les pages FAQ, Licenses, Privacy
 */
export function useStaticPageCache<T>(
  pageType: 'faq' | 'licenses' | 'privacy',
  fetcher: () => Promise<T>,
  options: {
    skipCache?: boolean;
    dependencies?: DependencyList;
  } = {}
) {
  return useCache(
    `static:${pageType}`,
    fetcher,
    {
      ttl: 24 * 60 * 60 * 1000, // 24 heures pour les pages statiques
      ...options
    }
  );
}

/**
 * Hook pour le cache des données FAQ
 */
export function useFAQCache<T>(
  fetcher: () => Promise<T>,
  options: {
    filter?: string;
    category?: string;
    skipCache?: boolean;
  } = {}
) {
  const { filter, category, skipCache } = options;
  const cacheKey = `faq:${category || 'all'}:${filter || 'none'}`;
  
  return useCache(
    cacheKey,
    fetcher,
    {
      ttl: 12 * 60 * 60 * 1000, // 12 heures
      skipCache,
      dependencies: [filter, category]
    }
  );
}

/**
 * Hook pour le cache des données de licences
 */
export function useLicenseCache<T>(
  fetcher: () => Promise<T>,
  options: {
    licenseType?: string;
    skipCache?: boolean;
  } = {}
) {
  const { licenseType, skipCache } = options;
  const cacheKey = `licenses:${licenseType || 'all'}`;
  
  return useCache(
    cacheKey,
    fetcher,
    {
      ttl: 24 * 60 * 60 * 1000, // 24 heures
      skipCache,
      dependencies: [licenseType]
    }
  );
}

/**
 * Hook pour obtenir les statistiques du cache côté client
 */
export function useCacheStats() {
  const [stats, setStats] = useState(() => clientCache.getStats());
  
  useEffect(() => {
    // Mettre à jour les stats régulièrement
    const interval = setInterval(() => {
      setStats(clientCache.getStats());
    }, 10000); // Toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);
  
  const clearCache = useCallback(() => {
    clientCache.clear();
    setStats(clientCache.getStats());
  }, []);
  
  return {
    stats,
    clearCache,
    cacheSize: stats.size,
    cacheKeys: stats.keys,
  };
}

/**
 * Hook pour l'invalidation intelligente du cache
 */
export function useCacheInvalidation() {
  const invalidateStaticPages = useCallback(() => {
    const patterns = ['static:', 'faq:', 'licenses:', 'privacy:'];
    patterns.forEach(pattern => {
      const keys = Array.from(clientCache['cache'].keys()).filter(key => 
        key.startsWith(pattern)
      );
      keys.forEach(key => clientCache.delete(key));
    });
  }, []);
  
  const invalidateFAQ = useCallback(() => {
    const keys = Array.from(clientCache['cache'].keys()).filter(key => 
      key.startsWith('faq:')
    );
    keys.forEach(key => clientCache.delete(key));
  }, []);
  
  const invalidateLicenses = useCallback(() => {
    const keys = Array.from(clientCache['cache'].keys()).filter(key => 
      key.startsWith('licenses:')
    );
    keys.forEach(key => clientCache.delete(key));
  }, []);
  
  const invalidatePrivacy = useCallback(() => {
    const keys = Array.from(clientCache['cache'].keys()).filter(key => 
      key.startsWith('privacy:') || key.startsWith('static:privacy')
    );
    keys.forEach(key => clientCache.delete(key));
  }, []);
  
  return {
    invalidateStaticPages,
    invalidateFAQ,
    invalidateLicenses,
    invalidatePrivacy,
    clearAll: clientCache.clear.bind(clientCache),
  };
}
