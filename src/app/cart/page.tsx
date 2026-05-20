'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, Music, ArrowRight, Loader2 } from 'lucide-react'
import { useCart, useCartActions } from '@/hooks/useCart'
import CartItem from '@/components/CartItem'
import CartSummary from '@/components/CartSummary'
import { Button } from '@/components/ui/Button'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import { catalogPanelClass } from '@/components/catalog/catalog-styles'
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

  const handleCheckout = async () => {
    if (cart.items.length === 0) return

    try {
      setIsCheckingOut(true)

      const items = cart.items.map((item) => ({
        priceId: getPriceIdByLicense(item.beat, item.licenseType) || item.beat.id,
        quantity: item.quantity,
        beatTitle: item.beat.title,
        licenseType: item.licenseType,
        beatId: item.beat.id,
      }))

      const validItems = items.filter((item) => item.priceId)

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
      clearCart()
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(
        `Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <PublicPageShell maxWidth="max-w-[1400px]">
      <PublicPageHeader
        label={t('nav.cart')}
        title={t('cart.title')}
        meta={
          cart.totalItems > 0 ? (
            <span>
              {cart.totalItems}{' '}
              {cart.totalItems === 1 ? t('cart.item') : t('cart.items_plural')}
            </span>
          ) : undefined
        }
      />

      <div className="mb-8">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-white/12 bg-transparent hover:bg-white/[0.04]"
        >
          <Link href="/beats">
            <ArrowLeft className="h-4 w-4" />
            {t('cart.backToBeats')}
          </Link>
        </Button>
      </div>

      {cart.items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-20 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t('cart.empty')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {t('cart.emptyDescription')}
          </p>
          <Button
            asChild
            className="mt-8 h-11 rounded-lg bg-white px-6 text-sm font-medium text-black hover:bg-white/90"
          >
            <Link href="/beats">
              <Music className="h-4 w-4" />
              {t('cart.browseBeat')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="order-2 space-y-4 lg:order-1 lg:col-span-2"
          >
            <div className={cn(catalogPanelClass, 'p-4 sm:p-6')}>
              <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {t('cart.cartItems', { count: String(cart.totalItems) })}
              </h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={`${item.beat.id}-${item.licenseType}`} item={item} />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-1 lg:order-2 lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24">
              <CartSummary onCheckout={handleCheckout} />
            </div>
          </motion.div>
        </div>
      )}

      {isCheckingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className={cn(catalogPanelClass, 'w-full max-w-sm p-6 text-center')}>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">
              {t('cart.processingCheckout')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('cart.processingDescription')}
            </p>
          </div>
        </motion.div>
      )}
    </PublicPageShell>
  )
}
