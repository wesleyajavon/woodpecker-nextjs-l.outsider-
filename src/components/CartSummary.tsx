'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CreditCard, Trash2, ArrowRight } from 'lucide-react'
import { useCart, useCartActions } from '@/hooks/useCart'
import { Button } from './ui/Button'
import { Beat } from '@/types/beat'
import { LicenseType } from '@/types/cart'
import { useTranslation } from '@/hooks/useApp'

interface CartSummaryProps {
  onCheckout: () => void
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const cart = useCart()
  const { clearCart } = useCartActions()
  const [isClearing, setIsClearing] = useState(false)
  const { t } = useTranslation()

  // Helper function to get price based on license type
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

  // Helper function to get license display name
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="signal-glow rounded-xl border border-primary/15 bg-card/20 p-8 text-center backdrop-blur-lg"
      >
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">{t('cart.empty')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('cart.emptyDescriptionShort')}
        </p>
        <Button
          onClick={() => window.location.href = '/beats'}
          className="signal-glow bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t('cart.browseBeat')}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="signal-glow rounded-xl border border-primary/15 bg-card/20 p-4 shadow-sm backdrop-blur-lg sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">{t('cart.orderSummary')}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          disabled={isClearing}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-500/50 w-full sm:w-auto touch-manipulation"
        >
          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">{t('cart.clearCart')}</span>
        </Button>
      </div>

      {/* Cart Items Summary */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {cart.items.map((item) => (
          <div key={`${item.beat.id}-${item.licenseType}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium text-foreground text-sm sm:text-base truncate">{item.beat.title}</span>
                <span className="w-fit rounded-full border border-primary/20 bg-primary/15 px-2 py-1 text-xs text-primary">
                  {getLicenseDisplayName(item.licenseType)}
                </span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm">× {item.quantity}</span>
            </div>
            <span className="font-medium text-foreground text-sm sm:text-base">
              €{(getPriceByLicense(item.beat, item.licenseType) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border/20 mb-4 sm:mb-6"></div>

      {/* Totals */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">{t('cart.items')} ({cart.totalItems})</span>
          <span className="text-foreground font-medium">€{cart.totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">{t('cart.processingFee')}</span>
          <span className="text-foreground font-medium">€0.00</span>
        </div>
        
        {/* <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">VAT (21%)</span>
          <span className="text-foreground">€{(cart.totalPrice * 0.21).toFixed(2)}</span>
        </div> */}
        
        <div className="border-t border-border/20 pt-2 sm:pt-3">
          <div className="flex items-center justify-between text-base sm:text-lg font-semibold">
            <span className="text-foreground">{t('common.total')}</span>
            <span className="text-foreground">
              {/* €{(cart.totalPrice * 1.21).toFixed(2)} */}
              €{cart.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        className="signal-glow w-full touch-manipulation rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 sm:px-6 sm:py-4"
      >
        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        <span className="text-sm sm:text-base">{t('cart.proceedToCheckout')}</span>
        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
      </Button>

      {/* Security Notice */}
      <p className="text-xs sm:text-sm text-muted-foreground text-center mt-3 sm:mt-4">
        🔒 {t('cart.secureCheckout')}
      </p>
    </motion.div>
  )
}
