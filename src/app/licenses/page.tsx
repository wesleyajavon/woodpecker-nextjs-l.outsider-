'use client';

import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
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
    id: "files",
    name: "Fichiers inclus",
    wav: "WAV & MP3",
    trackout: "WAV, STEMS & MP3",
    unlimited: "WAV, STEMS & MP3"
  },
  {
    id: "commercial",
    name: "Usage commercial",
    wav: true,
    trackout: true,
    unlimited: true
  },
  {
    id: "copies",
    name: "Copies distribuées",
    wav: "5 000",
    trackout: "10 000",
    unlimited: "Illimité"
  },
  {
    id: "streams",
    name: "Streams audio en ligne",
    wav: "100 000",
    trackout: "250 000",
    unlimited: "Illimité"
  },
  {
    id: "videos",
    name: "Clips vidéo",
    wav: "1",
    trackout: "3",
    unlimited: "Illimité"
  },
  {
    id: "live-nonprofit",
    name: "Performances live (non-profit)",
    wav: "Illimité",
    trackout: "Illimité",
    unlimited: "Illimité"
  },
  {
    id: "live-profit",
    name: "Performances live (profit)",
    wav: false,
    trackout: false,
    unlimited: true
  },
  {
    id: "radio-tv",
    name: "Diffusion radio/TV",
    wav: false,
    trackout: false,
    unlimited: true
  },
  {
    id: "sync",
    name: "Synchronisation (films/pubs)",
    wav: false,
    trackout: false,
    unlimited: true
  },
  {
    id: "credit",
    name: "Crédit producteur requis",
    wav: true,
    trackout: true,
    unlimited: true
  }
];

// Detailed license information (placeholder - will be populated with your content)
const licenseDetails: LicenseDetails = {
  wav: {
    title: "WAV Lease - Licence Non-Exclusive",
    description: "Licence non-exclusive de 10 ans permettant l'usage commercial du beat avec des droits essentiels pour artistes et producteurs.",
    features: [
      "Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps",
      "Droit d'enregistrer des voix sur le beat pour créer une nouvelle chanson",
      "Modification autorisée (arrangement, tempo, tonalité, durée)",
      "Distribution jusqu'à 5 000 copies physiques et digitales",
      "Jusqu'à 100 000 streams audio monétisés",
      "1 clip vidéo monétisé (max 5 minutes)",
      "Performances live non-profit illimitées",
      "Vente en format single, EP ou album",
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      "Pas de redevances supplémentaires à payer"
    ],
    limitations: [
      "Licence NON-EXCLUSIVE (le beat peut être vendu à d'autres)",
      "Pas de fichiers stems/trackouts inclus",
      "Aucune performance live payante autorisée",
      "Pas de diffusion radio/TV commerciale",
      "Pas de synchronisation (films, pubs, jeux vidéo)",
      "Interdiction de revendre le beat dans sa forme originale",
      "Pas de droit de sous-licencier à des tiers",
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat",
      "Interdiction d'enregistrer le beat seul avec Content ID"
    ],
    useCases: [
      "Singles et projets musicaux indépendants",
      "Mixtapes et compilations gratuites",
      "Streaming sur Spotify, Apple Music, Deezer",
      "Concerts et festivals non-commerciaux",
      "Promotion sur réseaux sociaux",
      "Vente digitale et physique limitée"
    ]
  },
  trackout: {
    title: "Trackout Lease - Licence Premium avec Stems",
    description: "Licence non-exclusive de 10 ans incluant les stems pour un contrôle créatif total et des droits commerciaux étendus.",
    features: [
      "Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps",
      "Stems/Trackouts complets (pistes séparées)",
      "Droit d'enregistrer et modifier librement le beat",
      "Remixage et arrangements personnalisés autorisés",
      "Distribution jusqu'à 10 000 copies physiques et digitales",
      "Jusqu'à 250 000 streams audio monétisés",
      "3 clips vidéo monétisés (max 5 minutes chacun)",
      "Performances live non-profit illimitées",
      "Vente en format single, EP ou album",
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      "Pas de redevances supplémentaires à payer"
    ],
    limitations: [
      "Licence NON-EXCLUSIVE (le beat peut être vendu à d'autres)",
      "Aucune performance live payante autorisée",
      "Pas de diffusion radio/TV commerciale",
      "Pas de synchronisation (films, pubs, jeux vidéo)",
      "Interdiction de revendre le beat ou les stems dans leur forme originale",
      "Pas de droit de sous-licencier à des tiers",
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat"
    ],
    useCases: [
      "Albums et EPs professionnels",
      "Remixage et production avancée",
      "Collaborations artistiques",
      "Clips vidéo multiples et promotion",
      "Distribution élargie sur plateformes",
      "Projets créatifs nécessitant les stems"
    ]
  },
  unlimited: {
    title: "Unlimited Lease - Licence Commerciale Complète",
    description: "Licence non-exclusive de 10 ans offrant tous les droits commerciaux pour une utilisation professionnelle sans limitations de distribution.",
    features: [
      "Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps",
      "Stems/Trackouts complets (pistes séparées)",
      "Droit d'enregistrer et modifier librement le beat",
      "Distribution ILLIMITÉE de copies physiques et digitales",
      "Streams audio monétisés ILLIMITÉS",
      "Clips vidéo monétisés ILLIMITÉS",
      "Performances live payantes AUTORISÉES",
      "Diffusion radio et télévision commerciale",
      "Synchronisation (films, publicités, documentaires, jeux vidéo)",
      "Vente en format single, EP ou album sans restriction",
      "Partage des droits d'auteur : 50% Producteur / 50% Artiste",
      "Pas de redevances supplémentaires à payer"
    ],
    limitations: [
      "Licence NON-EXCLUSIVE (le beat peut être vendu à d'autres)",
      "Interdiction de revendre le beat ou les stems dans leur forme originale",
      "Pas de droit de sous-licencier à des tiers",
      "Crédit producteur 'Prod. l.outsider' OBLIGATOIRE",
      "Durée limitée à 10 ans à partir de l'achat"
    ],
    useCases: [
      "Projets commerciaux majeurs et albums",
      "Tournées et concerts payants",
      "Campagnes publicitaires et marketing",
      "Films, documentaires et contenus audiovisuels",
      "Diffusion radio/TV et podcasts",
      "Distribution mondiale sans restriction",
      "Synchronisation pour médias et jeux vidéo",
      "Projets nécessitant une flexibilité commerciale totale"
    ]
  }
};

