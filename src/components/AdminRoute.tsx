'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Home } from 'lucide-react'
import { DottedSurface } from './ui/dotted-surface'
import { useTranslation } from '@/hooks/useApp'
import { useCurrentUser } from '@/hooks/useAuthSync'
import { useIsAdmin } from '@/hooks/useUser'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
  const { isAuthenticated, isLoading } = useCurrentUser()
  const isAdmin = useIsAdmin()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
          <DottedSurface />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 relative z-10"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">{t('admin.checkingPermissions')}</h3>
              <p className="text-sm text-muted-foreground">{t('admin.pleaseWait')}</p>
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
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <DottedSurface />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4 relative z-10"
        >
          <div className="bg-card/50 backdrop-blur-lg rounded-2xl border border-border p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6"
            >
              <Shield className="w-8 h-8 text-red-500" />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-foreground">
                {t('admin.accessDenied')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('admin.accessDeniedDescription')}
              </p>
            </motion.div>

            {/* Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
{t('admin.backToHome')}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}








