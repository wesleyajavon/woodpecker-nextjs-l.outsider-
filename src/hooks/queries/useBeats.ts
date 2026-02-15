import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Beat } from '@/types/beat'

// Types pour les réponses API
interface BeatsResponse {
  success: boolean
  data: Beat[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BeatResponse {
  success: boolean
  data: Beat
}

// Clés de requête
export const beatKeys = {
  all: ['beats'] as const,
  lists: () => [...beatKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...beatKeys.lists(), filters] as const,
  details: () => [...beatKeys.all, 'detail'] as const,
  detail: (id: string) => [...beatKeys.details(), id] as const,
  featured: () => [...beatKeys.all, 'featured'] as const,
  user: (userId: string) => [...beatKeys.all, 'user', userId] as const,
}

// Hook pour récupérer tous les beats avec pagination et filtres
export function useBeats(filters: {
  page?: number
  limit?: number
  search?: string
  genre?: string
  bpmMin?: number
  bpmMax?: number
  key?: string
  priceMin?: number
  priceMax?: number
  hasStems?: boolean
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'
} = {}) {
  return useQuery({
    queryKey: beatKeys.list(filters),
    queryFn: async (): Promise<BeatsResponse> => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.bpmMin != null) params.append('bpmMin', filters.bpmMin.toString())
      if (filters.bpmMax != null) params.append('bpmMax', filters.bpmMax.toString())
      if (filters.key) params.append('key', filters.key)
      if (filters.priceMin != null) params.append('priceMin', filters.priceMin.toString())
      if (filters.priceMax != null) params.append('priceMax', filters.priceMax.toString())
      if (filters.hasStems) params.append('hasStems', 'true')
      if (filters.sortBy) {
        if (filters.sortBy === 'newest') {
          params.append('sortField', 'createdAt')
          params.append('sortOrder', 'desc')
        } else if (filters.sortBy === 'oldest') {
          params.append('sortField', 'createdAt')
          params.append('sortOrder', 'asc')
        } else if (filters.sortBy === 'price_asc') {
          params.append('sortField', 'price')
          params.append('sortOrder', 'asc')
        } else if (filters.sortBy === 'price_desc') {
          params.append('sortField', 'price')
          params.append('sortOrder', 'desc')
        } else if (filters.sortBy === 'popular') {
          params.append('sortField', 'rating')
          params.append('sortOrder', 'desc')
        }
      }

      const response = await fetch(`/api/beats?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des beats')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour les listes
  })
}

// Hook pour récupérer un beat spécifique
export function useBeat(id: string, options?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: [...beatKeys.detail(id), options?.includeInactive ?? false],
    queryFn: async (): Promise<BeatResponse> => {
      const params = new URLSearchParams()
      if (options?.includeInactive) params.append('includeInactive', 'true')
      const url = params.toString() ? `/api/beats/${id}?${params}` : `/api/beats/${id}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Beat non trouvé')
      }
      return response.json()
    },
    enabled: !!id, // Ne s'exécute que si l'ID est fourni
    staleTime: 5 * 60 * 1000, // 5 minutes pour les détails
  })
}

// Hook pour récupérer les beats en vedette
export function useFeaturedBeats() {
  return useQuery({
    queryKey: beatKeys.featured(),
    queryFn: async (): Promise<BeatsResponse> => {
      const response = await fetch('/api/beats/featured')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des beats en vedette')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes pour les beats en vedette
  })
}

// Hook pour récupérer les beats d'un utilisateur
export function useUserBeats(userId: string) {
  return useQuery({
    queryKey: beatKeys.user(userId),
    queryFn: async (): Promise<BeatsResponse> => {
      const response = await fetch(`/api/beats/user/${userId}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des beats de l\'utilisateur')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook pour créer un nouveau beat
export function useCreateBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (beatData: FormData): Promise<BeatResponse> => {
      const response = await fetch('/api/beats', {
        method: 'POST',
        body: beatData,
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création du beat')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: beatKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beatKeys.featured() })
    },
  })
}

// Hook pour mettre à jour un beat
export function useUpdateBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Beat> }): Promise<BeatResponse> => {
      const response = await fetch(`/api/beats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du beat')
      }
      return response.json()
    },
    onSuccess: (data, variables) => {
      // Mettre à jour le cache directement
      queryClient.setQueryData(beatKeys.detail(variables.id), data)
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: beatKeys.lists() })
    },
  })
}

// Hook pour supprimer un beat
export function useDeleteBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/beats/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du beat')
      }
    },
    onSuccess: (_, id) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: beatKeys.detail(id) })
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: beatKeys.lists() })
      queryClient.invalidateQueries({ queryKey: beatKeys.featured() })
    },
  })
}
