'use client'

import { useAuthSync } from '@/hooks/useAuthSync'

// Provider pour synchroniser l'authentification avec le userStore
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Utilise le hook de synchronisation pour maintenir l'état cohérent
  useAuthSync()

  return <>{children}</>
}
