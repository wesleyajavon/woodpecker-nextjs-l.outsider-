'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Avatar from '@/components/Avatar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PublicPageShell } from '@/components/home/PublicPageShell'
import { PublicPageHeader } from '@/components/home/PublicPageHeader'
import {
  catalogInputClass,
  catalogPanelClass,
} from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation, useLanguage } from '@/contexts/LanguageContext'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({ name: '', image: '' })

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error(t('profile.fetchError'))

      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || '',
        image: data.user.image || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserProfile()
    }
  }, [session, status, fetchUserProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error(t('profile.updateError'))

      const data = await response.json()
      setUser(data.user)
      setSuccess(t('profile.updateSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <ProtectedRoute>
      <PublicPageShell maxWidth="max-w-4xl">
        <PublicPageHeader
          label={t('nav.profile')}
          title={t('profile.title')}
          subtitle={t('profile.description')}
        />

        {loading ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t('profile.loading')}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={cn(catalogPanelClass, 'p-6 text-center sm:p-8')}>
              <div className="mb-6 flex justify-center">
                <Avatar
                  src={user?.image}
                  name={user?.name ?? ''}
                  email={user?.email}
                  size="xl"
                  showName={false}
                />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {user?.name || t('profile.user')}
              </h2>
              <p className="mt-2 text-muted-foreground">{user?.email}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {t('profile.memberSince')}{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : 'en-US',
                    )
                  : 'N/A'}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200"
              >
                {success}
              </div>
            )}

            <div className={cn(catalogPanelClass, 'p-6 sm:p-8')}>
              <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
                {t('profile.editProfile')}
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      {t('profile.displayName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={catalogInputClass}
                      placeholder={t('profile.displayNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium text-foreground">
                      {t('profile.avatarUrl')}
                    </label>
                    <input
                      type="url"
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className={catalogInputClass}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-sm text-muted-foreground">{t('profile.avatarUrlHelp')}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updating}
                    className="h-11 rounded-lg bg-white px-6 text-sm font-medium text-black hover:bg-white/90"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('profile.updating')}
                      </>
                    ) : (
                      t('profile.update')
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div className={cn(catalogPanelClass, 'p-6 sm:p-8')}>
              <h3 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
                {t('profile.accountInformation')}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: t('common.email'), value: user?.email },
                  {
                    label: t('profile.emailVerified'),
                    value: user?.emailVerified ? t('profile.verified') : t('profile.notVerified'),
                  },
                  { label: t('profile.userId'), value: user?.id, mono: true },
                  {
                    label: t('profile.lastUpdated'),
                    value: user?.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                        )
                      : 'N/A',
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
                  >
                    <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {field.label}
                    </dt>
                    <dd
                      className={cn(
                        'mt-2 text-sm text-foreground',
                        field.mono && 'break-all font-mono',
                      )}
                    >
                      {field.value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </PublicPageShell>
    </ProtectedRoute>
  )
}
