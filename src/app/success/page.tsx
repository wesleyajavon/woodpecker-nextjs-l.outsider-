'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Music, Clock, Tag, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { MultiItemOrder } from '@/types/order'
import { Beat } from '@/types/beat'
import { useSession } from 'next-auth/react'
import ResendEmailButton from '@/components/ResendEmailButton'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import { Button } from '@/components/ui/Button'
import { catalogPanelClass } from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation, useLanguage } from '@/contexts/LanguageContext'

interface DownloadUrls {
  master: string
  stems?: string
  expiresAt: string
}

interface BeatDownloadUrls {
  beatId: string
  beatTitle: string
  downloadUrls: DownloadUrls
  hasStems?: boolean
}

interface MultiOrderDownloadData {
  orderId: string
  customerEmail: string
  beats: BeatDownloadUrls[]
  expiresAt: string
}

function LoadingBlock({ message }: { message: string }) {
  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-20">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {message}
        </p>
      </div>
    </PublicPageShell>
  )
}

function SuccessContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<MultiItemOrder | null>(null)
  const [multiOrderDownloads, setMultiOrderDownloads] = useState<MultiOrderDownloadData | null>(null)
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false)

  useEffect(() => {
    if (sessionId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await fetch(`/api/orders/lookup/${sessionId}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.type === 'multi-item') {
              setOrderDetails(result.data)
            } else if (!result.success) {
              console.error('Failed to fetch order:', result.error)
            }
          } else {
            console.error('Failed to fetch order details')
          }
        } catch (error) {
          console.error('Error fetching order details:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchOrderDetails()
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  const generateMultiOrderDownloadUrls = async () => {
    if (!orderDetails) return
    setIsGeneratingDownload(true)
    try {
      const response = await fetch(`/api/download/multi-order/${orderDetails.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: orderDetails.customerEmail }),
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) setMultiOrderDownloads(result.data)
      }
    } catch (error) {
      console.error('Error generating multi-order download URLs:', error)
    } finally {
      setIsGeneratingDownload(false)
    }
  }

  if (isLoading) return <LoadingBlock message={t('success.processing')} />

  if (!sessionId) {
    return (
      <PublicPageShell maxWidth="max-w-4xl">
        <PublicPageHeader label={t('nav.beats')} title={t('success.invalidSession')} />
        <div className={cn(catalogPanelClass, 'mx-auto max-w-md p-8 text-center')}>
          <p className="mb-6 text-sm text-muted-foreground">{t('success.noSessionId')}</p>
          <Button asChild className="h-11 bg-white text-black hover:bg-white/90">
            <Link href="/beats">{t('success.browseBeats')}</Link>
          </Button>
        </div>
      </PublicPageShell>
    )
  }

  if (!orderDetails) {
    return (
      <PublicPageShell maxWidth="max-w-4xl">
        <PublicPageHeader label={t('nav.beats')} title={t('success.orderNotFound')} />
        <div className={cn(catalogPanelClass, 'mx-auto max-w-md space-y-4 p-8 text-center')}>
          <p className="text-sm text-muted-foreground">{t('success.orderNotFoundDescription')}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="h-11 bg-white text-black hover:bg-white/90">
              <Link href="/beats">
                {t('success.browseBeats')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 border-white/12"
              onClick={() => window.location.reload()}
            >
              {t('success.tryAgain')}
            </Button>
          </div>
        </div>
      </PublicPageShell>
    )
  }

  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <PublicPageHeader
        label={t('success.subtitle')}
        title={t('success.title')}
        subtitle={t('success.descriptionMulti', {
          count: String(orderDetails.items.length),
        })}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(catalogPanelClass, 'mb-6 flex items-center gap-4 p-5')}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" />
        </div>
        <p className="text-sm text-muted-foreground">{t('success.checkYourEmail')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn(catalogPanelClass, 'mb-6 p-6 sm:p-8')}
      >
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
          {t('success.orderDetails')}
        </h2>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('success.orderId')}
            </dt>
            <dd className="mt-1 font-mono text-foreground">{orderDetails.id}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('success.email')}
            </dt>
            <dd className="mt-1 text-foreground">{orderDetails.customerEmail}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('success.totalAmount')}
            </dt>
            <dd className="mt-1 text-lg font-semibold text-foreground">
              €{orderDetails.totalAmount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('success.status')}
            </dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                {orderDetails.status}
              </span>
            </dd>
          </div>
        </dl>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className={cn(catalogPanelClass, 'mb-6 p-6 sm:p-8')}
      >
        <h3 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          {t('success.purchasedBeats')}
        </h3>
        <div className="space-y-4">
          {orderDetails.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h4 className="font-semibold text-foreground">{item.beat.title}</h4>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Music className="h-3.5 w-3.5" />
                      {item.beat.genre}
                    </span>
                    <span>{(item.beat as Beat).bpm} BPM</span>
                    <span>{(item.beat as Beat).key}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {(item.beat as Beat).duration}
                    </span>
                    {(item.beat as Beat).isExclusive && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {t('beatCard.exclusive')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-foreground">
                    €{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    €{item.unitPrice} × {item.quantity}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className={cn(catalogPanelClass, 'mb-8 p-6 sm:p-8')}
      >
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <Download className="h-5 w-5 text-muted-foreground" />
          {t('success.downloadBeats')}
        </h3>

        {!multiOrderDownloads ? (
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              {t('success.generateDownloadLinks')}
            </p>
            <Button
              onClick={generateMultiOrderDownloadUrls}
              disabled={isGeneratingDownload}
              className="h-11 w-full bg-white text-black hover:bg-white/90 sm:w-auto sm:min-w-[240px]"
            >
              {isGeneratingDownload ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('success.generating')}
                </>
              ) : (
                t('success.generateDownloadLinksButton')
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{t('success.downloadLinksReady')}</p>
            <div className="space-y-4">
              {multiOrderDownloads.beats.map((beatDownload, index) => (
                <motion.div
                  key={beatDownload.beatId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
                >
                  <h4 className="mb-3 font-medium text-foreground">{beatDownload.beatTitle}</h4>
                  <div className="space-y-2">
                    <Button asChild className="h-10 w-full bg-white text-black hover:bg-white/90">
                      <a href={beatDownload.downloadUrls.master} download>
                        <Download className="mr-2 h-4 w-4" />
                        {t('success.downloadMaster')}
                      </a>
                    </Button>
                    {beatDownload.downloadUrls.stems && (
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 w-full border-white/12"
                      >
                        <a href={beatDownload.downloadUrls.stems} download>
                          <Download className="mr-2 h-4 w-4" />
                          {t('success.downloadStems')}
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center font-mono text-xs text-muted-foreground">
              {t('success.expiresAt')}{' '}
              {new Date(multiOrderDownloads.expiresAt).toLocaleString(
                language === 'fr' ? 'fr-FR' : 'en-US',
              )}
            </p>
            <ResendEmailButton
              orderId={orderDetails.id}
              customerEmail={orderDetails.customerEmail}
              className="mt-4"
            />
          </div>
        )}
      </motion.div>

      <div className={cn('flex gap-3', session ? 'flex-col sm:flex-row' : 'justify-center')}>
        <Button
          asChild
          className={cn(
            'h-11 bg-white text-black hover:bg-white/90',
            session ? 'flex-1' : 'w-full max-w-xs',
          )}
        >
          <Link href="/beats">
            {t('success.discoverMoreBeats')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {session && (
          <Button
            asChild
            variant="outline"
            className="h-11 flex-1 border-white/12 hover:bg-white/[0.04]"
          >
            <Link href="/profile">{t('success.goToProfile')}</Link>
          </Button>
        )}
      </div>
    </PublicPageShell>
  )
}

export default function SuccessPage() {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<LoadingBlock message={t('success.processing')} />}>
      <SuccessContent />
    </Suspense>
  )
}
