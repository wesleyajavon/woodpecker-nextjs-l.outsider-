'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Music,
  Archive,
  Check,
  X,
  Users,
  Globe,
  Video,
  Radio,
  Building,
  Headphones,
  AlertCircle,
  Info,
  ExternalLink,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface LicenseFeature {
  id: string;
  name: string;
  wav: boolean | string;
  trackout: boolean | string;
  unlimited: boolean | string;
}

interface LicenseDetails {
  wav: {
    title: string;
    description: string;
    features: string[];
    limitations: string[];
    useCases: string[];
  };
  trackout: {
    title: string;
    description: string;
    features: string[];
    limitations: string[];
    useCases: string[];
  };
  unlimited: {
    title: string;
    description: string;
    features: string[];
    limitations: string[];
    useCases: string[];
  };
}

const licenseFeatures: LicenseFeature[] = [
  {
    id: 'files',
    name: 'Fichiers inclus',
    wav: 'WAV & MP3',
    trackout: 'WAV, STEMS & MP3',
    unlimited: 'WAV, STEMS & MP3',
  },
  {
    id: 'commercial',
    name: 'Usage commercial',
    wav: true,
    trackout: true,
    unlimited: true,
  },
  {
    id: 'copies',
    name: 'Copies distribuées',
    wav: '5 000',
    trackout: '10 000',
    unlimited: 'Illimité',
  },
  {
    id: 'streams',
    name: 'Streams audio en ligne',
    wav: '100 000',
    trackout: '250 000',
    unlimited: 'Illimité',
  },
  {
    id: 'videos',
    name: 'Clips vidéo',
    wav: '1',
    trackout: '3',
    unlimited: 'Illimité',
  },
  {
    id: 'live-nonprofit',
    name: 'Performances live (non-profit)',
    wav: 'Illimité',
    trackout: 'Illimité',
    unlimited: 'Illimité',
  },
  {
    id: 'live-profit',
    name: 'Performances live (profit)',
    wav: false,
    trackout: false,
    unlimited: true,
  },
  {
    id: 'radio-tv',
    name: 'Diffusion radio/TV',
    wav: false,
    trackout: false,
    unlimited: true,
  },
  {
    id: 'sync',
    name: 'Synchronisation (films/pubs)',
    wav: false,
    trackout: false,
    unlimited: true,
  },
  {
    id: 'credit',
    name: 'Crédit producteur requis',
    wav: true,
    trackout: true,
    unlimited: true,
  },
];

const licenseDetails: LicenseDetails = {
  wav: {
    title: 'WAV Lease - Licence Non-Exclusive',
    description:
      "Licence non-exclusive de 10 ans permettant l'usage commercial du beat avec des droits essentiels pour artistes et producteurs.",
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      "Droit d'enregistrer des voix sur le beat pour créer une nouvelle chanson",
      'Modification autorisée (arrangement, tempo, tonalité, durée)',
      "Distribution jusqu'à 5 000 copies physiques et digitales",
      "Jusqu'à 100 000 streams audio monétisés",
      '1 clip vidéo monétisé (max 5 minutes)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Pas de fichiers stems/trackouts inclus',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat dans sa forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
      'Interdiction d\'enregistrer le beat seul avec Content ID',
    ],
    useCases: [
      'Singles et projets musicaux indépendants',
      'Mixtapes et compilations gratuites',
      'Streaming sur Spotify, Apple Music, Deezer',
      'Concerts et festivals non-commerciaux',
      'Promotion sur réseaux sociaux',
      'Vente digitale et physique limitée',
    ],
  },
  trackout: {
    title: 'Trackout Lease - Licence Premium avec Stems',
    description:
      'Licence non-exclusive de 10 ans incluant les stems pour un contrôle créatif total et des droits commerciaux étendus.',
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      "Droit d'enregistrer et modifier librement le beat",
      'Remixage et arrangements personnalisés autorisés',
      "Distribution jusqu'à 10 000 copies physiques et digitales",
      "Jusqu'à 250 000 streams audio monétisés",
      '3 clips vidéo monétisés (max 5 minutes chacun)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
    ],
    useCases: [
      'Albums et EPs professionnels',
      'Remixage et production avancée',
      'Collaborations artistiques',
      'Clips vidéo multiples et promotion',
      'Distribution élargie sur plateformes',
      'Projets créatifs nécessitant les stems',
    ],
  },
  unlimited: {
    title: 'Unlimited Lease - Licence Commerciale Complète',
    description:
      'Licence non-exclusive de 10 ans offrant tous les droits commerciaux pour une utilisation professionnelle sans limitations de distribution.',
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      "Droit d'enregistrer et modifier librement le beat",
      'Distribution ILLIMITÉE de copies physiques et digitales',
      'Streams audio monétisés ILLIMITÉS',
      'Clips vidéo monétisés ILLIMITÉS',
      'Performances live payantes AUTORISÉES',
      'Diffusion radio et télévision commerciale',
      'Synchronisation (films, publicités, documentaires, jeux vidéo)',
      'Vente en format single, EP ou album sans restriction',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
    ],
    useCases: [
      'Projets commerciaux majeurs et albums',
      'Tournées et concerts payants',
      'Campagnes publicitaires et marketing',
      'Films, documentaires et contenus audiovisuels',
      'Diffusion radio/TV et podcasts',
      'Distribution mondiale sans restriction',
      'Synchronisation pour médias et jeux vidéo',
      'Projets nécessitant une flexibilité commerciale totale',
    ],
  },
};

