'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import {
  catalogInputClass,
  catalogPanelClass,
} from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/contexts/LanguageContext'

export default function SignInPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        setError(t('auth.errorSignIn'))
      } else {
        const session = await getSession()
        if (session) {
          router.push('/')
        } else {
          setError(t('auth.checkEmail'))
        }
      }
    } catch {
      setError(t('auth.errorGeneral'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError('')

    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch {
      setError(t('auth.errorGeneral'))
      setIsLoading(false)
    }
  }

  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <PublicPageHeader
        label={t('nav.login')}
        title={t('auth.welcome')}
        subtitle={t('auth.welcomeSubtitle')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn(catalogPanelClass, 'mx-auto max-w-md p-6 sm:p-8')}
      >
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            variant="outline"
            className="h-11 w-full justify-center gap-3 border-white/12 hover:bg-white/[0.04]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            {t('auth.signInWithGitHub')}
          </Button>

          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            variant="outline"
            className="h-11 w-full justify-center gap-3 border-white/12 hover:bg-white/[0.04]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('auth.signInWithGoogle')}
          </Button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/8" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('auth.orDivider')}
            </span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleEmailSignIn}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t('auth.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={catalogInputClass}
              placeholder="you@email.com"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black hover:bg-white/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('auth.sending')}
              </>
            ) : (
              t('auth.signInWithEmail')
            )}
          </Button>
        </form>
      </motion.div>
    </PublicPageShell>
  )
}
