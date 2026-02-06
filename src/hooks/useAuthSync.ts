'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/stores/userStore'
import { User } from '@prisma/client'
import { useProfile } from '@/hooks/queries/useUsers'

// Hook pour synchroniser le userStore avec NextAuth (utilisé uniquement par AuthProvider)
// Utilise React Query (useProfile) pour la déduplication automatique des requêtes
export function useAuthSync() {
  const { data: session, status } = useSession()
  const { data: profileData, isLoading: profileLoading } = useProfile()
  const { setUser, setLoading, logout } = useUserStore()

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status === 'unauthenticated') {
      setLoading(false)
      logout()
      return
    }

    if (status === 'authenticated' && session?.user) {
      if (profileLoading) {
        setLoading(true)
        return
      }

      if (profileData?.user) {
        const u = profileData.user
        const user: User = {
          id: u.id || '',
          name: u.name ?? session.user?.name ?? null,
          email: u.email || session.user?.email || '',
          image: u.image ?? session.user?.image ?? null,
          role: u.role || 'USER',
          emailVerified: 'emailVerified' in u && u.emailVerified ? new Date(u.emailVerified as string) : null,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        }
        setUser(user)
      } else {
        const user: User = {
          id: '',
          name: session.user?.name || null,
          email: session.user?.email || '',
          image: session.user?.image || null,
          role: 'USER',
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setUser(user)
      }
      setLoading(false)
    }
  }, [session, status, profileData, profileLoading, setUser, setLoading, logout])

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user,
  }
}

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useUserStore()
  return { isAuthenticated, isLoading, user }
}
