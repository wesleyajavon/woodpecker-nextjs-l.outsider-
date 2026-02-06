import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Beat } from '@/types/beat'

// Types pour les réponses API admin
interface AdminBeatsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface AdminBeatsResponse {
  success: boolean
  data: Beat[]
  pagination?: AdminBeatsPagination
  error?: string
}

export type AdminBeatsFilters = {
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
  isExclusive?: boolean
  featured?: boolean
  includeInactive?: boolean
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'
}

interface AdminBeatResponse {
  success: boolean
  data: Beat
  error?: string
}

// Clés de requête pour les beats admin
export const adminBeatKeys = {
  all: ['admin', 'beats'] as const,
  lists: () => [...adminBeatKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adminBeatKeys.lists(), filters] as const,
  details: () => [...adminBeatKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminBeatKeys.details(), id] as const,
}

// Map sortBy to API sortField/sortOrder
function getSortParams(sortBy?: AdminBeatsFilters['sortBy']) {
  switch (sortBy) {
    case 'oldest':
      return { sortField: 'createdAt', sortOrder: 'asc' as const }
    case 'price_asc':
      return { sortField: 'price', sortOrder: 'asc' as const }
    case 'price_desc':
      return { sortField: 'price', sortOrder: 'desc' as const }
    case 'popular':
      return { sortField: 'rating', sortOrder: 'desc' as const }
    case 'newest':
    default:
      return { sortField: 'createdAt', sortOrder: 'desc' as const }
  }
}

// Hook pour récupérer tous les beats admin avec filtres et pagination
export function useAdminBeats(filters: AdminBeatsFilters = {}) {
  return useQuery({
    queryKey: adminBeatKeys.list(filters),
    queryFn: async (): Promise<{ data: Beat[]; pagination: AdminBeatsPagination }> => {
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
      if (filters.isExclusive !== undefined) params.append('isExclusive', String(filters.isExclusive))
      if (filters.featured !== undefined) params.append('featured', String(filters.featured))
      if (filters.includeInactive) params.append('includeInactive', 'true')

      const { sortField, sortOrder } = getSortParams(filters.sortBy)
      params.append('sortField', sortField)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/admin/beats?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des beats admin')
      }

      const result: AdminBeatsResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des beats')
      }

      return {
        data: result.data,
        pagination: result.pagination ?? {
          page: 1,
          limit: filters.limit ?? 12,
          total: result.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook pour récupérer un beat admin spécifique
export function useAdminBeat(id: string) {
  return useQuery({
    queryKey: adminBeatKeys.detail(id),
    queryFn: async (): Promise<Beat> => {
      const response = await fetch(`/api/admin/beats/${id}`)
      if (!response.ok) {
        throw new Error('Beat admin non trouvé')
      }
      
      const result: AdminBeatResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Beat admin non trouvé')
      }
      
      return result.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour créer un beat admin
export function useCreateAdminBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (beatData: FormData): Promise<Beat> => {
      const response = await fetch('/api/admin/beats', {
        method: 'POST',
        body: beatData,
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création du beat')
      }
      
      const result: AdminBeatResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création du beat')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: adminBeatKeys.lists() })
    },
  })
}

// Hook pour mettre à jour un beat admin
export function useUpdateAdminBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Beat> }): Promise<Beat> => {
      const response = await fetch(`/api/admin/beats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du beat')
      }
      
      const result: AdminBeatResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du beat')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Mettre à jour le cache directement
      queryClient.setQueryData(adminBeatKeys.detail(variables.id), data)
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: adminBeatKeys.lists() })
    },
  })
}

// Hook pour supprimer un beat admin
export function useDeleteAdminBeat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/admin/beats/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du beat')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression du beat')
      }
    },
    onSuccess: (_, id) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: adminBeatKeys.detail(id) })
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: adminBeatKeys.lists() })
    },
  })
}

// Hook pour basculer le statut d'un beat (actif/inactif)
export function useToggleBeatStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Beat> => {
      const response = await fetch(`/api/admin/beats/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })
      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut')
      }
      
      const result: AdminBeatResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du changement de statut')
      }
      
      return result.data
    },
    onSuccess: (data, variables) => {
      // Mettre à jour le cache directement
      queryClient.setQueryData(adminBeatKeys.detail(variables.id), data)
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: adminBeatKeys.lists() })
    },
  })
}
