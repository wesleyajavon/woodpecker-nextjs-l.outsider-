'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Check } from 'lucide-react'
import { Beat } from '@/types/beat'
import { LicenseType } from '@/types/cart'
import { useAddToCart } from '@/hooks/useCart'
import { Button } from './ui/Button'
import { useTranslation } from '@/hooks/useApp'

interface AddToCartButtonProps {
  beat: Beat
  licenseType: LicenseType
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary' | undefined
  showIcon?: boolean
  showText?: boolean
}

export default function AddToCartButton({ 
  beat, 
  licenseType,
  className = '', 
  size = 'md',
  variant = 'primary',
  showIcon = true,
  showText = true
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const addToCart = useAddToCart()
  const { t } = useTranslation()

  const handleAddToCart = async () => {
    try {
      setIsLoading(true)
      addToCart(beat, licenseType, 1)
      setIsAdded(true)
      
      // Reset the "added" state after 2 seconds
      setTimeout(() => {
        setIsAdded(false)
      }, 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || isAdded}
      variant={variant}
      className={`${getSizeClasses()} ${className} ${
        isAdded 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : variant === 'primary' 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white' 
            : ''
      } transition-all duration-300`}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="animate-spin rounded-full border-2 border-white border-t-transparent"
          style={{ width: getIconSize().replace('h-', '').replace('w-', ''), height: getIconSize().replace('h-', '').replace('w-', '') }}
        />
      ) : isAdded ? (
        <>
          {showIcon && <Check className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} />}
          {showText && t('cart.added')}
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} />}
          {showText && t('cart.addToCart')}
        </>
      )}
    </Button>
  )
}
