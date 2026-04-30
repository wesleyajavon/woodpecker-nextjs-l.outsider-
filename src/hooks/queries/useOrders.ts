import { useQuery, useMutation } from '@tanstack/react-query'
import { MultiItemOrder } from '@/types/order'

interface MultiItemOrdersResponse {
  orders: MultiItemOrder[]
  total: number
  page: number
  limit: number
}

export const orderKeys = {
  all: ['orders'] as const,
  multiItem: () => [...orderKeys.all, 'multiItem'] as const,
  multiItemList: (filters: Record<string, unknown>) => [...orderKeys.multiItem(), 'list', filters] as const,
}

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
        throw new Error('Erreur lors du chargement des commandes admin')
      }
      return response.json()
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useMultiItemOrderBySession(sessionId: string) {
  return useQuery({
    queryKey: ['multiItemOrder', 'session', sessionId],
    queryFn: async (): Promise<{ success: boolean; data: MultiItemOrder }> => {
      const response = await fetch(`/api/orders/multi-payment/${sessionId}`)
      if (!response.ok) {
        throw new Error('Commande non trouvée pour cette session')
      }
      return response.json()
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000,
  })
}
