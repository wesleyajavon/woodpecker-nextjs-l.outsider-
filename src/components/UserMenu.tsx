'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import Avatar from './Avatar'
import { useTranslation } from '@/hooks/useApp'
import { useCurrentUser } from '@/hooks/useAuthSync'

export default function UserMenu({ 
  variant = 'default', 
  onMobileMenuClose 
}: { 
  variant?: 'default' | 'mobile'
  onMobileMenuClose?: () => void
} = {}) {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useCurrentUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!isAuthenticated || !user) {
    return null
  }

  const menuItems = [
    {
      icon: User,
      label: t('userMenu.profile'),
      onClick: () => {
        router.push('/profile')
        setIsOpen(false)
        if (variant === 'mobile' && onMobileMenuClose) {
          onMobileMenuClose()
        }
      }
    },
    // {
    //   icon: ShoppingBag,
    //   label: 'Mes commandes',
    //   onClick: () => {
    //     router.push('/orders')
    //     setIsOpen(false)
    //     if (variant === 'mobile' && onMobileMenuClose) {
    //       onMobileMenuClose()
    //     }
    //   }
    // },
    // {
    //   icon: Settings,
    //   label: 'Paramètres',
    //   onClick: () => {
    //     router.push('/settings')
    //     setIsOpen(false)
    //     if (variant === 'mobile' && onMobileMenuClose) {
    //       onMobileMenuClose()
    //     }
    //   }
    // },
    {
      icon: LogOut,
      label: t('userMenu.signOut'),
      onClick: () => {
        signOut({ callbackUrl: '/' })
        setIsOpen(false)
        if (variant === 'mobile' && onMobileMenuClose) {
          onMobileMenuClose()
        }
      },
      className: 'text-red-600 hover:text-red-700'
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
      >
        <Avatar
          src={user.image || undefined}
          name={user.name || ''}
          email={user.email || ''}
          size="sm"
          showName={false}
        />
        <span className="text-sm font-medium hidden sm:block transition-colors duration-300 text-gray-700 dark:text-gray-300">
          {user.name || user.email}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: variant === 'mobile' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: variant === 'mobile' ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-[calc(100vh-120px)] overflow-y-auto ${
              variant === 'mobile' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{
              // Ensure menu doesn't overflow viewport
              maxHeight: 'calc(100vh - 120px)',
            }}
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation ${item.className || ''}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



