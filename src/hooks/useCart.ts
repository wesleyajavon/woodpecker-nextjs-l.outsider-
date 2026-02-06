'use client'

import { useMemo } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { LicenseType } from '@/types/cart'

// Nouveau hook useCart qui utilise Zustand (remplace l'ancien)
export function useCart() {
  const cart = useCartStore()
  return cart
}

// Hooks spécialisés pour des actions spécifiques
export function useAddToCart() {
  return useCartStore(state => state.addToCart)
}

export function useRemoveFromCart() {
  return useCartStore(state => state.removeFromCart)
}

export function useUpdateQuantity() {
  return useCartStore(state => state.updateQuantity)
}

export function useCartCount() {
  return useCartStore(state => state.totalItems)
}

export function useCartTotal() {
  return useCartStore(state => state.totalPrice)
}

export function useCartItems() {
  return useCartStore(state => state.items)
}

export function useIsCartOpen() {
  return useCartStore(state => state.isOpen)
}

// Hook optimisé pour les actions - utilise useMemo pour éviter les re-créations
export function useCartActions() {
  const addToCart = useCartStore(state => state.addToCart)
  const removeFromCart = useCartStore(state => state.removeFromCart)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const clearCart = useCartStore(state => state.clearCart)
  const toggleCart = useCartStore(state => state.toggleCart)
  const openCart = useCartStore(state => state.openCart)
  const closeCart = useCartStore(state => state.closeCart)

  return useMemo(() => ({
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  }), [addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart])
}

// Hook pour vérifier si un beat est dans le panier
export function useIsInCart(beatId: string, licenseType: LicenseType) {
  return useCartStore(state => 
    state.items.some(item => 
      item.beat.id === beatId && item.licenseType === licenseType
    )
  )
}

// Hook pour obtenir la quantité d'un beat dans le panier
export function useCartItemQuantity(beatId: string, licenseType: LicenseType) {
  return useCartStore(state => {
    const item = state.items.find(item => 
      item.beat.id === beatId && item.licenseType === licenseType
    )
    return item?.quantity || 0
  })
}
