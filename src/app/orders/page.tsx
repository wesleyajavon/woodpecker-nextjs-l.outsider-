'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  Download,
  Loader2,
  Music,
  Search,
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import { Button } from '@/components/ui/Button'
import {
  catalogInputClass,
  catalogPanelClass,
} from '@/components/catalog/catalog-styles'
import { useMyOrders } from '@/hooks/queries/useOrders'
import { useTranslation, useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import type { LicenseType, MyOrder, MyOrdersSummary, OrderStatus } from '@/types/order'

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'DISPUTED',
]

const DOWNLOADABLE = new Set<OrderStatus>(['PAID', 'COMPLETED'])

interface DownloadUrls {
  master: string
  stems?: string
  expiresAt: string
}

interface BeatDownloadUrls {
  beatId: string
  beatTitle: string
  downloadUrls: DownloadUrls
}

interface OrderDownloads {
  beats: BeatDownloadUrls[]
  expiresAt: string
}

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

function statusClass(status: OrderStatus) {
  if (status === 'PAID' || status === 'COMPLETED') {
    return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200'
  }
  if (status === 'PENDING') {
    return 'border-amber-500/20 bg-amber-500/5 text-amber-200'
  }
  if (status === 'FAILED' || status === 'CANCELLED' || status === 'REFUNDED' || status === 'DISPUTED') {
    return 'border-red-500/20 bg-red-500/5 text-red-200'
  }
  return 'border-white/10 bg-white/[0.03] text-muted-foreground'
}

