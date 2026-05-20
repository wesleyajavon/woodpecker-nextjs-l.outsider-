'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Shield, Home, Loader2 } from 'lucide-react'
import { HomeBackground } from '@/components/home/HomeBackground'
import { Button } from '@/components/ui/Button'
import { catalogPanelClass } from '@/components/catalog/catalog-styles'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useApp'
import { useProfile } from '@/hooks/queries/useUsers'
import { useUserData } from '@/hooks/useUser'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
  const { status } = useSession()
  const { data: profileData, isLoading: profileLoading } = useProfile()
  const storedUser = useUserData()
  const router = useRouter()
  const { t } = useTranslation()
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading' || (isAuthenticated && profileLoading)
  const user = profileData?.user ?? storedUser
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (isLoading) {
    return (
      fallback || (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
          <HomeBackground />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(catalogPanelClass, 'relative z-10 flex flex-col items-center gap-4 p-8 text-center')}
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {t('admin.checkingPermissions')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('admin.pleaseWait')}</p>
            </div>
          </motion.div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
        <HomeBackground />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(catalogPanelClass, 'relative z-10 w-full max-w-md p-8 text-center')}
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5">
            <Shield className="h-7 w-7 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {t('admin.accessDenied')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t('admin.accessDeniedDescription')}
          </p>
          <Button
            onClick={() => router.push('/')}
            className="mt-6 h-11 w-full bg-white text-black hover:bg-white/90"
          >
            <Home className="h-4 w-4" />
            {t('admin.backToHome')}
          </Button>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
