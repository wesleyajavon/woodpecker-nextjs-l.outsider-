'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import UserMenu from './UserMenu'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useApp'
import { useCurrentUser } from '@/hooks/useAuthSync'

export default function AuthButton({ 
  variant = 'default', 
  onMobileMenuClose 
}: { 
  variant?: 'default' | 'floating' | 'mobile'
  onMobileMenuClose?: () => void
} = {}) {
  const { isAuthenticated, isLoading, user } = useCurrentUser()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <Button 
        disabled 
        className={`transition-all duration-300 ${variant === 'floating' ? 'bg-transparent text-muted-foreground border-none' : 'bg-muted text-muted-foreground'} ${variant === 'mobile' ? 'w-full' : ''}`}
      >
        {t('common.loading')}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Button 
        disabled 
        className={`transition-all duration-300 ${variant === 'floating' ? 'bg-transparent text-muted-foreground border-none' : 'bg-muted text-muted-foreground'} ${variant === 'mobile' ? 'w-full' : ''}`}
      >
        {t('common.loading')}
      </Button>
    )
  }

  if (isAuthenticated && user) {
    if (variant === 'floating') {
      return (
        <div className="flex items-center space-x-2">
          <UserMenu />
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm font-medium relative hover:text-muted-foreground transition-colors px-4 py-2 bg-transparent border-none hover:bg-transparent"
          >
            <span className="relative z-10 text-foreground">{t('auth.signOut')}</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
          </Button>
        </div>
      )
    }
    
    if (variant === 'mobile') {
      return (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-center">
            <UserMenu variant="mobile" onMobileMenuClose={onMobileMenuClose} />
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            className="w-full text-sm transition-all duration-300 border-border text-foreground hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 touch-manipulation"
          >
            {t('auth.signOut')}
          </Button>
        </div>
      )
    }
    
    return (
      <div className="flex items-center space-x-3">
        <UserMenu />
        <Button
          onClick={() => signOut({ callbackUrl: '/' })}
          variant="outline"
          className="text-sm transition-all duration-300 border-border text-foreground hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          {t('auth.signOut')}
        </Button>
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <Button
        onClick={() => window.location.href = '/auth/signin'}
        className="text-sm font-medium relative text-foreground hover:text-muted-foreground transition-colors px-4 py-2 bg-transparent border-none hover:bg-transparent"
      >
        <span className="relative z-10">{t('auth.signIn')}</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
      </Button>
    )
  }

  if (variant === 'mobile') {
    return (
      <Button
        onClick={() => window.location.href = '/auth/signin'}
        variant="outline"
        className="w-full text-sm transition-all duration-300 border-border text-foreground hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 touch-manipulation"
      >
        {t('auth.signIn')}
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => window.location.href = '/auth/signin'}
        variant="outline"
        className="text-sm transition-all duration-300 border-border text-foreground hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        {t('auth.signIn')}
      </Button>
    </div>
  )
}

