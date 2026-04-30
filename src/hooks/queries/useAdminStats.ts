import { useQuery } from '@tanstack/react-query'

interface AdminStats {
  totalBeats: number
  totalOrders: number
  totalRevenue: number
  uniqueCustomers: number
}

interface AdminActivity {
  id: number
  action: string
  beat: string
  time: string
  type: 'upload' | 'order' | 'edit' | 'delete'
}

interface AdminStatsResponse {
  data: AdminStats
  success: boolean
  error?: string
}

interface AdminActivitiesResponse {
  data: AdminActivity[]
  success: boolean
  error?: string
}

interface DailyRevenueData {
  date: string
  revenue: number
  formattedDate: string
}

interface DailyRevenueResponse {
  success: boolean
  data: DailyRevenueData[]
  totalRevenue: number
  averageDailyRevenue: number
}

export const adminStatsKeys = {
  all: ['adminStats'] as const,
  stats: () => [...adminStatsKeys.all, 'stats'] as const,
  activities: () => [...adminStatsKeys.all, 'activities'] as const,
  dailyRevenue: (days?: number) => [...adminStatsKeys.all, 'dailyRevenue', days] as const,
}

export function useAdminStats() {
  return useQuery<AdminStats, Error>({
    queryKey: adminStatsKeys.stats(),
    queryFn: async () => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des statistiques admin')
      }
      const result: AdminStatsResponse = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des statistiques admin')
      }
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour les stats admin
  })
}

export function useAdminActivities() {
  return useQuery<AdminActivity[], Error>({
    queryKey: adminStatsKeys.activities(),
    queryFn: async () => {
      const response = await fetch('/api/admin/activities')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des activités admin')
      }
      const result: AdminActivitiesResponse = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des activités admin')
      }
      return result.data
    },
    staleTime: 1 * 60 * 1000, // 1 minute pour les activités
  })
}

export function useAdminDailyRevenue(days: number = 30) {
  return useQuery<DailyRevenueResponse, Error>({
    queryKey: adminStatsKeys.dailyRevenue(days),
    queryFn: async () => {
      const response = await fetch(`/api/admin/revenue-daily?days=${days}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des revenus quotidiens')
      }
      const result: DailyRevenueResponse = await response.json()
      if (!result.success) {
        throw new Error('Erreur lors du chargement des revenus quotidiens')
      }
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes pour les revenus quotidiens
  })
}