const usageExamples = [
  {
    icon: Headphones,
    title: 'Streaming Platforms',
    description: 'Spotify, Apple Music, Deezer, YouTube Music',
    licenses: ['WAV', 'Trackout', 'Unlimited'],
  },
  {
    icon: Video,
    title: 'Clips Vidéo',
    description: 'YouTube, Instagram, TikTok, clips promotionnels',
    licenses: ['WAV (1)', 'Trackout (3)', 'Unlimited'],
  },
  {
    icon: Users,
    title: 'Performances Live',
    description: 'Concerts, festivals, événements (non-profit)',
    licenses: ['WAV', 'Trackout', 'Unlimited'],
  },
  {
    icon: Radio,
    title: 'Radio & TV',
    description: 'Diffusion radio, télévision, podcasts',
    licenses: ['Unlimited uniquement'],
  },
  {
    icon: Building,
    title: 'Usage Commercial',
    description: 'Publicités, films, documentaires',
    licenses: ['Unlimited uniquement'],
  },
  {
    icon: Globe,
    title: 'Distribution Mondiale',
    description: 'Vente et distribution dans le monde entier',
    licenses: ['WAV', 'Trackout', 'Unlimited'],
  },
];

const importantNotes = [
  "Le crédit producteur 'Prod. l.outsider' est obligatoire sur tous les titres",
  'Les licences ne sont pas exclusives - le beat peut être vendu à d\'autres artistes',
  'Aucun remboursement après téléchargement des fichiers',
  "Les droits d'auteur restent la propriété de l.outsider",
  'Usage à des fins illégales strictement interdit',
  'Revente ou redistribution des fichiers interdite',
];

