'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Music, Clock, Tag, ArrowRight } from 'lucide-react'
import { Order, MultiItemOrder } from '@/types/order'
import { Beat } from '@/types/beat'
import { useSession } from 'next-auth/react'
import ResendEmailButton from '@/components/ResendEmailButton'
import { DottedSurface } from '@/components/ui/dotted-surface'
import { Button } from '@/components/ui/Button'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'

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

function SuccessContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)
  const [multiOrderDetails, setMultiOrderDetails] = useState<MultiItemOrder | null>(null)
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls | null>(null)
  const [multiOrderDownloads, setMultiOrderDownloads] = useState<MultiOrderDownloadData | null>(null)
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false)
  const [isMultiItemOrder, setIsMultiItemOrder] = useState(false)

  useEffect(() => {
    if (sessionId) {
      // Try to fetch multi-item order first, then fallback to single order
      const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/lookup/${sessionId}`)
        
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            if (result.type === 'multi-item') {
              setMultiOrderDetails(result.data)
              setIsMultiItemOrder(true)
            } else {
              setOrderDetails(result.data)
              setIsMultiItemOrder(false)
            }
          } else {
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

  const generateDownloadUrls = async () => {
    if (!orderDetails) return

    setIsGeneratingDownload(true)
    try {
      const response = await fetch(`/api/download/beat/${orderDetails.beat.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          customerEmail: orderDetails.customerEmail
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDownloadUrls(result.data.downloadUrls)
        } else {
          console.error('Failed to generate download URLs:', result.error)
        }
      } else {
        console.error('Failed to generate download URLs')
      }
    } catch (error) {
      console.error('Error generating download URLs:', error)
    } finally {
      setIsGeneratingDownload(false)
    }
  }

  const generateMultiOrderDownloadUrls = async () => {
    if (!multiOrderDetails) return

    setIsGeneratingDownload(true)
    try {
      const response = await fetch(`/api/download/multi-order/${multiOrderDetails.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: multiOrderDetails.customerEmail
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMultiOrderDownloads(result.data)
        } else {
          console.error('Failed to generate multi-order download URLs:', result.error)
        }
      } else {
        console.error('Failed to generate multi-order download URLs')
      }
    } catch (error) {
      console.error('Error generating multi-order download URLs:', error)
    } finally {
      setIsGeneratingDownload(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-foreground">{t('success.processing')}</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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

        <div className="max-w-md w-full bg-card/10 backdrop-blur-lg rounded-lg shadow-lg p-8 text-center border border-border/20 relative z-10">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t('success.invalidSession')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('success.noSessionId')}
          </p>
          <Button asChild variant="primary" className="w-full">
            <Link href="/beats">
              {t('success.browseBeats')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!orderDetails && !multiOrderDetails) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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

        <div className="max-w-md w-full bg-card/10 backdrop-blur-lg rounded-lg shadow-lg p-8 text-center border border-border/20 relative z-10">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/20">
              <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Order Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find your order details. This might be because the payment is still processing.
          </p>
          <div className="space-y-3">
            <Link href="/beats" className="w-full">
              <HoverBorderGradient
                containerClassName="rounded-xl md:rounded-2xl w-full"
                className="group inline-flex items-center justify-center gap-2 backdrop-blur-lg px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 border border-border/20 w-full"
                duration={1.5}
                clockwise={true}
              >
                <span>{t('success.browseBeats')}</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </HoverBorderGradient>
            </Link>
            <HoverBorderGradient
              containerClassName="rounded-xl md:rounded-2xl w-full max-w-xs"
              className="group inline-flex items-center justify-center gap-2 backdrop-blur-lg px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 border border-border/20 w-full"
              duration={1.5}
              clockwise={true}
              onClick={() => window.location.reload()}
            >
              <span>{t('success.tryAgain')}</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
            </HoverBorderGradient>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-border/20"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white mb-6"
            >
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              {t('success.title')}
            </h1>

            <p className="text-green-100 text-lg">
              {isMultiItemOrder
                ? t('success.descriptionMulti', { count: (multiOrderDetails?.items.length || 0).toString() })
                : t('success.description')
              }
            </p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            {isMultiItemOrder && multiOrderDetails ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">{t('success.orderDetails')}</h2>

                <div className="bg-card/20 backdrop-blur-lg rounded-xl p-6 mb-6 border border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.orderId')}:</span>
                      <p className="text-foreground font-mono">{multiOrderDetails.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.email')}:</span>
                      <p className="text-foreground">{multiOrderDetails.customerEmail}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.totalAmount')}:</span>
                      <p className="text-foreground text-lg font-semibold">€{multiOrderDetails.totalAmount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.status')}:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        {multiOrderDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beats List */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-semibold text-foreground">{t('success.purchasedBeats')}</h3>
                  {multiOrderDetails.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card/20 backdrop-blur-lg border border-border/20 rounded-xl p-4 hover:shadow-md hover:shadow-primary/10 transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{item.beat.title}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Music className="h-4 w-4 mr-1" />
                              {item.beat.genre}
                            </span>
                            <span>{(item.beat as Beat).bpm} BPM</span>
                            <span>{(item.beat as Beat).key}</span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {(item.beat as Beat).duration}
                            </span>
                            {(item.beat as Beat).isExclusive && (
                              <span className="flex items-center text-primary">
                                <Tag className="h-4 w-4 mr-1" />
                                Exclusive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">€{(item.unitPrice * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">€{item.unitPrice} × {item.quantity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : orderDetails && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">{t('success.orderDetails')}</h2>

                <div className="bg-card/20 backdrop-blur-lg rounded-xl p-6 border border-border/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.orderId')}:</span>
                      <p className="text-foreground font-mono">{orderDetails.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.beat')}:</span>
                      <p className="text-foreground">{orderDetails.beat.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.amount')}:</span>
                      <p className="text-foreground text-lg font-semibold">€{orderDetails.totalAmount}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">{t('success.status')}:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        {orderDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <Download className="w-6 h-6 mr-2" />
                {t('success.downloadBeats')}
              </h3>

              {isMultiItemOrder ? (
                // Multi-item downloads
                !multiOrderDownloads ? (
                  <div className="text-center">
                    <p className="text-primary mb-4">
                      {t('success.generateDownloadLinks')}
                    </p>
                    <Button
                      onClick={generateMultiOrderDownloadUrls}
                      disabled={isGeneratingDownload}
                      variant="primary"
                      className="w-full"
                    >
                      {isGeneratingDownload ? t('success.generating') : t('success.generateDownloadLinksButton')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-primary">
                      {t('success.downloadLinksReady')}
                    </p>
                    <p className="text-primary">
                      {t('success.checkYourEmail')}
                    </p>

                    <div className="space-y-4">
                      {multiOrderDownloads.beats.map((beatDownload, index) => (
                        <motion.div
                          key={beatDownload.beatId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-card/20 backdrop-blur-lg rounded-lg p-4 border border-primary/30"
                        >
                          <h4 className="font-semibold text-foreground mb-3">{beatDownload.beatTitle}</h4>

                          <div className="space-y-2">
                            <Button asChild variant="primary" className="w-full">
                              <a
                                href={beatDownload.downloadUrls.master}
                                download
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {t('success.downloadMaster')}
                              </a>
                            </Button>

                            {/* Afficher le lien stems si disponible */}
                            {beatDownload.downloadUrls.stems && (
                              <Button asChild variant="secondary" className="w-full">
                                <a
                                  href={beatDownload.downloadUrls.stems}
                                  download
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  {t('success.downloadStems')}
                                </a>
                              </Button>
                            )}

                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-xs text-primary/70 text-center">
                      ⏰ {t('success.expiresAt')} {new Date(multiOrderDownloads.expiresAt).toLocaleString('fr-FR')}
                    </p>

                    {multiOrderDetails && (
                      <ResendEmailButton
                        orderId={multiOrderDetails.id}
                        customerEmail={multiOrderDetails.customerEmail}
                        isMultiItem={true}
                        className="mt-4"
                      />
                    )}
                  </div>
                )
              ) : (
                // Single item downloads
                !downloadUrls ? (
                  <div className="text-center">
                    <p className="text-primary mb-4">
                      {t('success.generateDownloadLinks')}
                    </p>
                    <Button
                      onClick={generateDownloadUrls}
                      disabled={isGeneratingDownload}
                      variant="primary"
                      className="w-full"
                    >
                      {isGeneratingDownload ? t('success.generating') : t('success.generateDownloadLinksButton')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-primary">
                      {t('success.downloadLinksReady')}
                    </p>
                    <p className="text-primary">
                      {t('success.checkYourEmail')}
                    </p>

                    <div className="space-y-2">
                      <Button asChild variant="primary" className="w-full">
                        <a
                          href={downloadUrls.master}
                          download
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t('success.downloadMaster')}
                        </a>
                      </Button>

                      {/* Afficher le lien stems si disponible */}
                      {downloadUrls.stems && (
                        <Button asChild variant="secondary" className="w-full">
                          <a
                            href={downloadUrls.stems}
                            download
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t('success.downloadStems')}
                          </a>
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-primary/70 text-center">
                      ⏰ {t('success.expiresAt')} {new Date(downloadUrls.expiresAt).toLocaleString('fr-FR')}
                    </p>

                    {orderDetails && (
                      <ResendEmailButton
                        orderId={orderDetails.id}
                        customerEmail={orderDetails.customerEmail}
                        isMultiItem={false}
                        className="mt-4"
                      />
                    )}
                  </div>
                )
              )}
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-4 ${session ? 'flex-col sm:flex-row' : 'justify-center'}`}>
              <Link href="/beats" className={`${session ? 'flex-1' : 'w-full max-w-xs'}`}>
                <HoverBorderGradient
                  containerClassName="rounded-xl md:rounded-2xl w-full"
                  className="group inline-flex items-center justify-center gap-2 backdrop-blur-lg px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 border border-border/20 w-full"
                  duration={1.5}
                  clockwise={true}
                >
                  <span>{t('success.discoverMoreBeats')}</span>
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </HoverBorderGradient>
              </Link>

              {session && (
                <Link href="/profile" className="flex-1">
                  <HoverBorderGradient
                    containerClassName="rounded-xl md:rounded-2xl w-full"
                    className="group inline-flex items-center justify-center gap-2 backdrop-blur-lg px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 border border-border/20 w-full"
                    duration={1.5}
                    clockwise={true}
                  >
                    <span>{t('success.goToProfile')}</span>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                  </HoverBorderGradient>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
