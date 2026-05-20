'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CreditCard, Trash2, ArrowRight } from 'lucide-react'
import { useCart, useCartActions } from '@/hooks/useCart'
import { Button } from './ui/Button'
import { Beat } from '@/types/beat'
import { LicenseType } from '@/types/cart'
import { catalogPanelClass } from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useApp'

interface CartSummaryProps {
  onCheckout: () => void
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const cart = useCart()
  const { clearCart } = useCartActions()
  const [isClearing, setIsClearing] = useState(false)
  const { t } = useTranslation()

  const getPriceByLicense = (beat: Beat, licenseType: LicenseType): number => {
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

  const getLicenseDisplayName = (licenseType: LicenseType): string => {
    switch (licenseType) {
      case 'WAV_LEASE':
        return t('licenses.wavLease')
      case 'TRACKOUT_LEASE':
        return t('licenses.trackoutLease')
      case 'UNLIMITED_LEASE':
        return t('licenses.unlimitedLease')
      default:
        return t('licenses.wavLease')
    }
  }

  const handleClearCart = () => {
    setIsClearing(true)
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 300)
  }

  if (cart.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(catalogPanelClass, 'p-8 text-center')}
      >
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">{t('cart.empty')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('cart.emptyDescriptionShort')}</p>
        <Button
          onClick={() => {
            window.location.href = '/beats'
          }}
          className="mt-6 h-11 rounded-lg bg-white text-sm font-medium text-black hover:bg-white/90"
        >
          {t('cart.browseBeat')}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(catalogPanelClass, 'p-4 sm:p-6')}
    >
      <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t('cart.orderSummary')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          disabled={isClearing}
          className="w-full border-white/12 text-muted-foreground hover:bg-white/[0.04] sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('cart.clearCart')}
        </Button>
      </div>

      <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
        {cart.items.map((item) => (
          <div
            key={`${item.beat.id}-${item.licenseType}`}
            className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="truncate text-sm font-medium text-foreground sm:text-base">
                  {item.beat.title}
                </span>
                <span className="w-fit rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {getLicenseDisplayName(item.licenseType)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground sm:text-sm">
                × {item.quantity}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground sm:text-base">
              €{(getPriceByLicense(item.beat, item.licenseType) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4 border-t border-white/6 sm:mb-6" />

      <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">
            {t('cart.items')} ({cart.totalItems})
          </span>
          <span className="font-medium text-foreground">€{cart.totalPrice.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">{t('cart.processingFee')}</span>
          <span className="font-medium text-foreground">€0.00</span>
        </div>

        <div className="border-t border-white/6 pt-2 sm:pt-3">
          <div className="flex items-center justify-between text-base font-semibold sm:text-lg">
            <span className="text-foreground">{t('common.total')}</span>
            <span className="text-foreground">€{cart.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-white/90"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {t('cart.proceedToCheckout')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground sm:mt-4 sm:text-sm">
        {t('cart.secureCheckout')}
      </p>
    </motion.div>
  )
}