const licenseSections = [
  {
    id: 'comparison',
    title: 'Comparaison des Licences',
    icon: <Check className="h-5 w-5" />,
    color: 'indigo',
    content:
      'Tableau comparatif détaillé des trois types de licences disponibles : WAV Lease, Trackout Lease et Unlimited Lease. Comparez les fonctionnalités, limitations et cas d\'usage pour chaque licence.',
  },
  {
    id: 'wav-lease',
    title: 'WAV Lease - Licence Basique',
    icon: <Music className="h-5 w-5" />,
    color: 'blue',
    content:
      "Licence non-exclusive de 10 ans permettant l'usage commercial du beat avec des droits essentiels pour artistes et producteurs. Inclut fichiers WAV haute qualité et MP3 320kbps.",
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      "Droit d'enregistrer des voix sur le beat pour créer une nouvelle chanson",
      'Modification autorisée (arrangement, tempo, tonalité, durée)',
      "Distribution jusqu'à 5 000 copies physiques et digitales",
      "Jusqu'à 100 000 streams audio monétisés",
      '1 clip vidéo monétisé (max 5 minutes)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Pas de fichiers stems/trackouts inclus',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat dans sa forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
      'Interdiction d\'enregistrer le beat seul avec Content ID',
    ],
    useCases: [
      'Singles et projets musicaux indépendants',
      'Mixtapes et compilations gratuites',
      'Streaming sur Spotify, Apple Music, Deezer',
      'Concerts et festivals non-commerciaux',
      'Promotion sur réseaux sociaux',
      'Vente digitale et physique limitée',
    ],
  },
  {
    id: 'trackout-lease',
    title: 'Trackout Lease - Licence Premium',
    icon: <Archive className="h-5 w-5" />,
    color: 'purple',
    content:
      'Licence non-exclusive de 10 ans incluant les stems pour un contrôle créatif total et des droits commerciaux étendus. Parfait pour les producteurs et artistes nécessitant une flexibilité créative.',
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      "Droit d'enregistrer et modifier librement le beat",
      'Remixage et arrangements personnalisés autorisés',
      "Distribution jusqu'à 10 000 copies physiques et digitales",
      "Jusqu'à 250 000 streams audio monétisés",
      '3 clips vidéo monétisés (max 5 minutes chacun)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
    ],
    useCases: [
      'Albums et EPs professionnels',
      'Remixage et production avancée',
      'Collaborations artistiques',
      'Clips vidéo multiples et promotion',
      'Distribution élargie sur plateformes',
      'Projets créatifs nécessitant les stems',
    ],
  },
  {
    id: 'unlimited-lease',
    title: 'Unlimited Lease - Licence Complète',
    icon: <Crown className="h-5 w-5" />,
    color: 'orange',
    content:
      'Licence non-exclusive de 10 ans offrant tous les droits commerciaux pour une utilisation professionnelle sans limitations de distribution. La solution complète pour tous les projets commerciaux.',
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      "Droit d'enregistrer et modifier librement le beat",
      'Distribution ILLIMITÉE de copies physiques et digitales',
      'Streams audio monétisés ILLIMITÉS',
      'Clips vidéo monétisés ILLIMITÉS',
      'Performances live payantes AUTORISÉES',
      'Diffusion radio et télévision commerciale',
      'Synchronisation (films, publicités, documentaires, jeux vidéo)',
      'Vente en format single, EP ou album sans restriction',
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      'Pas de redevances supplémentaires à payer',
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
    ],
    useCases: [
      'Projets commerciaux majeurs et albums',
      'Tournées et concerts payants',
      'Campagnes publicitaires et marketing',
      'Films, documentaires et contenus audiovisuels',
      'Diffusion radio/TV et podcasts',
      'Distribution mondiale sans restriction',
      'Synchronisation pour médias et jeux vidéo',
      'Projets nécessitant une flexibilité commerciale totale',
    ],
  },
  {
    id: 'usage-examples',
    title: "Exemples d'Utilisation",
    icon: <ExternalLink className="h-5 w-5" />,
    color: 'green',
    content:
      "Découvrez les différents cas d'usage pour chaque type de licence. De Spotify aux clips vidéo, en passant par les performances live et la diffusion radio/TV.",
  },
  {
    id: 'important-notes',
    title: 'Points Importants',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'yellow',
    content:
      "Informations essentielles à connaître avant d'acheter une licence. Règles importantes, limitations et obligations légales.",
  },
];

type LicenseSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: string;
  features?: string[];
  limitations?: string[];
  useCases?: string[];
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function getColorClasses(_color: string) {
  return 'border-white/10 bg-white/[0.03] text-muted-foreground';
}

function CollapseToggle({
  expanded,
  onClick,
}: {
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-white/14 hover:bg-white/[0.04] hover:text-foreground"
    >
      <ChevronRight
        className={cn('h-4 w-4 transition-transform duration-300', expanded && 'rotate-90')}
      />
    </button>
  );
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
        getColorClasses(''),
      )}
    >
      {children}
    </div>
  );
}

