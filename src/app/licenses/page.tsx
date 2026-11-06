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
  ExternalLink,
} from 'lucide-react';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

type LicenseKey = 'wav' | 'trackout' | 'unlimited';

interface LicenseFeature {
  id: string;
  name: string;
  wav: boolean | string;
  trackout: boolean | string;
  unlimited: boolean | string;
}

interface LicenseDetail {
  title: string;
  description: string;
  features: string[];
  limitations: string[];
  useCases: string[];
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

const licenseDetails: Record<LicenseKey, LicenseDetail> = {
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

const licenseTiers: {
  key: LicenseKey;
  icon: typeof Music;
  label: string;
  tierKey: 'basic' | 'advanced' | 'premium';
}[] = [
  { key: 'wav', icon: Music, label: 'WAV Lease', tierKey: 'basic' },
  { key: 'trackout', icon: Archive, label: 'Trackout Lease', tierKey: 'advanced' },
  { key: 'unlimited', icon: Crown, label: 'Unlimited Lease', tierKey: 'premium' },
];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LicensesPage() {
  const { t } = useTranslation();
  const [selectedLicense, setSelectedLicense] = useState<LicenseKey>('wav');
  const [activeSection, setActiveSection] = useState('important');

  const pageTitle = `${t('licenses.pageTitle')} ${t('licenses.pageTitleHighlight')}`;
  const detail = licenseDetails[selectedLicense];

  const navItems = [
    { id: 'important', label: t('licenses.importantPoints') },
    { id: 'comparison', label: t('licenses.comparisonTitle') },
    { id: 'wav', label: 'WAV Lease' },
    { id: 'trackout', label: 'Trackout Lease' },
    { id: 'unlimited', label: 'Unlimited Lease' },
    { id: 'usage', label: t('licenses.usageExamples') },
  ];

  const scrollToSection = (sectionId: string) => {
    const isLicense = sectionId === 'wav' || sectionId === 'trackout' || sectionId === 'unlimited';
    if (isLicense) {
      setSelectedLicense(sectionId);
    }
    setActiveSection(sectionId);
    const targetId = isLicense ? 'licenses' : sectionId;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLicense = (licenseType: LicenseKey) => {
    setSelectedLicense(licenseType);
    setActiveSection(licenseType);
    document.getElementById('licenses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  return (
    <PublicPageShell maxWidth="max-w-6xl">
      <PublicPageHeader
        label={t('nav.licenses')}
        title={pageTitle}
        subtitle={t('licenses.pageSubtitle')}
      />

      <motion.nav
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        aria-label={t('licenses.tableOfContents')}
        className="mb-10 flex flex-wrap gap-2"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'border-white/20 bg-white text-black'
                  : 'border-white/10 text-muted-foreground hover:border-white/14 hover:bg-white/[0.04] hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </motion.nav>

      <motion.section
        id="important"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.08 }}
        className="mb-12 scroll-mt-28 sm:mb-16"
      >
        <div className={cn(catalogPanelClass, 'p-5 sm:p-6')}>
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('licenses.importantPoints')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t('licenses.importantPointsSubtitle')}
              </p>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {importantNotes.map((note) => (
              <li key={note} className="flex items-start gap-2 sm:gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      <motion.section
        id="comparison"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="mb-12 scroll-mt-28 sm:mb-16"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{t('licenses.comparisonTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('licenses.comparisonSubtitle')}</p>
        </div>
        <div className={cn(catalogPanelClass, 'overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="p-3 text-left text-sm font-semibold text-foreground sm:p-4 sm:text-base">
                    {t('licenses.features')}
                  </th>
                  {licenseTiers.map(({ key, icon: Icon, label, tierKey }) => (
                    <th key={key} className="min-w-[150px] p-3 text-center sm:p-4">
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                        <span className="text-xs font-semibold text-foreground sm:text-sm">{label}</span>
                        <span className="text-xs text-muted-foreground">{t(`licenses.${tierKey}`)}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openLicense(key)}
                          className="mt-1 border-white/10 sm:mt-2"
                        >
                          {t('licenses.readMore')}
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licenseFeatures.map((feature) => (
                  <tr
                    key={feature.id}
                    className="border-b border-white/6 transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-3 text-sm font-medium text-foreground sm:p-4">{feature.name}</td>
                    <td className="p-3 text-center sm:p-4">{renderFeatureValue(feature.wav)}</td>
                    <td className="p-3 text-center sm:p-4">{renderFeatureValue(feature.trackout)}</td>
                    <td className="p-3 text-center sm:p-4">{renderFeatureValue(feature.unlimited)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="licenses"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.12 }}
        className="mb-12 scroll-mt-28 sm:mb-16"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{t('licenses.detailsTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('licenses.detailsSubtitle')}</p>
        </div>

        <div
          role="tablist"
          aria-label={t('licenses.detailsTitle')}
          className="mb-4 flex flex-col gap-2 sm:flex-row"
        >
          {licenseTiers.map(({ key, icon: Icon, label, tierKey }) => {
            const isSelected = selectedLicense === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedLicense(key);
                  setActiveSection(key);
                }}
                className={cn(
                  'flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/10 text-muted-foreground hover:border-white/14 hover:bg-white/[0.04] hover:text-foreground',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={cn('block text-xs', isSelected ? 'text-black/60' : 'text-muted-foreground')}>
                    {t(`licenses.${tierKey}`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLicense}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={cn(catalogPanelClass, 'p-5 sm:p-6')}
          >
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">{detail.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {detail.description}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                  <Check className="h-4 w-4 text-green-400/80" />
                  {t('licenses.includedFeatures')}
                </h4>
                <BulletList items={detail.features} />
              </div>
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  {t('licenses.limitations')}
                </h4>
                <BulletList items={detail.limitations} />
              </div>
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  {t('licenses.useCases')}
                </h4>
                <BulletList items={detail.useCases} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      <motion.section
        id="usage"
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.14 }}
        className="mb-12 scroll-mt-28 sm:mb-16"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{t('licenses.usageExamples')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('licenses.usageExamplesSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usageExamples.map((example) => (
            <div
              key={example.title}
              className={cn(catalogPanelClass, 'p-4 transition-colors hover:border-white/14 hover:bg-white/[0.04] sm:p-6')}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                  <example.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground sm:text-base">{example.title}</h3>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{example.description}</p>
              <div className="flex flex-wrap gap-2">
                {example.licenses.map((license) => (
                  <span
                    key={license}
                    className="rounded-full border border-white/10 px-2 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {license}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }} className="text-center">
        <div className={cn(catalogPanelClass, 'p-6 sm:p-8')}>
          <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
            {t('licenses.customLicenseTitle')}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t('licenses.customLicenseDescription')}
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/contact">{t('common.contactUs')}</Link>
          </Button>
        </div>
      </motion.div>
    </PublicPageShell>
  );
}
