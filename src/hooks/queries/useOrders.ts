import { useQuery, useMutation } from '@tanstack/react-query'
import { Order, MultiItemOrder } from '@/types/order'

// Types pour les réponses API
interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
}

interface MultiItemOrdersResponse {
  orders: MultiItemOrder[]
  total: number
  page: number
  limit: number
}

interface OrderResponse {
  order: Order | MultiItemOrder
}

// Clés de requête
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  user: (userId: string) => [...orderKeys.all, 'user', userId] as const,
  multiItem: () => [...orderKeys.all, 'multiItem'] as const,
  multiItemList: (filters: Record<string, unknown>) => [...orderKeys.multiItem(), 'list', filters] as const,
  multiItemDetail: (id: string) => [...orderKeys.multiItem(), 'detail', id] as const,
}

// Hook pour récupérer les commandes d'un utilisateur
export function useUserOrders(userId: string, filters: {
  page?: number
  limit?: number
  status?: string
} = {}) {
  return useQuery({
    queryKey: orderKeys.list({ userId, ...filters }),
    queryFn: async (): Promise<OrdersResponse> => {
      const params = new URLSearchParams()
      params.append('userId', userId)
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook pour récupérer les commandes multi-articles d'un utilisateur
export function useUserMultiItemOrders(userId: string, filters: {
  page?: number
  limit?: number
  status?: string
} = {}) {
  return useQuery({
    queryKey: orderKeys.multiItemList({ userId, ...filters }),
    queryFn: async (): Promise<MultiItemOrdersResponse> => {
      const params = new URLSearchParams()
      params.append('userId', userId)
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/orders/multi-item?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes multi-articles')
      }
      return response.json()
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook pour récupérer une commande spécifique
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async (): Promise<OrderResponse> => {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        throw new Error('Commande non trouvée')
      }
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour récupérer une commande multi-article spécifique
export function useMultiItemOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.multiItemDetail(id),
    queryFn: async (): Promise<OrderResponse> => {
      const response = await fetch(`/api/orders/multi-item/${id}`)
      if (!response.ok) {
        throw new Error('Commande multi-article non trouvée')
      }
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour créer une commande Stripe
export function useCreateStripeCheckout() {
  return useMutation({
    mutationFn: async (data: {
      priceId: string
      beatTitle: string
      successUrl: string
      cancelUrl: string
    }) => {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }
      return response.json()
    },
  })
}

// Hook pour créer une commande multi-article Stripe
export function useCreateMultiItemCheckout() {
  return useMutation({
    mutationFn: async (data: {
      items: Array<{
        beatId: string
        licenseType: string
        quantity: number
      }>
      successUrl: string
      cancelUrl: string
    }) => {
      const response = await fetch('/api/stripe/create-multi-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement multi-article')
      }
      return response.json()
    },
  })
}

// Hook pour récupérer une commande par session Stripe
export function useOrderBySession(sessionId: string) {
  return useQuery({
    queryKey: ['order', 'session', sessionId],
    queryFn: async (): Promise<OrderResponse> => {
      const response = await fetch(`/api/orders/session/${sessionId}`)
      if (!response.ok) {
        throw new Error('Commande non trouvée pour cette session')
      }
      return response.json()
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute pour les sessions
  })
}

// Hook pour récupérer toutes les commandes (admin)
export function useAdminOrders(filters: {
  page?: number
  limit?: number
  status?: string
  type?: 'all' | 'single' | 'multi'
} = {}) {
  return useQuery({
    queryKey: orderKeys.list({ admin: true, ...filters }),
    queryFn: async (): Promise<OrdersResponse> => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes admin')
      }
      return response.json()
    },
    staleTime: 1 * 60 * 1000, // 1 minute pour les commandes admin
  })
}

// Hook pour récupérer toutes les commandes multi-articles (admin)
export function useAdminMultiItemOrders(filters: {
  page?: number
  limit?: number
  status?: string
} = {}) {
  return useQuery({
    queryKey: orderKeys.multiItemList({ admin: true, ...filters }),
    queryFn: async (): Promise<MultiItemOrdersResponse> => {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(`/api/orders/multi?${params}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes multi-articles admin')
      }
      return response.json()
    },
    staleTime: 1 * 60 * 1000, // 1 minute pour les commandes admin
  })
}

// Hook pour récupérer une commande multi-article par session Stripe
export function useMultiItemOrderBySession(sessionId: string) {
  return useQuery({
    queryKey: ['multiItemOrder', 'session', sessionId],
    queryFn: async (): Promise<OrderResponse> => {
      const response = await fetch(`/api/orders/multi-payment/${sessionId}`)
      if (!response.ok) {
        throw new Error('Commande multi-article non trouvée pour cette session')
      }
      return response.json()
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000,
  })
}