const usageExamples = [
  {
    icon: Headphones,
    title: "Streaming Platforms",
    description: "Spotify, Apple Music, Deezer, YouTube Music",
    licenses: ["WAV", "Trackout", "Unlimited"]
  },
  {
    icon: Video,
    title: "Clips Vidéo",
    description: "YouTube, Instagram, TikTok, clips promotionnels",
    licenses: ["WAV (1)", "Trackout (3)", "Unlimited"]
  },
  {
    icon: Users,
    title: "Performances Live",
    description: "Concerts, festivals, événements (non-profit)",
    licenses: ["WAV", "Trackout", "Unlimited"]
  },
  {
    icon: Radio,
    title: "Radio & TV",
    description: "Diffusion radio, télévision, podcasts",
    licenses: ["Unlimited uniquement"]
  },
  {
    icon: Building,
    title: "Usage Commercial",
    description: "Publicités, films, documentaires",
    licenses: ["Unlimited uniquement"]
  },
  {
    icon: Globe,
    title: "Distribution Mondiale",
    description: "Vente et distribution dans le monde entier",
    licenses: ["WAV", "Trackout", "Unlimited"]
  }
];

const importantNotes = [
  "Le crédit producteur 'Prod. l.outsider' est obligatoire sur tous les titres",
  "Les licences ne sont pas exclusives - le beat peut être vendu à d'autres artistes",
  "Aucun remboursement après téléchargement des fichiers",
  "Les droits d'auteur restent la propriété de l.outsider",
  "Usage à des fins illégales strictement interdit",
  "Revente ou redistribution des fichiers interdite"
];

