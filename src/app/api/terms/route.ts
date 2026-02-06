import { NextRequest, NextResponse } from 'next/server';
import { withUpstashCache } from '@/lib/cache-upstash';
import { WOODPECKER_CACHE_CONFIG } from '@/lib/cache-upstash';

// Configuration du cache pour les conditions d'utilisation
const TERMS_CACHE_CONFIG = {
  ttl: WOODPECKER_CACHE_CONFIG.PRIVACY_DATA, // 24 hours by default (same as privacy)
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'fr';

  // Generate cache key
  const cacheKey = `woodpecker:terms:language:${language}:version:1.0`;

  return withUpstashCache(
    cacheKey,
    async () => {
      console.log(`[TERMS_API] Fetching terms data from database for language: ${language}`);

      try {
        // For now, return static content since we haven't seeded TermsSection yet
        const staticContent = {
          sections: [
            {
              id: 'acceptance',
              title: 'Acceptation des conditions',
              icon: 'CheckCircle',
              content: `En accédant et en utilisant notre site web, vous acceptez d'être lié par les présentes Conditions d'Utilisation et toutes les lois et réglementations applicables.

Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre site.`,
            },
            {
              id: 'service-description',
              title: 'Description du service',
              icon: 'Music',
              content: `Woodpecker est une plateforme de vente de beats hip-hop/rap qui propose :
- Des beats instrumentaux de haute qualité
- Différents types de licences (WAV, Trackout, Unlimited)
- Services de téléchargement sécurisés
- Support technique et commercial

Nous nous réservons le droit de modifier nos services à tout moment.`,
            },
            {
              id: 'user-account',
              title: 'Compte utilisateur',
              icon: 'User',
              content: `Pour effectuer des achats, vous devez créer un compte en fournissant :
- Une adresse email valide
- Un mot de passe sécurisé
- Informations de contact si nécessaire

Vous êtes responsable de la confidentialité de votre compte et de toutes les activités y afférentes.

Nous nous réservons le droit de suspendre ou de supprimer des comptes qui violent nos conditions.`,
            },
            {
              id: 'license-types',
              title: 'Types de licences',
              icon: 'FileText',
              content: `Nous proposons différents types de licences :

**LICENCE WAV (19.99€)**
- Usage commercial autorisé (limité)
- Distribution jusqu'à 5,000 copies
- Streaming monétisé jusqu'à 100,000 écoutes
- 1 clip vidéo autorisé

**LICENCE TRACKOUT (39.99€)**
- Tout ce qui est inclus dans la licence WAV
- Plus : Stems/trackouts inclus
- Distribution jusqu'à 10,000 copies
- Streaming monétisé jusqu'à 250,000 écoutes
- 3 clips vidéo autorisés

**LICENCE UNLIMITED (79.99€)**
- Distribution et streaming illimités
- Stems et fichiers complets inclus
- Performance live payante autorisée
- Diffusion radio/TV autorisée
- Synchronisation autorisée`,
            },
            {
              id: 'usage-restrictions',
              title: 'Restrictions d\'usage',
              icon: 'AlertTriangle',
              content: `Il est interdit de :
- Utiliser les beats pour des contenus illégaux, haineux ou offensants
- Revendre ou redistribuer les beats dans leur forme originale
- Créer des systèmes de détection de contenu (Content ID) avec les beats seuls
- Utiliser les beats sans créditer "Prod. l.outsider"
- Dépasser les limites de distribution selon votre licence
- Partager vos fichiers achetés avec des tiers non autorisés`,
            },
            {
              id: 'payments',
              title: 'Paiements et facturation',
              icon: 'CreditCard',
              content: `Nous utilisons Stripe comme processeur de paiement sécurisé.

**Conditions de paiement :**
- Paiement en Euros (EUR)
- Cartes acceptées : Visa, MasterCard, American Express
- Paiement sécurisé SSL et PCI DSS
- Pas de remboursement après téléchargement (sauf erreur technique)

**Fraudes et abus :**
- Nous nous réservons le droit de suspendre les comptes frauduleux
- Toute tentative de fraude sera signalée aux autorités
- Les ventes sont finales une fois les fichiers téléchargés`,
            },
            {
              id: 'intellectual-property',
              title: 'Propriété intellectuelle',
              icon: 'Copyright',
              content: `**Nos droits :**
- Nous conservons tous les droits d'auteur sur nos beats
- Nos beats sont protégés par le copyright
- Licences NON-exclusives (le même beat peut être vendu plusieurs fois)

**Vos droits :**
- Vous obtenez les droits d'utilisation selon votre contrat de licence
- Vous pouvez enregistrer et distribuer vos chansons créées avec nos beats
- Vous devez créditer "Prod. l.outsider" dans vos créations

**Partage des revenus :**
En cas de revenus générés par vos créations : 50% Producteur / 50% Artiste`,
            },
            {
              id: 'file-delivery',
              title: 'Livraison des fichiers',
              icon: 'Download',
              content: `**Téléchargement :**
- Accès immédiat après paiement confirmé
- Serveur sécurisé avec liens temporaires
- Support des formats : WAV, MP3, Stems (selon licence)
- Qualité haute résolution (24-bit/44.1kHz pour WAV)

**Stockage et accès :**
- Vous êtes responsable de sauvegarder vos fichiers téléchargés
- Nous ne garantissons pas la disponibilité à long terme
- En cas de perte de fichiers, nous pouvons proposer une solution de remplacement

**Support technique :**
Si vous rencontrez des problèmes de téléchargement, contactez notre support.`,
            },
            {
              id: 'limitation-liability',
              title: 'Limitations de responsabilité',
              icon: 'Shield',
              content: `Dans la mesure maximale permise par la loi :

- Notre responsabilité est limitée au montant que vous avez payé
- Nous ne sommes pas responsables des dommages indirects ou consécutifs
- Nous ne garantissons pas l'annuité ou l'interruptions de service
- Nous ne sommes pas responsables des problèmes liés aux services tiers

**Force majeure :**
Nous ne serons pas responsables des retards ou des manquements dus à des circonstances indépendantes de notre volonté.`,
            },
            {
              id: 'policy-modifications',
              title: 'Modifications des conditions',
              icon: 'Edit',
              content: `Nous nous réservons le droit de modifier ces conditions à tout moment.

**Notification des changements :**
- Par email aux utilisateurs actifs
- Notification sur notre site web
- Une nouvelle version sera publiée avec une date d'entrée en vigueur

**Acceptation automatique :**
En continuant à utiliser notre service après les modifications, vous acceptez les nouvelles conditions.

Pour les modifications importantes, nous offrons un délai de grâce pour l'acceptation.`,
            },
            {
              id: 'contact-support',
              title: 'Contact et support',
              icon: 'MessageCircle',
              content: `Pour toute question concernant ces conditions ou nos services :

**Support commercial :**
📧 Email : support@woodpecker-beats.com
📞 Disponible via notre système de messagerie sur le site

**Support technique :**
🛠️ Fichier de signalement des bugs directement sur créér
📝 Chat en direct disponible pendant les heures ouvrables

**Disputes et réclamations :**
Nous privilégions la résolution amiable. En cas de litige persistant, le droit français s'applique et les tribunaux français sont compétents.`,
            },
          ],
          cached: false,
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json(staticContent);
      } catch (error) {
        console.error('[TERMS_API_ERROR]', error);
        return NextResponse.json(
          { error: 'Failed to fetch terms data' },
          { status: 500 }
        );
      }
    },
    { ttl: TERMS_CACHE_CONFIG.ttl }
  );
}

// Keep the original function for backward compatibility
export async function getTermsData(_language: string = 'fr') {
  try {
    return {
      sections: "Static content for now",
      cached: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[getTermsData_ERROR]', error);
    return {
      sections: [],
      cached: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch terms data from database',
    };
  }
}