function OrdersContent() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const locale = language === 'fr' ? 'fr-FR' : 'en-US'
  const { data, isLoading, isError, refetch } = useMyOrders()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [openId, setOpenId] = useState<string | null>(null)
  const [downloads, setDownloads] = useState<Record<string, OrderDownloads | 'loading' | 'error'>>({})

  const orders = data?.orders ?? []
  const summary = data?.summary

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return orders.filter((order) => {
      if (status !== 'ALL' && order.status !== status) return false
      if (!needle) return true
      return order.items.some((item) => item.beat.title.toLowerCase().includes(needle))
    })
  }, [orders, query, status])

  const requestDownloads = async (order: MyOrder) => {
    setDownloads((current) => ({ ...current, [order.id]: 'loading' }))
    try {
      const response = await fetch(`/api/download/multi-order/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: order.customerEmail }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        setDownloads((current) => ({ ...current, [order.id]: 'error' }))
        return
      }
      setDownloads((current) => ({ ...current, [order.id]: result.data }))
    } catch {
      setDownloads((current) => ({ ...current, [order.id]: 'error' }))
    }
  }

  return (
    <PublicPageShell maxWidth="max-w-6xl">
      <PublicPageHeader
        label={t('myOrders.label')}
        title={t('myOrders.title')}
        subtitle={t('myOrders.description')}
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t('myOrders.loading')}
          </p>
        </div>
      ) : isError || !summary ? (
        <div className={cn(catalogPanelClass, 'mx-auto max-w-md space-y-4 p-8 text-center')}>
          <p className="text-sm text-muted-foreground">{t('myOrders.error')}</p>
          <Button
            variant="outline"
            className="h-11 border-white/12"
            onClick={() => refetch()}
          >
            {t('myOrders.retry')}
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyOrders t={t} />
      ) : (
        <div className="space-y-6">
          <SummaryCards summary={summary} locale={locale} t={t} />
          <LicenseBreakdown summary={summary} t={t} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t('myOrders.searchPlaceholder')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('myOrders.searchPlaceholder')}
                className={cn(catalogInputClass, 'pl-9')}
              />
            </label>
            <label className="sm:w-56">
              <span className="sr-only">{t('myOrders.allStatuses')}</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as OrderStatus | 'ALL')}
                className={catalogInputClass}
              >
                <option value="ALL">{t('myOrders.allStatuses')}</option>
                {ORDER_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {t(`myOrders.statuses.${value}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className={cn(catalogPanelClass, 'p-8 text-center text-sm text-muted-foreground')}>
              {t('myOrders.noResults')}
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((order) => {
                const open = openId === order.id
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
                const downloadState = downloads[order.id]
                return (
                  <li key={order.id} className={cn(catalogPanelClass, 'overflow-hidden')}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : order.id)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {new Date(order.createdAt).toLocaleDateString(locale, {
                            dateStyle: 'medium',
                          })}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t('myOrders.items', { count: itemCount })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            statusClass(order.status),
                          )}
                        >
                          {t(`myOrders.statuses.${order.status}`)}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatMoney(order.totalAmount, order.currency, locale)}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                            open && 'rotate-180',
                          )}
                        />
                      </div>
                    </button>

                    {open && (
                      <div className="space-y-3 border-t border-white/8 px-4 py-4 sm:px-5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-4 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{item.beat.title}</p>
                              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Music className="h-3.5 w-3.5" />
                                  {item.beat.genre}
                                </span>
                                <span>{t(`myOrders.licenses.${item.licenseType as LicenseType}`)}</span>
                                <span>
                                  {formatMoney(item.unitPrice, order.currency, locale)} × {item.quantity}
                                </span>
                              </p>
                            </div>
                            <p className="font-medium text-foreground">
                              {formatMoney(item.totalPrice, order.currency, locale)}
                            </p>
                          </div>
                        ))}

                        {DOWNLOADABLE.has(order.status) && (
                          <div className="pt-2">
                            {!downloadState || downloadState === 'error' ? (
                              <div className="space-y-2">
                                {downloadState === 'error' && (
                                  <p className="text-sm text-red-300">{t('myOrders.downloadError')}</p>
                                )}
                                <Button
                                  onClick={() => requestDownloads(order)}
                                  className="h-10 bg-white text-black hover:bg-white/90"
                                >
                                  <Download className="h-4 w-4" />
                                  {t('myOrders.download')}
                                </Button>
                              </div>
                            ) : downloadState === 'loading' ? (
                              <Button disabled className="h-10 bg-white text-black">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('myOrders.downloading')}
                              </Button>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">{t('myOrders.downloadReady')}</p>
                                {downloadState.beats.map((beat) => (
                                  <div
                                    key={beat.beatId}
                                    className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
                                  >
                                    <p className="mb-3 font-medium text-foreground">{beat.beatTitle}</p>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                      <Button asChild className="h-10 bg-white text-black hover:bg-white/90">
                                        <a href={beat.downloadUrls.master}>
                                          <Download className="h-4 w-4" />
                                          {t('myOrders.downloadMaster')}
                                        </a>
                                      </Button>
                                      {beat.downloadUrls.stems && (
                                        <Button asChild variant="outline" className="h-10 border-white/12">
                                          <a href={beat.downloadUrls.stems}>
                                            <Download className="h-4 w-4" />
                                            {t('myOrders.downloadStems')}
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <p className="font-mono text-xs text-muted-foreground">
                                  {t('myOrders.expiresAt')}{' '}
                                  {new Date(downloadState.expiresAt).toLocaleString(locale)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </PublicPageShell>
  )
}

function EmptyOrders({ t }: { t: (key: string) => string }) {
  return (
    <div className={cn(catalogPanelClass, 'mx-auto max-w-lg space-y-4 p-8 text-center')}>
      <p className="text-lg font-semibold text-foreground">{t('myOrders.emptyTitle')}</p>
      <p className="text-sm text-muted-foreground">{t('myOrders.emptyDescription')}</p>
      <Button asChild className="h-11 bg-white text-black hover:bg-white/90">
        <Link href="/beats">{t('myOrders.browseBeats')}</Link>
      </Button>
    </div>
  )
}

function SummaryCards({
  summary,
  locale,
  t,
}: {
  summary: MyOrdersSummary
  locale: string
  t: (key: string) => string
}) {
  const spent =
    summary.currency && summary.totalSpent != null
      ? formatMoney(summary.totalSpent, summary.currency, locale)
      : summary.spentByCurrency
          .map((row) => formatMoney(row.amount, row.currency, locale))
          .join(' · ')

  const cards = [
    { label: t('myOrders.totalSpent'), value: spent || formatMoney(0, 'EUR', locale) },
    {
      label: t('myOrders.paidOrders'),
      value: `${summary.paidCount} / ${summary.orderCount}`,
    },
    { label: t('myOrders.beatsPurchased'), value: String(summary.beatsPurchased) },
    {
      label: t('myOrders.lastOrder'),
      value: summary.lastPaidAt
        ? new Date(summary.lastPaidAt).toLocaleDateString(locale, { dateStyle: 'medium' })
        : t('myOrders.noPaidOrder'),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={cn(catalogPanelClass, 'p-4 sm:p-5')}>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

function LicenseBreakdown({
  summary,
  t,
}: {
  summary: MyOrdersSummary
  t: (key: string) => string
}) {
  const entries = Object.entries(summary.byLicense)
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(catalogPanelClass, 'p-5 sm:p-6')}
    >
      <h2 className="mb-4 text-sm font-medium text-foreground">{t('myOrders.byLicense')}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('myOrders.noLicenses')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {entries.map(([license, count]) => (
            <li
              key={license}
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-foreground"
            >
              {t(`myOrders.licenses.${license}`)}
              <span className="ml-2 font-mono text-xs text-muted-foreground">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  )
}