// Sections organisées pour la table des matières
const licenseSections = [
  {
    id: 'comparison',
    title: 'Comparaison des Licences',
    icon: <Check className="w-5 h-5" />,
    color: 'indigo',
    content: `Tableau comparatif détaillé des trois types de licences disponibles : WAV Lease, Trackout Lease et Unlimited Lease. Comparez les fonctionnalités, limitations et cas d'usage pour chaque licence.`
  },
  {
    id: 'wav-lease',
    title: 'WAV Lease - Licence Basique',
    icon: <Music className="w-5 h-5" />,
    color: 'blue',
    content: `Licence non-exclusive de 10 ans permettant l'usage commercial du beat avec des droits essentiels pour artistes et producteurs. Inclut fichiers WAV haute qualité et MP3 320kbps.`,
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Droit d\'enregistrer des voix sur le beat pour créer une nouvelle chanson',
      'Modification autorisée (arrangement, tempo, tonalité, durée)',
      'Distribution jusqu\'à 5 000 copies physiques et digitales',
      'Jusqu\'à 100 000 streams audio monétisés',
      '1 clip vidéo monétisé (max 5 minutes)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      'Partage des droits d\'auteur : 50% Producteur / 50% Artiste',
      'Pas de redevances supplémentaires à payer'
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Pas de fichiers stems/trackouts inclus',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat dans sa forme originale',
      'Pas de droit de sous-licencier à des tiers',
      'Crédit producteur \'Prod. l.outsider\' OBLIGATOIRE',
      'Durée limitée à 10 ans à partir de l\'achat',
      'Interdiction d\'enregistrer le beat seul avec Content ID'
    ],
    useCases: [
      'Singles et projets musicaux indépendants',
      'Mixtapes et compilations gratuites',
      'Streaming sur Spotify, Apple Music, Deezer',
      'Concerts et festivals non-commerciaux',
      'Promotion sur réseaux sociaux',
      'Vente digitale et physique limitée'
    ]
  },
  {
    id: 'trackout-lease',
    title: 'Trackout Lease - Licence Premium',
    icon: <Archive className="w-5 h-5" />,
    color: 'purple',
    content: `Licence non-exclusive de 10 ans incluant les stems pour un contrôle créatif total et des droits commerciaux étendus. Parfait pour les producteurs et artistes nécessitant une flexibilité créative.`,
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      'Droit d\'enregistrer et modifier librement le beat',
      'Remixage et arrangements personnalisés autorisés',
      'Distribution jusqu\'à 10 000 copies physiques et digitales',
      'Jusqu\'à 250 000 streams audio monétisés',
      '3 clips vidéo monétisés (max 5 minutes chacun)',
      'Performances live non-profit illimitées',
      'Vente en format single, EP ou album',
      'Partage des droits d\'auteur : 50% Producteur / 50% Artiste',
      'Pas de redevances supplémentaires à payer'
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Aucune performance live payante autorisée',
      'Pas de diffusion radio/TV commerciale',
      'Pas de synchronisation (films, pubs, jeux vidéo)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      'Crédit producteur \'Prod. l.outsider\' OBLIGATOIRE',
      'Durée limitée à 10 ans à partir de l\'achat'
    ],
    useCases: [
      'Albums et EPs professionnels',
      'Remixage et production avancée',
      'Collaborations artistiques',
      'Clips vidéo multiples et promotion',
      'Distribution élargie sur plateformes',
      'Projets créatifs nécessitant les stems'
    ]
  },
  {
    id: 'unlimited-lease',
    title: 'Unlimited Lease - Licence Complète',
    icon: <Crown className="w-5 h-5" />,
    color: 'orange',
    content: `Licence non-exclusive de 10 ans offrant tous les droits commerciaux pour une utilisation professionnelle sans limitations de distribution. La solution complète pour tous les projets commerciaux.`,
    features: [
      'Fichiers WAV haute qualité (24-bit/44.1kHz) et MP3 320kbps',
      'Stems/Trackouts complets (pistes séparées)',
      'Droit d\'enregistrer et modifier librement le beat',
      'Distribution ILLIMITÉE de copies physiques et digitales',
      'Streams audio monétisés ILLIMITÉS',
      'Clips vidéo monétisés ILLIMITÉS',
      'Performances live payantes AUTORISÉES',
      'Diffusion radio et télévision commerciale',
      'Synchronisation (films, publicités, documentaires, jeux vidéo)',
      'Vente en format single, EP ou album sans restriction',
      'Partage des droits d\'auteur : 50% Producteur / 50% Artiste',
      'Pas de redevances supplémentaires à payer'
    ],
    limitations: [
      'Licence NON-EXCLUSIVE (le beat peut être vendu à d\'autres)',
      'Interdiction de revendre le beat ou les stems dans leur forme originale',
      'Pas de droit de sous-licencier à des tiers',
      'Crédit producteur \'Prod. l.outsider\' OBLIGATOIRE',
      'Durée limitée à 10 ans à partir de l\'achat'
    ],
    useCases: [
      'Projets commerciaux majeurs et albums',
      'Tournées et concerts payants',
      'Campagnes publicitaires et marketing',
      'Films, documentaires et contenus audiovisuels',
      'Diffusion radio/TV et podcasts',
      'Distribution mondiale sans restriction',
      'Synchronisation pour médias et jeux vidéo',
      'Projets nécessitant une flexibilité commerciale totale'
    ]
  },
  {
    id: 'usage-examples',
    title: 'Exemples d\'Utilisation',
    icon: <ExternalLink className="w-5 h-5" />,
    color: 'green',
    content: `Découvrez les différents cas d'usage pour chaque type de licence. De Spotify aux clips vidéo, en passant par les performances live et la diffusion radio/TV.`
  },
  {
    id: 'important-notes',
    title: 'Points Importants',
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'yellow',
    content: `Informations essentielles à connaître avant d'acheter une licence. Règles importantes, limitations et obligations légales.`
  }
];