export default function LicensesPage() {
  const { t } = useTranslation();
  const [selectedLicense, setSelectedLicense] = useState<'wav' | 'trackout' | 'unlimited' | null>(
    null,
  );
  const [activeSection, setActiveSection] = useState('');
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LicenseSection | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showUsageExamples, setShowUsageExamples] = useState(false);
  const [showImportantPoints, setShowImportantPoints] = useState(false);

  const openModal = (licenseType: 'wav' | 'trackout' | 'unlimited') => {
    setSelectedLicense(licenseType);
  };

  const closeModal = () => {
    setSelectedLicense(null);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const section = licenseSections.find((s) => s.id === sectionId);
    if (section) {
      setSelectedContent(section);
    }
  };

  const pageTitle = `${t('licenses.pageTitle')} ${t('licenses.pageTitleHighlight')}`;

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="mx-auto h-4 w-4 text-green-400/80 sm:h-5 sm:w-5" />
      ) : (
        <X className="mx-auto h-4 w-4 text-red-400/80 sm:h-5 sm:w-5" />
      );
    }
    return <span className="text-xs font-medium text-foreground sm:text-sm">{value}</span>;
  };

  const modalIcon =
    selectedLicense === 'wav' ? (
      <Music className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6" />
    ) : selectedLicense === 'trackout' ? (
      <Archive className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6" />
    ) : (
      <Crown className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6" />
    );

  return (
    <PublicPageShell maxWidth="max-w-6xl">
      <PublicPageHeader
        label={t('nav.licenses')}
        title={pageTitle}
        subtitle={t('licenses.pageSubtitle')}
      />

      {/* Table of Contents */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="mb-12">
        <div className={cn(catalogPanelClass, 'p-5 sm:p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              {t('licenses.tableOfContents')}
            </h2>
            <CollapseToggle
              expanded={showTableOfContents}
              onClick={() => setShowTableOfContents(!showTableOfContents)}
            />
          </div>

          <AnimatePresence>
            {showTableOfContents && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {licenseSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'w-full rounded-lg border p-4 text-left transition-colors duration-300',
                        activeSection === section.id
                          ? 'border-white/20 bg-white text-black'
                          : 'border-white/10 text-muted-foreground hover:border-white/14 hover:bg-white/[0.04] hover:text-foreground',
                      )}
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div
                          className={cn(
                            'rounded-lg border p-2',
                            activeSection === section.id
                              ? 'border-black/10 bg-black/5 text-black'
                              : getColorClasses(section.color),
                          )}
                        >
                          {section.icon}
                        </div>
                        <h3 className="text-sm font-medium">{section.title}</h3>
                      </div>
                      <p
                        className={cn(
                          'text-xs leading-relaxed',
                          activeSection === section.id
                            ? 'text-black/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {section.content}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedContent && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -12 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="mt-8 overflow-hidden"
              >
                <div className={cn(catalogPanelClass, 'border-white/10 bg-white/[0.03] p-6 sm:p-8')}>
                  <div className="flex items-start gap-6">
                    <SectionIcon>{selectedContent.icon}</SectionIcon>
                    <div className="min-w-0 flex-1">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {selectedContent.title}
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContent(null)}
                          className="shrink-0 border-white/10"
                          aria-label="Fermer le contenu"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mb-6 leading-relaxed text-muted-foreground">
                        {selectedContent.content}
                      </p>

                      {selectedContent.features && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                              <Check className="h-5 w-5 text-green-400/80" />
                              Fonctionnalités
                            </h4>
                            <ul className="space-y-2">
                              {selectedContent.features.map((feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              Limitations
                            </h4>
                            <ul className="space-y-2">
                              {selectedContent.limitations?.map((limitation, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                                  <span>{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                              <ExternalLink className="h-5 w-5 text-muted-foreground" />
                              Cas d&apos;Usage
                            </h4>
                            <ul className="space-y-2">
                              {selectedContent.useCases?.map((useCase, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                                  <span>{useCase}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* License Comparison Table */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="mb-12 sm:mb-16"
      >
        <div className={cn(catalogPanelClass, 'p-5 sm:p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <Check className="h-5 w-5" />
              </SectionIcon>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t('licenses.comparisonTitle')}
                </h2>
                <p className="text-sm text-muted-foreground">{t('licenses.comparisonSubtitle')}</p>
              </div>
            </div>
            <CollapseToggle
              expanded={showComparison}
              onClick={() => setShowComparison(!showComparison)}
            />
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className={cn(catalogPanelClass, 'overflow-hidden border-white/6')}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/8">
                          <th className="p-3 text-left text-sm font-semibold text-foreground sm:p-4 sm:text-base">
                            {t('licenses.features')}
                          </th>
                          {(
                            [
                              { key: 'wav' as const, icon: Music, label: 'WAV Lease', tier: t('licenses.basic') },
                              {
                                key: 'trackout' as const,
                                icon: Archive,
                                label: 'Trackout Lease',
                                tier: t('licenses.advanced'),
                              },
                              {
                                key: 'unlimited' as const,
                                icon: Crown,
                                label: 'Unlimited Lease',
                                tier: t('licenses.premium'),
                              },
                            ] as const
                          ).map(({ key, icon: Icon, label, tier }) => (
                            <th key={key} className="min-w-[140px] p-3 text-center sm:p-4">
                              <div className="flex flex-col items-center gap-1 sm:gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                                <span className="text-xs font-semibold text-foreground sm:text-sm">
                                  {label}
                                </span>
                                <span className="text-xs text-muted-foreground">{tier}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModal(key)}
                                  className="mt-1 border-white/10 sm:mt-2"
                                >
                                  <Info className="h-3 w-3" />
                                  <span className="hidden sm:inline">{t('licenses.readMore')}</span>
                                </Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {licenseFeatures.map((feature) => (
                          <tr
                            key={feature.name}
                            className="border-b border-white/6 transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="p-3 text-sm font-medium text-foreground sm:p-4 sm:text-base">
                              {feature.name}
                            </td>
                            <td className="p-3 text-center sm:p-4">{renderFeatureValue(feature.wav)}</td>
                            <td className="p-3 text-center sm:p-4">
                              {renderFeatureValue(feature.trackout)}
                            </td>
                            <td className="p-3 text-center sm:p-4">
                              {renderFeatureValue(feature.unlimited)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Usage Examples */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="mb-12 sm:mb-16"
      >
        <div className={cn(catalogPanelClass, 'p-5 sm:p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <ExternalLink className="h-5 w-5" />
              </SectionIcon>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t('licenses.usageExamples')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('licenses.usageExamplesSubtitle')}
                </p>
              </div>
            </div>
            <CollapseToggle
              expanded={showUsageExamples}
              onClick={() => setShowUsageExamples(!showUsageExamples)}
            />
          </div>

          <AnimatePresence>
            {showUsageExamples && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {usageExamples.map((example, index) => (
                    <motion.div
                      key={example.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.04, duration: 0.4 }}
                      className={cn(
                        catalogPanelClass,
                        'border-white/8 p-4 transition-colors hover:border-white/14 hover:bg-white/[0.04] sm:p-6',
                      )}
                    >
                      <div className="mb-3 flex items-center gap-3 sm:mb-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] sm:h-10 sm:w-10">
                          <example.icon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground sm:text-base">
                          {example.title}
                        </h3>
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-muted-foreground sm:mb-4 sm:text-sm">
                        {example.description}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {example.licenses.map((license, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-white/10 px-2 py-1 font-mono text-xs text-muted-foreground"
                          >
                            {license}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Important Notes */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="mb-12 sm:mb-16"
      >
        <div className={cn(catalogPanelClass, 'p-5 sm:p-6')}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <AlertCircle className="h-5 w-5" />
              </SectionIcon>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t('licenses.importantPoints')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Informations essentielles à connaître avant d&apos;acheter une licence
                </p>
              </div>
            </div>
            <CollapseToggle
              expanded={showImportantPoints}
              onClick={() => setShowImportantPoints(!showImportantPoints)}
            />
          </div>

          <AnimatePresence>
            {showImportantPoints && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {importantNotes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30 sm:h-2 sm:w-2" />
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Contact CTA */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.25 }}
        className="text-center"
      >
        <div className={cn(catalogPanelClass, 'p-6 sm:p-8')}>
          <h2 className="mb-3 text-xl font-semibold text-foreground sm:mb-4 sm:text-2xl">
            {t('licenses.customLicenseTitle')}
          </h2>
          <p className="mx-auto mb-4 max-w-2xl px-2 text-sm text-muted-foreground sm:mb-6 sm:px-0 sm:text-base">
            {t('licenses.customLicenseDescription')}
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/contact">{t('common.contactUs')}</Link>
          </Button>
        </div>
      </motion.div>

      {/* License Details Modal */}
      <AnimatePresence>
        {selectedLicense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
              className="fixed left-1/2 top-1/2 z-[101] mx-3 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  catalogPanelClass,
                  'flex max-h-[90vh] flex-col overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl',
                )}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/8 p-4 sm:p-6">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    {modalIcon}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-foreground sm:text-xl md:text-2xl">
                        {licenseDetails[selectedLicense].title}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                        {licenseDetails[selectedLicense].description}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={closeModal}
                    className="ml-2 shrink-0 border-white/10"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="sticky top-0 flex items-center gap-2 bg-transparent py-2 text-sm font-semibold text-foreground sm:text-base md:text-lg">
                        <Check className="h-4 w-4 text-green-400/80 sm:h-5 sm:w-5" />
                        {t('licenses.includedFeatures')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                          >
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="sticky top-0 flex items-center gap-2 bg-transparent py-2 text-sm font-semibold text-foreground sm:text-base md:text-lg">
                        <AlertCircle className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                        {t('licenses.limitations')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].limitations.map((limitation, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                          >
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="sticky top-0 flex items-center gap-2 bg-transparent py-2 text-sm font-semibold text-foreground sm:text-base md:text-lg">
                        <ExternalLink className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                        {t('licenses.useCases')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].useCases.map((useCase, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                          >
                            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-white/8 p-4 sm:flex-row sm:p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('licenses.completeInformation')}</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button asChild variant="outline" size="sm" className="border-white/10">
                      <Link href="/contact">{t('licenses.questions')}</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={closeModal}
                      className="border-white/10"
                    >
                      {t('common.close')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PublicPageShell>
  );
}
