import { NextRequest, NextResponse } from 'next/server';
import { withUpstashCache } from '@/lib/cache-upstash';
import { WOODPECKER_CACHE_CONFIG } from '@/lib/cache-upstash';

// Configuration du cache pour les politiques de confidentialité
const PRIVACY_CACHE_CONFIG = {
  ttl: WOODPECKER_CACHE_CONFIG.PRIVACY_DATA, // 24 hours by default
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'fr';

  // Generate cache key
  const cacheKey = `woodpecker:privacy:language:${language}:version:1.0`;

  return withUpstashCache(
    cacheKey,
    async () => {
      console.log(`[PRIVACY_API] Fetching privacy data from database for language: ${language}`);

      try {
        // For now, return static content since we haven't seeded PrivacySection yet
        const staticContent = {
          sections: [
            {
              id: 'introduction',
              title: 'Introduction',
              icon: 'Info',
              content: `Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web et nos services de musique hip-hop/rap.

En utilisant notre site, vous acceptez les pratiques décrites dans cette politique de confidentialité.`,
            },
            {
              id: 'data-collection',
              title: 'Collecte de données',
              icon: 'Database',
              content: `Nous collectons les informations suivantes :
- Informations de compte (nom, email, mot de passe)
- Informations de paiement (via Stripe - nous ne stockons pas vos données bancaires)
- Historique d'achats et préférences musicales
- Données d'usage du site web (pages visitées, temps passé)
- Communications avec notre support`,
            },
            {
              id: 'data-usage',
              title: 'Utilisation des données',
              icon: 'Target',
              content: `Nous utilisons vos données pour :
- Fournir et améliorer nos services
- Traiter vos commandes et livrer vos achats
- Communiquer avec vous au sujet de vos achats
- Personnaliser votre expérience musicale
- Analyser l'utilisation de notre site
- Prévenir la fraude et assurer la sécurité`,
            },
            {
              id: 'data-protection',
              title: 'Protection des données',
              icon: 'Shield',
              content: `Nous protégeons vos données par :
- Chiffrement SSL/TLS pour toutes les communications
- Serveurs sécurisés avec accès restreint
- Sauvegarde régulière des données importantes
- Conformité aux standards PCI DSS pour les paiements
- Sensibilisation de notre équipe à la sécurité`,
            },
            {
              id: 'cookies',
              title: 'Cookies et technologies',
              icon: 'Cookie',
              content: `Nous utilisons des cookies pour :
- Mémoriser vos préférences de connexion
- Analyser l'usage du site (Google Analytics)
- Personnaliser le contenu et la publicité
- Améliorer les performances du site

Vous pouvez contrôler les cookies via les paramètres de votre navigateur.`,
            },
            {
              id: 'third-party',
              title: 'Services tiers',
              icon: 'Users',
              content: `Nous utilisons des services tiers fiables :
- Stripe pour les paiements sécurisés
- Upstash pour la mise en cache Redis
- Cloudinary pour le stockage des fichiers audio
- Vercel pour l'hébergement du site

Ces services ont leurs propres politiques de confidentialité.`,
            },
            {
              id: 'user-rights',
              title: 'Vos droits',
              icon: 'Gavel',
              content: `Vos droits selon le RGPD :
- Accès à vos données personnelles
- Rectification des données incorrectes
- Effacement de vos données ("droit à l'oubli")
- Limitation du traitement
- Portabilité des données
- Contester le traitement automatique
- Retirer votre consentement à tout moment`,
            },
            {
              id: 'individuell-privacy',
              title: 'Confidentialité des mineurs',
              icon: 'UserX',
              content: `Notre service est destiné aux personnes âgées de 13 ans et plus. Nous ne collectons pas sciemment d'informations auprès d'enfants de moins de 13 ans sans le consentement parental vérifiable.

Si nous apprenons qu'un enfant de moins de 13 ans nous a fourni des informations personnelles sans consentement parental, nous supprimons ces informations de nos serveurs.`,
            },
            {
              id: 'policy-updates',
              title: 'Modifications de la politique',
              icon: 'Edit',
              content: `Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Nous vous informerons de tout changement important par :
- Notification sur notre site web
- Email aux utilisateurs concernés
- Avis dans votre espace utilisateur

Veuillez consulter régulièrement cette page pour rester informé.`,
            },
            {
              id: 'contact',
              title: 'Contact',
              content: `Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous :

📧 Email : privacy@woodpecker-beats.com
📞 Téléphone : Disponible via notre support
🏢 Adresse : Disponible en cliquant sur "Support" dans notre système

Nous nous engageons à répondre dans les 48h.`,
            },
          ],
          cached: false,
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(staticContent);
      } catch (error) {
        console.error('[PRIVACY_API_ERROR]', error);
        return NextResponse.json(
          { error: 'Failed to fetch privacy data' },
          { status: 500 }
        );
      }
    },
    { ttl: PRIVACY_CACHE_CONFIG.ttl }
  );
}

// Keep the original function for backward compatibility
export async function getPrivacyData(_language: string = 'fr') {
  try {
    return {
      sections: "Static content for now",
      cached: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[getPrivacyData_ERROR]', error);
    return {
      sections: [],
      cached: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch privacy data from database',
    };
  }
}