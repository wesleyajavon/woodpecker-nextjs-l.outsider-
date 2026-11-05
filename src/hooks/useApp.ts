'use client'

import { useAppStore } from '@/stores/appStore'
import { useLanguage as useLanguageContext } from '@/contexts/LanguageContext'

// Hook principal pour l'app
export function useApp() {
  return useAppStore()
}

// Le sélecteur écrit dans LanguageContext. Ces hooks lisent cette même source.
export function useLanguage() {
  return useLanguageContext().language
}

export function useSetLanguage() {
  return useLanguageContext().setLanguage
}

export function useTranslation() {
  const { t } = useLanguageContext()
  return { t }
}

// Hooks spécialisés pour la sidebar
export function useSidebar() {
  return useAppStore(state => state.sidebarOpen)
}

export function useToggleSidebar() {
  return useAppStore(state => state.toggleSidebar)
}

export function useSetSidebarOpen() {
  return useAppStore(state => state.setSidebarOpen)
}

// Hooks spécialisés pour les notifications
export function useNotifications() {
  return useAppStore(state => state.notifications)
}

export function useAddNotification() {
  return useAppStore(state => state.addNotification)
}

export function useRemoveNotification() {
  return useAppStore(state => state.removeNotification)
}

export function useClearNotifications() {
  return useAppStore(state => state.clearNotifications)
}

// Hook combiné pour les actions de notification
export function useNotificationActions() {
  const addNotification = useAppStore(state => state.addNotification)
  const removeNotification = useAppStore(state => state.removeNotification)
  const clearNotifications = useAppStore(state => state.clearNotifications)

  return {
    addNotification,
    removeNotification,
    clearNotifications,
  }
}
