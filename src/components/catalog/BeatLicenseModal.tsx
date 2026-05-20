'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { LicenseType } from '@/types/cart';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface LicenseOption {
  type: LicenseType;
  title: string;
  subtitle: string;
  price: number;
}

interface BeatLicenseModalProps {
  open: boolean;
  onClose: () => void;
  selectedLicense: LicenseType;
  onSelectLicense: (license: LicenseType) => void;
  expandedLicense: LicenseType | null;
  onToggleExpanded: (license: LicenseType | null) => void;
  options: LicenseOption[];
  formatPrice: (price: number) => string;
}

export function BeatLicenseModal({
  open,
  onClose,
  selectedLicense,
  onSelectLicense,
  expandedLicense,
  onToggleExpanded,
  options,
  formatPrice,
}: BeatLicenseModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          className="fixed left-1/2 top-1/2 z-[9999] flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 p-4 sm:p-5">
              <h3 className="truncate text-base font-medium text-foreground sm:text-lg">
                {t('beatCard.selectLicense')}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="space-y-2">
                {options.map((option) => (
                  <div
                    key={option.type}
                    className={cn(
                      'rounded-lg border transition-colors',
                      selectedLicense === option.type
                        ? 'border-white/25 bg-white/[0.06]'
                        : 'border-white/8 hover:border-white/15 hover:bg-white/[0.03]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
                      <button
                        type="button"
                        onClick={() => onSelectLicense(option.type)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="mb-0.5 flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {option.title}
                          </span>
                          {selectedLicense === option.type && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{option.subtitle}</p>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                          {formatPrice(option.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onToggleExpanded(
                              expandedLicense === option.type ? null : option.type,
                            )
                          }
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                        >
                          {expandedLicense === option.type ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedLicense === option.type && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 border-t border-white/8 px-3 pb-3 pt-2 text-xs text-muted-foreground sm:px-4 sm:pb-4">
                            <p>• Used for Music Recording</p>
                            <p>
                              • Distribute up to{' '}
                              {option.type === 'UNLIMITED_LEASE'
                                ? 'UNLIMITED'
                                : option.type === 'TRACKOUT_LEASE'
                                  ? '10 000'
                                  : '5 000'}{' '}
                              copies
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 gap-2 border-t border-white/8 p-4 sm:p-5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
