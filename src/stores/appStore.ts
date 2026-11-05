import { create } from 'zustand'
import { translations } from '@/lib/translations'

export type Language = 'fr' | 'en'

interface AppState {
  language: Language
  sidebarOpen: boolean
  notifications: Notification[]
}

interface AppActions {
  setLanguage: (language: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Fonction pour naviguer dans les objets de traduction
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj) as string || path
}

// Fonction pour remplacer les paramètres dans les traductions
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

export const useAppStore = create<AppState & AppActions>()((set, get) => ({
  language: 'fr',
  sidebarOpen: false,
  notifications: [],

  setLanguage: (language) => {
    set({ language })
  },

  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }))

    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  t: (key: string, params?: Record<string, string | number>) => {
    const { language } = get()
    const translation = translations[language]
    const text = getNestedValue(translation, key)
    return replaceParams(text, params)
  },
}))
