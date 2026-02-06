'use client'

import { useCartStore } from '@/stores/cartStore'
import { LicenseType } from '@/types/cart'

// Hook principal pour le panier avec Zustand
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

export function useCartActions() {
  return useCartStore(state => ({
    addToCart: state.addToCart,
    removeFromCart: state.removeFromCart,
    updateQuantity: state.updateQuantity,
    clearCart: state.clearCart,
    toggleCart: state.toggleCart,
    openCart: state.openCart,
    closeCart: state.closeCart,
  }))
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
