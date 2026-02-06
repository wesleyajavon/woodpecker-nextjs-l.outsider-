import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
interface User {
  id: string
  name?: string
  email: string
  image?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface UserResponse {
  user: User
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

// Clés de requête
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  session: () => ['session'] as const,
}

// Hook pour récupérer le profil utilisateur actuel
export function useProfile() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async (): Promise<UserResponse> => {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      const json = await response.json()
      return { user: json.user }
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// Hook pour récupérer un utilisateur spécifique (admin seulement)
export function useUserQuery(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async (): Promise<UserResponse> => {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        throw new Error('Utilisateur non trouvé')
      }
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer tous les utilisateurs (admin seulement)
export function useUsers(filters: {
  page?: number
  limit?: number
  search?: string
  role?: 'USER' | 'ADMIN'
} = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)

      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Hook pour mettre à jour le profil utilisateur
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: {
      name?: string
      email?: string
    }): Promise<UserResponse> => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil')
      }
      return response.json()
    },
    onSuccess: (data) => {
      // Mettre à jour le cache du profil
      queryClient.setQueryData(userKeys.profile(), data)
    },
  })
}

// Hook pour mettre à jour le rôle d'un utilisateur (admin seulement)
export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }): Promise<UserResponse> => {
      const response = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du rôle')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Mettre à jour le cache
      queryClient.setQueryData(userKeys.detail(variables.id), data)
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Hook pour supprimer un utilisateur (admin seulement)
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur')
      }
    },
    onSuccess: (_, id) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Hook pour obtenir les statistiques utilisateur (admin seulement)
export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await fetch('/api/users/stats')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}
