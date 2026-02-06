'use client'

import { useCartStore } from '@/stores/cartStore'
import { LicenseType } from '@/types/cart'

// Hook principal pour le panier
export function useCart() {
  return useCartStore()
}

// Hooks spécialisés pour des actions spécifiques - approche optimisée
export function useAddToCart() {
  return useCartStore(state => state.addToCart)
}

export function useRemoveFromCart() {
  return useCartStore(state => state.removeFromCart)
}

export function useUpdateQuantity() {
  return useCartStore(state => state.updateQuantity)
}

export function useClearCart() {
  return useCartStore(state => state.clearCart)
}

export function useToggleCart() {
  return useCartStore(state => state.toggleCart)
}

export function useOpenCart() {
  return useCartStore(state => state.openCart)
}

export function useCloseCart() {
  return useCartStore(state => state.closeCart)
}

// Hooks pour les données
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

// Hook pour les actions multiples - version optimisée sans objet
export function useCartActions() {
  const addToCart = useAddToCart()
  const removeFromCart = useRemoveFromCart()
  const updateQuantity = useUpdateQuantity()
  const clearCart = useClearCart()
  const toggleCart = useToggleCart()
  const openCart = useOpenCart()
  const closeCart = useCloseCart()

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  }
}
