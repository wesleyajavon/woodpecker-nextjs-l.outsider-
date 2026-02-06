'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Music } from 'lucide-react'
import { useCart, useCartActions } from '@/hooks/useCart'
import CartItem from '@/components/CartItem'
import CartSummary from '@/components/CartSummary'
import { Button } from '@/components/ui/Button'
import { DottedSurface } from '@/components/ui/dotted-surface'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { LicenseType } from '@/types/cart'
import { Beat } from '@/types/beat'
import { useTranslation } from '@/contexts/LanguageContext'

export default function CartPage() {
  const cart = useCart()
  const { clearCart } = useCartActions()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { t } = useTranslation()

  // Helper function to get the correct priceId based on license type
  const getPriceIdByLicense = (beat: Beat, licenseType: LicenseType): string | null => {
    switch (licenseType) {
      case 'WAV_LEASE':
        return beat.stripeWavPriceId || null
      case 'TRACKOUT_LEASE':
        return beat.stripeTrackoutPriceId || null
      case 'UNLIMITED_LEASE':
        return beat.stripeUnlimitedPriceId || null
      default:
        return beat.stripeWavPriceId || null
    }
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.items.length === 0) return

    try {
      setIsCheckingOut(true)
      
      // Prepare items for multi-item checkout
      const items = cart.items.map(item => ({
        priceId: getPriceIdByLicense(item.beat, item.licenseType) || item.beat.id,
        quantity: item.quantity,
        beatTitle: item.beat.title,
        licenseType: item.licenseType,
        beatId: item.beat.id, // Ajouter l'ID du beat
      }))

      // Filter out items without valid price IDs
      const validItems = items.filter(item => item.priceId)
      
      if (validItems.length === 0) {
        throw new Error('No valid items found for checkout')
      }

      const response = await fetch('/api/stripe/create-multi-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: validItems,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Clear cart after successful checkout initiation
      clearCart()
      
      // Redirect to Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DottedSurface className="size-full z-0" />
      
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

      {/* Mobile Header */}
      <div className="bg-card/10 backdrop-blur-lg border-b border-border/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/beats">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1 sm:space-x-2 bg-card/20 backdrop-blur-lg border border-border/20 text-foreground hover:bg-card/30 touch-manipulation"
                  style={{ minHeight: '40px' }}
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{t('cart.backToBeats')}</span>
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t('cart.title')}</h1>
                {cart.totalItems > 0 && (
                  <span className="bg-purple-600 text-purple-100 text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full">
                    {cart.totalItems} {cart.totalItems === 1 ? t('cart.item') : t('cart.items_plural')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 relative z-10">
        {cart.items.length === 0 ? (
          // Empty Cart State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 sm:py-8 lg:py-16"
          >
            <div className="max-w-md mx-auto px-3 sm:px-4">
              <div className="bg-card/20 backdrop-blur-lg rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg border border-border/20">
                <ShoppingCart className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">{t('cart.empty')}</h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6 lg:mb-8">
                {t('cart.emptyDescription')}
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <Link href="/beats" className="block">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl touch-manipulation">
                    <Music className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {t('cart.browseBeat')}
                  </Button>
                </Link>
                
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {t('cart.allBeatsDescription')}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Cart with Items
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 sm:space-y-4 lg:space-y-6"
              >
                <div className="bg-card/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 lg:p-6 border border-border/20">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                      {t('cart.cartItems', { count: cart.totalItems })}
                    </h2>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {cart.items.map((item) => (
                      <CartItem key={item.beat.id} item={item} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Cart Summary - Mobile First */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-8">
                <CartSummary onCheckout={handleCheckout} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isCheckingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4"
        >
          <div className="bg-card/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 lg:p-8 text-center border border-border/20 w-full max-w-xs sm:max-w-sm">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-b-2 border-purple-400 mx-auto mb-3 sm:mb-4"></div>
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-2">{t('cart.processingCheckout')}</h3>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">{t('cart.processingDescription')}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
