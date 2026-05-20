'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import { catalogPanelClass } from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'

function AuthErrorContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const error = searchParams?.get('error') ?? null

  const getErrorMessage = (errorCode: string | null): string => {
    switch (errorCode) {
      case 'Configuration':
        return t('auth.errors.configuration')
      case 'AccessDenied':
        return t('auth.errors.accessDenied')
      case 'Verification':
        return t('auth.errors.verification')
      default:
        return t('auth.errors.default')
    }
  }

  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <PublicPageHeader label={t('nav.login')} title={t('auth.errors.title')} />

      <div className={cn(catalogPanelClass, 'mx-auto max-w-md space-y-6 p-8 text-center')}>
        <AlertCircle className="mx-auto h-10 w-10 text-red-300" />
        <p className="text-sm leading-relaxed text-muted-foreground">{getErrorMessage(error)}</p>

        <div className="flex flex-col gap-3">
          <Button asChild className="h-11 bg-white text-black hover:bg-white/90">
            <Link href="/auth/signin">{t('errors.tryAgain')}</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 border-white/12">
            <Link href="/">{t('errors.goHome')}</Link>
          </Button>
        </div>

        {error && (
          <p className="font-mono text-xs text-muted-foreground">
            {t('auth.errors.errorCode')}: {error}
          </p>
        )}
      </div>
    </PublicPageShell>
  )
}

function LoadingFallback() {
  const { t } = useTranslation()
  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <p className="py-20 text-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {t('common.loading')}
      </p>
    </PublicPageShell>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthErrorContent />
    </Suspense>
  )
}