// Type pour les sections de licence
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

export default function LicensesPage() {
  const { t } = useTranslation();
  const [selectedLicense, setSelectedLicense] = useState<'wav' | 'trackout' | 'unlimited' | null>(null);
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
    
    // Trouver la section dans les sections
    const section = licenseSections.find(s => s.id === sectionId);
    if (section) {
      setSelectedContent(section);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400',
      blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400',
      purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400',
      orange: 'from-orange-500/10 to-yellow-500/10 border-orange-500/20 text-orange-400',
      green: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400',
      yellow: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20 text-yellow-400'
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DottedSurface />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
      </div>

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="mb-16 mt-6">
              <TextRewind text={`${t('licenses.pageTitle')} ${t('licenses.pageTitleHighlight')}`} />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              {t('licenses.pageSubtitle')}
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            id="table-of-contents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t('licenses.tableOfContents')}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTableOfContents(!showTableOfContents)}
                  className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-colors"
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform", showTableOfContents && "rotate-90")} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showTableOfContents && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {licenseSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg transition-all duration-200 border",
                            activeSection === section.id
                              ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-card/10 border-border/20"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn("p-2 rounded-lg", `bg-gradient-to-r ${getColorClasses(section.color).split(' ')[0]} ${getColorClasses(section.color).split(' ')[1]} border ${getColorClasses(section.color).split(' ')[2]}`)}>
                              {section.icon}
                            </div>
                            <h3 className="font-medium text-sm">{section.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {section.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Content Display */}
              <AnimatePresence>
                {selectedContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-card/30 to-card/10 backdrop-blur-xl rounded-2xl border border-border/40 p-8 shadow-xl">
                      <div className="flex items-start gap-6">
                        <div className={cn("p-3 rounded-xl flex-shrink-0", `bg-gradient-to-r ${getColorClasses(selectedContent.color).split(' ')[0]} ${getColorClasses(selectedContent.color).split(' ')[1]} border ${getColorClasses(selectedContent.color).split(' ')[2]}`)}>
                          {selectedContent.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-foreground">
                              {selectedContent.title}
                            </h3>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedContent(null)}
                              className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-colors text-muted-foreground hover:text-foreground"
                              title="Fermer le contenu"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {selectedContent.content}
                          </p>
                          
                          {/* Features, Limitations, Use Cases */}
                          {selectedContent.features && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Features */}
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Check className="w-5 h-5 text-green-400" />
                                  Fonctionnalités
                                </h4>
                                <ul className="space-y-2">
                                  {selectedContent.features?.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Limitations */}
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                                  Limitations
                                </h4>
                                <ul className="space-y-2">
                                  {selectedContent.limitations?.map((limitation: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                      <span>{limitation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Use Cases */}
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <ExternalLink className="w-5 h-5 text-blue-400" />
                                  Cas d&apos;Usage
                                </h4>
                                <ul className="space-y-2">
                                  {selectedContent.useCases?.map((useCase: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 sm:mb-16"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <Check className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{t('licenses.comparisonTitle')}</h2>
                    <p className="text-sm text-muted-foreground">{t('licenses.comparisonSubtitle')}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComparison(!showComparison)}
                  className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-colors"
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform", showComparison && "rotate-90")} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showComparison && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-card/10 backdrop-blur-lg rounded-xl border border-border/20 overflow-hidden">
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left p-3 sm:p-4 text-foreground font-semibold text-sm sm:text-base">{t('licenses.features')}</th>
                      <th className="text-center p-3 sm:p-4 min-w-[140px]">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                          <span className="font-semibold text-foreground text-xs sm:text-sm">WAV Lease</span>
                          <span className="text-xs text-muted-foreground">{t('licenses.basic')}</span>
                          <button
                            onClick={() => openModal('wav')}
                            className="mt-1 sm:mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg touch-manipulation"
                          >
                            <Info className="w-3 h-3" />
                            <span className="hidden sm:inline">{t('licenses.readMore')}</span>
                          </button>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-4 min-w-[140px]">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                          <span className="font-semibold text-foreground text-xs sm:text-sm">Trackout Lease</span>
                          <span className="text-xs text-muted-foreground">{t('licenses.advanced')}</span>
                          <button
                            onClick={() => openModal('trackout')}
                            className="mt-1 sm:mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg touch-manipulation"
                          >
                            <Info className="w-3 h-3" />
                            <span className="hidden sm:inline">{t('licenses.readMore')}</span>
                          </button>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-4 min-w-[140px]">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                          <span className="font-semibold text-foreground text-xs sm:text-sm">Unlimited Lease</span>
                          <span className="text-xs text-muted-foreground">{t('licenses.premium')}</span>
                          <button
                            onClick={() => openModal('unlimited')}
                            className="mt-1 sm:mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg touch-manipulation"
                          >
                            <Info className="w-3 h-3" />
                            <span className="hidden sm:inline">{t('licenses.readMore')}</span>
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseFeatures.map((feature) => (
                      <tr key={feature.name} className="border-b border-border/10 hover:bg-card/5">
                        <td className="p-3 sm:p-4 font-medium text-foreground text-sm sm:text-base">{feature.name}</td>
                        <td className="p-3 sm:p-4 text-center">
                          {typeof feature.wav === 'boolean' ? (
                            feature.wav ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-foreground font-medium text-xs sm:text-sm">{feature.wav}</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          {typeof feature.trackout === 'boolean' ? (
                            feature.trackout ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-foreground font-medium text-xs sm:text-sm">{feature.trackout}</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          {typeof feature.unlimited === 'boolean' ? (
                            feature.unlimited ? (
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-foreground font-medium text-xs sm:text-sm">{feature.unlimited}</span>
                          )}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 sm:mb-16"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <ExternalLink className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{t('licenses.usageExamples')}</h2>
                    <p className="text-sm text-muted-foreground">{t('licenses.usageExamplesSubtitle')}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUsageExamples(!showUsageExamples)}
                  className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-colors"
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform", showUsageExamples && "rotate-90")} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showUsageExamples && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {usageExamples.map((example, index) => (
                <motion.div
                  key={example.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-card/10 backdrop-blur-lg rounded-xl border border-border/20 p-4 sm:p-6 hover:border-border/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <example.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{example.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{example.description}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {example.licenses.map((license, idx) => (
                      <div key={idx} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {license}
                      </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 sm:mb-16"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{t('licenses.importantPoints')}</h2>
                    <p className="text-sm text-muted-foreground">Informations essentielles à connaître avant d&apos;acheter une licence</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowImportantPoints(!showImportantPoints)}
                  className="p-2 rounded-lg bg-card/10 hover:bg-card/20 transition-colors"
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform", showImportantPoints && "rotate-90")} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showImportantPoints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {importantNotes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{note}</p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="bg-card/10 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border/20 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t('licenses.customLicenseTitle')}</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-2 sm:px-0">
                {t('licenses.customLicenseDescription')}
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base touch-manipulation shadow-lg hover:shadow-xl"
              >
                {t('common.contactUs')}
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* License Details Modal */}
      <AnimatePresence>
        {selectedLicense && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={closeModal}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-4xl mx-3 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header - Fixed */}
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border/20 flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {selectedLicense === 'wav' && <Music className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />}
                    {selectedLicense === 'trackout' && <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />}
                    {selectedLicense === 'unlimited' && <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                        {licenseDetails[selectedLicense].title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                        {licenseDetails[selectedLicense].description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg flex-shrink-0 touch-manipulation"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* Features */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -mt-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                        {t('licenses.includedFeatures')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm md:text-sm text-muted-foreground leading-relaxed">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -mt-2">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400" />
                        {t('licenses.limitations')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm md:text-sm text-muted-foreground leading-relaxed">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Use Cases */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                      <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -mt-2">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                        {t('licenses.useCases')}
                      </h4>
                      <ul className="space-y-1 sm:space-y-2">
                        {licenseDetails[selectedLicense].useCases.map((useCase, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm md:text-sm text-muted-foreground leading-relaxed">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Modal Footer - Fixed */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 md:p-6 border-t border-border/20 bg-card/20 flex-shrink-0 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('licenses.completeInformation')}</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <a
                      href="/contact"
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors touch-manipulation"
                    >
                      {t('licenses.questions')}
                    </a>
                    <button
                      onClick={closeModal}
                      className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium touch-manipulation"
                    >
                      {t('common.close')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
