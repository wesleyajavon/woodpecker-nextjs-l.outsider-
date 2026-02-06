'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Avatar from '@/components/Avatar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { DottedSurface } from '@/components/ui/dotted-surface'
import { TextRewind } from '@/components/ui/text-rewind'
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
  const _router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  })

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error(t('profile.fetchError'))
      }
      
      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || '',
        image: data.user.image || ''
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(t('profile.updateError'))
      }

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
          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-12 px-2">
            <div className="mb-16 mt-6">
              <TextRewind text={t('profile.title')} />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('profile.description')}
            </p>
          </div>

          <div className="bg-card/10 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-border/20">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-foreground">{t('profile.loading')}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header Section */}
                  <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <Avatar
                    src={user?.image}
                    name={user?.name ?? ''}
                    email={user?.email}
                    size="xl"
                    showName={false}
                  />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user?.name || t('profile.user')}
                </h1>
                <p className="text-lg text-muted-foreground mb-2">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  {t('profile.memberSince')} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Profile Edit Form */}
              <div className="bg-card/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-border/20">
                <h2 className="text-xl font-semibold text-foreground mb-6">{t('profile.editProfile')}</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        {t('profile.displayName')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors placeholder-muted-foreground"
                        placeholder={t('profile.displayNamePlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-foreground mb-2">
                        {t('profile.avatarUrl')}
                      </label>
                      <input
                        type="url"
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors placeholder-muted-foreground"
                        placeholder="https://example.com/avatar.jpg"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t('profile.avatarUrlHelp')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* <Button
                      type="button"
                      variant="outline"
                      onClick={() => _router.back()}
                      className="w-full sm:w-auto text-white"
                    >
                      Annuler
                    </Button> */}
                    <Button
                      type="submit"
                      disabled={updating}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                    >
{updating ? t('profile.updating') : t('profile.update')}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Account Information */}
              <div className="bg-card/10 backdrop-blur-lg border border-border/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {t('profile.accountInformation')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-card/20 rounded-lg p-4 border border-border/10">
                      <dt className="text-sm font-medium text-muted-foreground mb-1">{t('common.email')}</dt>
                      <dd className="text-sm text-foreground break-all">{user?.email}</dd>
                    </div>
                    <div className="bg-card/20 rounded-lg p-4 border border-border/10">
                      <dt className="text-sm font-medium text-muted-foreground mb-1">{t('profile.emailVerified')}</dt>
                      <dd className="text-sm">
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
{t('profile.verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
{t('profile.notVerified')}
                          </span>
                        )}
                      </dd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-card/20 rounded-lg p-4 border border-border/10">
                      <dt className="text-sm font-medium text-muted-foreground mb-1">{t('profile.userId')}</dt>
                      <dd className="text-sm text-foreground font-mono break-all">{user?.id}</dd>
                    </div>
                    <div className="bg-card/20 rounded-lg p-4 border border-border/10">
                      <dt className="text-sm font-medium text-muted-foreground mb-1">{t('profile.lastUpdated')}</dt>
                      <dd className="text-sm text-foreground">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}


