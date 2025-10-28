# 🛒 Cart System - Quick Reference Guide

## 🚀 Getting Started

### 1. Cart Context Setup
```typescript
// Wrap your app with CartProvider
<CartProvider>
  <YourApp />
</CartProvider>
```

### 2. Using Cart Hooks
```typescript
import { useCart, useAddToCart, useCartCount } from '@/hooks/useCart'

function MyComponent() {
  const { cart, addToCart, removeFromCart } = useCart()
  const cartCount = useCartCount()
  
  return (
    <div>
      <span>Items: {cartCount}</span>
      <button onClick={() => addToCart(beat)}>Add to Cart</button>
    </div>
  )
}
```

## 🎯 Key Components

### AddToCartButton
```typescript
<AddToCartButton
  beat={beat}
  licenseType="WAV_LEASE"
  size="md"
  variant="outline"
  className="custom-class"
/>
```

### CartItem
```typescript
<CartItem item={cartItem} />
```

### CartSummary
```typescript
<CartSummary onCheckout={handleCheckout} />
```

## 🔄 Cart Operations

### Add to Cart
```typescript
const addToCart = useAddToCart()
addToCart(beat, licenseType, quantity) // quantity defaults to 1
```

### Remove from Cart
```typescript
const { removeFromCart } = useCart()
removeFromCart(beatId)
```

### Update Quantity
```typescript
const { updateQuantity } = useCart()
updateQuantity(beatId, newQuantity)
```

### Clear Cart
```typescript
const { clearCart } = useCart()
clearCart()
```

## 📊 Cart State

### Access Cart Data
```typescript
const { cart } = useCart()

// Cart properties
cart.items          // Array of CartItem
cart.totalItems     // Total quantity
cart.totalPrice     // Total price
cart.isOpen         // Cart open state
```

### Cart Item Structure
```typescript
interface CartItem {
  beat: Beat
  licenseType: LicenseType
  quantity: number
  addedAt: Date
}
```

## 🛠️ API Endpoints

### Checkout
```typescript
// Multi-item checkout
const response = await fetch('/api/stripe/create-multi-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems.map(item => ({
      priceId: getPriceIdByLicense(item.beat, item.licenseType),
      quantity: item.quantity,
      beatTitle: item.beat.title,
      licenseType: item.licenseType
    })),
    successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/cart`
  })
})
```

### Get Order
```typescript
// Get multi-item order
const response = await fetch(`/api/orders/multi-payment/${sessionId}`)
const { data } = await response.json()
```

### Generate Downloads
```typescript
// Generate download URLs
const response = await fetch(`/api/download/multi-order/${orderId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerEmail })
})
```

## 🎨 Styling

### Cart Button States
```css
/* Default state */
.add-to-cart-button {
  @apply bg-purple-500 text-white px-4 py-2 rounded-lg;
}

/* Loading state */
.add-to-cart-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Success state */
.add-to-cart-button.success {
  @apply bg-green-500;
}
```

### Cart Count Badge
```css
.cart-count-badge {
  @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
}
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cart Persistence
Cart data is automatically saved to localStorage and restored on page load.

## 🐛 Common Issues

### Cart Not Updating
- Check if CartProvider is wrapping your app
- Verify useCart hook is used correctly
- Check for JavaScript errors in console

### Downloads Not Working
- Verify order ID and customer email
- Check if order exists in database
- Ensure download URLs are properly formatted

### Stripe Checkout Issues
- Verify Stripe price IDs are set
- Check webhook configuration
- Ensure success/cancel URLs are correct

## 📱 Mobile Considerations

### Touch Interactions
- Use appropriate touch targets (min 44px)
- Provide haptic feedback where possible
- Test on actual devices

### Responsive Design
- Cart works on all screen sizes
- Touch-friendly quantity controls
- Mobile-optimized checkout flow

## 🧪 Testing

### Test Cart Functionality
1. Visit `/cart-test`
2. Add multiple beats to cart with different licenses
3. Test quantity updates
4. Test remove functionality
5. Test license selection
6. Test checkout flow

### Test Download Flow
1. Complete a test purchase with different licenses
2. Verify success page loads
3. Test download link generation
4. Verify file downloads work
5. Test stems download (Trackout/Unlimited only)

## 📈 Performance Tips

### Optimize Re-renders
```typescript
// Use memo for expensive components
const CartItem = memo(({ item }) => {
  // Component logic
})

// Use useCallback for event handlers
const handleAddToCart = useCallback((beat) => {
  addToCart(beat)
}, [addToCart])
```

### Optimize Cart Calculations
```typescript
// Memoize expensive calculations
const cartTotal = useMemo(() => {
  return cart.items.reduce((total, item) => {
    const price = getPriceByLicense(item.beat, item.licenseType)
    return total + (price * item.quantity)
  }, 0)
}, [cart.items])
```

## 🔒 Security Notes

- Cart data is stored in localStorage (client-side)
- Order validation happens server-side
- Download URLs expire after 30 minutes
- All API calls validate user permissions
- Stems access restricted to Trackout/Unlimited licenses

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review the full documentation
3. Check browser console for errors
4. Test with `/cart-test` page
5. Contact development team

---

**Quick Reference Version**: 2.0.0
**Last Updated**: January 2025
