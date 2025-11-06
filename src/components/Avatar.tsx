'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64
}

export default function Avatar({ 
  src, 
  alt, 
  name, 
  email, 
  size = 'md', 
  showName = false, 
  className = '' 
}: AvatarProps) {
  const displayName = name || alt || 'Utilisateur'
  const displayEmail = email || ''

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        {src ? (
          <Image
            src={src}
            alt={displayName}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-sm object-cover`}
            onError={(e) => {
              // Fallback vers l'avatar par défaut en cas d'erreur de chargement
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = parent.querySelector('.avatar-fallback') as HTMLElement
                if (fallback) {
                  fallback.style.display = 'flex'
                }
              }
            }}
          />
        ) : null}
        
        {/* Avatar par défaut (toujours présent mais caché si image disponible) */}
        <div 
          className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center avatar-fallback ${
            src ? 'hidden' : 'flex'
          }`}
        >
          <User className={`${iconSizes[size]} text-white`} />
        </div>
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className={`font-medium text-gray-900 ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'
          }`}>
            {displayName}
          </span>
          {displayEmail && (
            <span className={`text-gray-500 ${
              size === 'sm' ? 'text-xs' : 'text-xs'
            }`}>
              {displayEmail}
            </span>
          )}
        </div>
      )}
    </div>
  )
}












