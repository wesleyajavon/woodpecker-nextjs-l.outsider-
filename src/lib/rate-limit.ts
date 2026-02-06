import { NextRequest, NextResponse } from 'next/server';
import { redis } from './redis';

// Configuration du rate limiting
export const RATE_LIMIT_CONFIG = {
  // Limites générales par IP
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    keyPrefix: 'rate_limit:general'
  },
  
  // Limites pour les API critiques (auth, upload, payment)
  CRITICAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requêtes par fenêtre
    keyPrefix: 'rate_limit:critical'
  },
  
  // Limites pour les API de lecture (beats, faq, etc.)
  READ: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requêtes par fenêtre
    keyPrefix: 'rate_limit:read'
  },
  
  // Limites pour les uploads de fichiers
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 uploads par heure
    keyPrefix: 'rate_limit:upload'
  },
  
  // Limites pour les téléchargements
  DOWNLOAD: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // 50 téléchargements par heure
    keyPrefix: 'rate_limit:download'
  },
  
  // Limites pour les API admin
  ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requêtes par fenêtre (plus élevé pour les admins)
    keyPrefix: 'rate_limit:admin'
  }
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

// Interface pour les informations de rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Classe pour gérer le rate limiting avec Redis
export class RateLimitManager {
  /**
   * Vérifier et appliquer le rate limiting
   */
  static async checkRateLimit(
    identifier: string,
    type: RateLimitType,
    customConfig?: Partial<typeof RATE_LIMIT_CONFIG.GENERAL>
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const config = { ...RATE_LIMIT_CONFIG[type], ...customConfig };
    const key = `${config.keyPrefix}:${identifier}`;
    const windowStart = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${windowStart}`;
    
    try {
      // Récupérer le nombre actuel de requêtes
      const current = await redis.get(windowKey) as number || 0;
      
      // Vérifier si la limite est dépassée
      if (current >= config.max) {
        const resetTime = (windowStart + 1) * config.windowMs;
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        return {
          allowed: false,
          info: {
            limit: config.max,
            remaining: 0,
            resetTime,
            retryAfter
          }
        };
      }
      
      // Incrémenter le compteur
      const newCount = await redis.incr(windowKey);
      
      // Définir l'expiration seulement pour la première requête
      if (newCount === 1) {
        await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
      }
      
      const resetTime = (windowStart + 1) * config.windowMs;
      
      return {
        allowed: true,
        info: {
          limit: config.max,
          remaining: Math.max(0, config.max - newCount),
          resetTime
        }
      };
      
    } catch (error) {
      console.error('[RATE_LIMIT_ERROR]', error);
      // En cas d'erreur Redis, permettre la requête (fail-open)
      return {
        allowed: true,
        info: {
          limit: config.max,
          remaining: config.max - 1,
          resetTime: Date.now() + config.windowMs
        }
      };
    }
  }
  
  /**
   * Obtenir l'identifiant unique pour le rate limiting
   */
  static getIdentifier(request: NextRequest): string {
    // Priorité : IP > User ID > Session ID
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return ip.trim();
  }
  
  /**
   * Obtenir l'identifiant utilisateur si authentifié
   */
  static async getUserIdentifier(_request: NextRequest): Promise<string | null> {
    try {
      // Essayer de récupérer l'ID utilisateur depuis la session
      const { getServerSession } = await import('next-auth/next');
      const { authOptions } = await import('@/lib/auth');
      const { getUserIdFromEmail } = await import('@/lib/userUtils');
      
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const userId = await getUserIdFromEmail(session.user.email);
        return userId || null;
      }
      
      return null;
    } catch (error) {
      console.error('[RATE_LIMIT_USER_ID_ERROR]', error);
      return null;
    }
  }
  
  /**
   * Déterminer le type de rate limiting basé sur la route
   */
  static getRateLimitType(pathname: string, method: string): RateLimitType {
    // Routes critiques (auth, payment, upload)
    if (pathname.includes('/auth/') || 
        pathname.includes('/stripe/') || 
        pathname.includes('/upload') ||
        pathname.includes('/payment')) {
      return 'CRITICAL';
    }
    
    // Routes d'upload de fichiers
    if (pathname.includes('/upload') && method === 'POST') {
      return 'UPLOAD';
    }
    
    // Routes de téléchargement
    if (pathname.includes('/download')) {
      return 'DOWNLOAD';
    }
    
    // Routes admin
    if (pathname.includes('/admin/')) {
      return 'ADMIN';
    }
    
    // Routes de lecture (beats, faq, licenses, etc.)
    if (method === 'GET' && (
      pathname.includes('/beats') ||
      pathname.includes('/faq') ||
      pathname.includes('/licenses') ||
      pathname.includes('/privacy') ||
      pathname.includes('/terms')
    )) {
      return 'READ';
    }
    
    // Par défaut : limite générale
    return 'GENERAL';
  }
  
  /**
   * Créer une réponse avec les headers de rate limiting
   */
  static createRateLimitResponse(info: RateLimitInfo, message?: string): NextResponse {
    const headers = new Headers({
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': new Date(info.resetTime).toISOString(),
    });
    
    if (info.retryAfter) {
      headers.set('Retry-After', info.retryAfter.toString());
    }
    
    return NextResponse.json(
      {
        success: false,
        error: message || 'Trop de requêtes. Veuillez réessayer plus tard.',
        rateLimit: {
          limit: info.limit,
          remaining: info.remaining,
          resetTime: new Date(info.resetTime).toISOString(),
          retryAfter: info.retryAfter
        }
      },
      { 
        status: 429,
        headers 
      }
    );
  }

  /**
   * Ajouter les headers de rate limiting à une réponse existante
   */
  static addRateLimitHeaders(response: NextResponse, info: RateLimitInfo): NextResponse {
    response.headers.set('X-RateLimit-Limit', info.limit.toString());
    response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(info.resetTime).toISOString());
    return response;
  }
}

/**
 * Middleware de rate limiting pour les API routes
 */
export async function withRateLimit(
  request: NextRequest,
  type?: RateLimitType,
  customConfig?: Partial<typeof RATE_LIMIT_CONFIG.GENERAL>
) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  
  // Déterminer le type de rate limiting
  const rateLimitType = type || RateLimitManager.getRateLimitType(pathname, method);
  
  // Obtenir l'identifiant
  const identifier = RateLimitManager.getIdentifier(request);
  
  // Vérifier le rate limiting
  const { allowed, info } = await RateLimitManager.checkRateLimit(
    identifier,
    rateLimitType,
    customConfig
  );
  
  if (!allowed) {
    return RateLimitManager.createRateLimitResponse(
      info,
      `Limite de ${info.limit} requêtes par ${Math.ceil(RATE_LIMIT_CONFIG[rateLimitType].windowMs / 60000)} minutes atteinte`
    );
  }
  
  return { allowed: true, info };
}

/**
 * Middleware de rate limiting avec authentification utilisateur
 */
export async function withUserRateLimit(
  request: NextRequest,
  type?: RateLimitType,
  customConfig?: Partial<typeof RATE_LIMIT_CONFIG.GENERAL>
) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  
  // Déterminer le type de rate limiting
  const rateLimitType = type || RateLimitManager.getRateLimitType(pathname, method);
  
  // Essayer d'obtenir l'ID utilisateur d'abord, sinon utiliser l'IP
  const userIdentifier = await RateLimitManager.getUserIdentifier(request);
  const identifier = userIdentifier || RateLimitManager.getIdentifier(request);
  
  // Vérifier le rate limiting
  const { allowed, info } = await RateLimitManager.checkRateLimit(
    identifier,
    rateLimitType,
    customConfig
  );
  
  if (!allowed) {
    return RateLimitManager.createRateLimitResponse(
      info,
      `Limite de ${info.limit} requêtes par ${Math.ceil(RATE_LIMIT_CONFIG[rateLimitType].windowMs / 60000)} minutes atteinte`
    );
  }
  
  return { allowed: true, info };
}

/**
 * Fonction utilitaire pour obtenir les statistiques de rate limiting
 */
export async function getRateLimitStats(identifier: string): Promise<Record<string, RateLimitInfo>> {
  const stats: Record<string, RateLimitInfo> = {};
  
  for (const [type, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    const key = `${config.keyPrefix}:${identifier}`;
    const windowStart = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${windowStart}`;
    
    try {
      const current = await redis.get(windowKey) as number || 0;
      const resetTime = (windowStart + 1) * config.windowMs;
      
      stats[type] = {
        limit: config.max,
        remaining: Math.max(0, config.max - current),
        resetTime
      };
    } catch (error) {
      console.error(`[RATE_LIMIT_STATS_ERROR] ${type}:`, error);
    }
  }
  
  return stats;
}
