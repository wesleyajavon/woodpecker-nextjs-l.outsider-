'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, Music, Clock, Tag, Archive } from 'lucide-react'
import { CartItem as CartItemType } from '@/types/cart'
import { Beat } from '@/types/beat'
import { useCartActions } from '@/hooks/useCart'
import { Button } from './ui/Button'
import { catalogCardClass } from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useApp'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart } = useCartActions()
  const [isRemoving, setIsRemoving] = useState(false)
  const { t } = useTranslation()

  const getPrice = (beat: Beat, licenseType: string): number => {
    switch (licenseType) {
      case 'WAV_LEASE':
        return beat.wavLeasePrice
      case 'TRACKOUT_LEASE':
        return beat.trackoutLeasePrice
      case 'UNLIMITED_LEASE':
        return beat.unlimitedLeasePrice
      default:
        return beat.wavLeasePrice
    }
  }

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      removeFromCart(item.beat.id, item.licenseType)
    }, 300)
  }

  const formatDuration = (duration: string) => {
    const parts = duration.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0])
      const seconds = parseInt(parts[1])
      return `${minutes}m ${seconds}s`
    }
    return duration
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className={cn(
        catalogCardClass,
        'p-3 sm:p-4',
        isRemoving && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {item.beat.artworkUrl && (
          <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <Image
              src={item.beat.artworkUrl}
              alt={`${item.beat.title} artwork`}
              fill
              sizes="64px"
              className="rounded-lg object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
                {item.beat.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {item.beat.genre} · {item.beat.bpm} BPM · {item.beat.key}
              </p>

              <div className="mt-2">
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-2 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {item.licenseType === 'WAV_LEASE'
                    ? t('licenses.wavLease')
                    : item.licenseType === 'TRACKOUT_LEASE'
                      ? t('licenses.trackoutLease')
                      : t('licenses.unlimitedLease')}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formatDuration(item.beat.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Music className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{item.beat.rating.toFixed(1)}</span>
                </div>
                {item.beat.isExclusive && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('beatCard.exclusive')}</span>
                  </div>
                )}
                {item.beat.stemsUrl && (
                  <div className="flex items-center gap-1">
                    <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('beatCard.stems')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                €{getPrice(item.beat, item.licenseType).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                {t('cart.singleItem')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-end border-t border-white/6 pt-3 sm:mt-4 sm:pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="border-white/12 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('common.remove')}
        </Button>
      </div>
    </motion.div>
  )
}
