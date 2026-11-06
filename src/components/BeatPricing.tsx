'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Music, Archive, Crown } from 'lucide-react';
import { Beat } from '@/types/beat';
import { LicenseType } from './LicenseSelector';
import { useTranslation, useLanguage } from '@/contexts/LanguageContext';

interface BeatPricingProps {
  beat: Beat;
  onLicenseSelect?: (license: LicenseType, price: number) => void;
  className?: string;
}

// License config will be moved to use translations

export default function BeatPricing({ beat, onLicenseSelect, className = '' }: BeatPricingProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('WAV_LEASE');

  const getPrice = (license: LicenseType): number => {
    switch (license) {
      case 'WAV_LEASE':
        return beat.wavLeasePrice;
      case 'TRACKOUT_LEASE':
        return beat.trackoutLeasePrice;
      case 'UNLIMITED_LEASE':
        return beat.unlimitedLeasePrice;
      default:
        return beat.wavLeasePrice;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getLicenseConfig = () => ({
    WAV_LEASE: {
      name: t('licenses.wavLease'),
      description: t('licenses.wavLeaseDescription'),
      icon: Music,
      color: 'from-blue-600 to-blue-700',
      features: [
        t('licenses.wavLeaseFeatures.highQualityWav'),
        t('licenses.wavLeaseFeatures.mp3File'),
        t('licenses.wavLeaseFeatures.limitedCommercial')
      ]
    },
    TRACKOUT_LEASE: {
      name: t('licenses.trackoutLease'),
      description: t('licenses.trackoutLeaseDescription'),
      icon: Archive,
      color: 'from-purple-600 to-purple-700',
      features: [
        t('licenses.trackoutLeaseFeatures.highQualityWav'),
        t('licenses.trackoutLeaseFeatures.mp3File'),
        t('licenses.trackoutLeaseFeatures.separateStems'),
        t('licenses.trackoutLeaseFeatures.extendedCommercial')
      ]
    },
    UNLIMITED_LEASE: {
      name: t('licenses.unlimitedLease'),
      description: t('licenses.unlimitedLeaseDescription'),
      icon: Crown,
      color: 'from-orange-600 to-orange-700',
      features: [
        t('licenses.unlimitedLeaseFeatures.highQualityWav'),
        t('licenses.unlimitedLeaseFeatures.mp3File'),
        t('licenses.unlimitedLeaseFeatures.separateStems'),
        t('licenses.unlimitedLeaseFeatures.unlimitedDistribution'),
        t('licenses.unlimitedLeaseFeatures.fullCommercial')
      ]
    }
  });

  const handleLicenseChange = (license: LicenseType) => {
    setSelectedLicense(license);
    onLicenseSelect?.(license, getPrice(license));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{t('beatCard.selectLicense')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(getLicenseConfig()).map(([license, config]) => {
          const Icon = config.icon;
          const isSelected = selectedLicense === license;
          const price = getPrice(license as LicenseType);
          
          return (
            <motion.div
              key={license}
              onClick={() => handleLicenseChange(license as LicenseType)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${isSelected 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Badge de sélection */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Icône et titre */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{config.name}</h4>
                  <p className="text-xs text-gray-400">{config.description}</p>
                </div>
              </div>
              
              {/* Prix */}
              <div className="mb-3">
                <span className="text-xl font-bold text-white">{formatPrice(price)}</span>
              </div>
              
              {/* Fonctionnalités */}
              <ul className="space-y-1">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Indicateur de disponibilité des stems */}
              {license !== 'WAV_LEASE' && !beat.hasStems && (
                <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-xs text-yellow-400 text-center">
                    {t('licenses.stemsNotAvailable')}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
