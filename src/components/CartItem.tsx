'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Trash2, Music, Clock, Tag, Archive } from 'lucide-react'
import { CartItem as CartItemType } from '@/types/cart'
import { Beat } from '@/types/beat'
import { useCartActions } from '@/hooks/useCart'
import { Button } from './ui/Button'
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
      case 'WAV_LEASE': return beat.wavLeasePrice
      case 'TRACKOUT_LEASE': return beat.trackoutLeasePrice
      case 'UNLIMITED_LEASE': return beat.unlimitedLeasePrice
      default: return beat.wavLeasePrice
    }
  }

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      removeFromCart(item.beat.id, item.licenseType)
    }, 300)
  }

  const formatDuration = (duration: string) => {
    // Convert "3:45" format to "3m 45s"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`bg-card/10 backdrop-blur-lg rounded-xl border border-border/20 p-3 sm:p-4 shadow-sm transition-all duration-300 ${
        isRemoving ? 'opacity-50 scale-95' : 'hover:shadow-md hover:shadow-gray-900/20'
      }`}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        {/* Beat Artwork */}
        {item.beat.artworkUrl && (
          <div className="relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
            <Image
              src={item.beat.artworkUrl}
              alt={`${item.beat.title} artwork`}
              fill
              sizes="64px"
              className="rounded-lg object-cover"
            />
          </div>
        )}
        
        {/* Beat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {item.beat.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {item.beat.genre} • {item.beat.bpm} BPM • {item.beat.key}
              </p>
              
              {/* License Type */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.licenseType === 'WAV_LEASE' ? 'bg-blue-500/20 text-blue-300' :
                  item.licenseType === 'TRACKOUT_LEASE' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-orange-500/20 text-orange-300'
                }`}>
                  {item.licenseType === 'WAV_LEASE' ? t('licenses.wavLease') :
                   item.licenseType === 'TRACKOUT_LEASE' ? t('licenses.trackoutLease') :
                   t('licenses.unlimitedLease')}
                </span>
              </div>
              
              {/* Beat Details */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formatDuration(item.beat.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Music className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{item.beat.rating.toFixed(1)} ⭐</span>
                </div>
                {item.beat.isExclusive && (
                  <div className="flex items-center space-x-1 text-purple-400">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium text-xs sm:text-sm">{t('beatCard.exclusive')}</span>
                  </div>
                )}
                {item.beat.stemsUrl && (
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium text-xs sm:text-sm">{t('beatCard.stems')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right sm:text-right">
              <div className="text-lg sm:text-xl font-bold text-foreground">
                €{getPrice(item.beat, item.licenseType).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t('cart.singleItem')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-500/50 touch-manipulation"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">{t('common.remove')}</span>
        </Button>
      </div>
    </motion.div>
  )
}
