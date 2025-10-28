# 🏗️ Cart System Architecture

## System Overview

The multi-item cart and order system is built with a modern, scalable architecture that supports both single and multi-item purchases while maintaining data consistency and security. The system now includes a comprehensive licensing system with three different contract types and corresponding pricing.

## 🎯 Core Architecture Principles

1. **Separation of Concerns**: Clear separation between UI, business logic, and data layers
2. **Type Safety**: Full TypeScript implementation with strict typing
3. **State Management**: Centralized state with React Context and useReducer
4. **Data Persistence**: localStorage for cart persistence, PostgreSQL for orders
5. **Security**: Server-side validation and secure download URLs
6. **Performance**: Optimized queries and efficient re-renders
7. **Licensing System**: Three-tier licensing with dynamic pricing and access control

## 📁 File Structure

```
src/
├── contexts/
│   └── CartContext.tsx          # Cart state management
├── hooks/
│   └── useCart.ts              # Cart utility hooks
├── components/
│   ├── CartItem.tsx            # Individual cart item display
│   ├── CartSummary.tsx         # Order summary and checkout
│   ├── AddToCartButton.tsx     # Reusable add to cart button
│   ├── BeatCard.tsx            # Beat display with license selection
│   ├── LicenseSelector.tsx     # License selection component
│   └── Navigation.tsx          # Updated with cart functionality
├── types/
│   ├── cart.ts                 # Cart-related type definitions
│   ├── beat.ts                 # Beat type definitions with licensing
│   └── order.ts                # Order type definitions
├── app/
│   ├── cart/
│   │   └── page.tsx            # Cart page
│   ├── cart-test/
│   │   └── page.tsx            # Testing interface
│   ├── success/
│   │   └── page.tsx            # Order success page
│   └── api/
│       ├── stripe/
│       │   ├── create-checkout/
│       │   │   └── route.ts    # Single item checkout
│       │   ├── create-multi-checkout/
│       │   │   └── route.ts    # Multi-item checkout
│       │   └── webhook/
│       │       └── route.ts    # Stripe webhook handler
│       ├── orders/
│       │   └── multi-payment/
│       │       └── [sessionId]/
│       │           └── route.ts # Get multi-item order
│       └── download/
│           ├── beat/
│           │   └── [beatId]/
│           │       └── route.ts # Individual beat download
│           ├── stems/
│           │   └── [beatId]/
│           │       └── route.ts # Stems download (license-restricted)
│           └── multi-order/
│               └── [orderId]/
│                   └── route.ts # Multi-order download generation
└── lib/
    └── stripe.ts               # Stripe integration utilities
```

## 🔄 Data Flow Architecture

### 1. Cart Management Flow

```
User Action → Cart Context → State Update → localStorage → UI Update
     ↓
Component Re-render → Cart Count Update → Navigation Badge
```

### 2. Checkout Flow

```
Cart Items → License Selection → Validation → Stripe Session → Payment → Webhook → Database
     ↓
Success Page → Order Display → Download Generation → File Access (License-based)
```

### 3. Download Flow

```
Download Request → Order Validation → License Verification → Beat Verification → Cloudinary URL → File Download
```

## 🗄️ Database Architecture

### Entity Relationship Diagram

```
User (1) ──→ (N) MultiItemOrder
User (1) ──→ (N) Order
User (1) ──→ (N) Beat

MultiItemOrder (1) ──→ (N) OrderItem
OrderItem (N) ──→ (1) Beat
Order (N) ──→ (1) Beat
```

### Key Relationships

- **User → MultiItemOrder**: One user can have many multi-item orders
- **User → Order**: One user can have many single-item orders
- **MultiItemOrder → OrderItem**: One order can have many items
- **OrderItem → Beat**: Each item references a specific beat
- **Order → Beat**: Single orders reference one beat

## 🎨 UI Architecture

### Component Hierarchy

```
App
├── CartProvider
│   ├── Navigation
│   │   ├── Cart Button
│   │   └── Cart Count Badge
│   ├── Beats Page
│   │   └── BeatCard
│   │       ├── License Selection Modal
│   │       └── AddToCartButton
│   ├── Cart Page
│   │   ├── CartItem (for each item)
│   │   └── CartSummary
│   └── Success Page
│       ├── Order Details
│       └── Download Sections (License-based)
```

### State Management Architecture

```
CartContext (Provider)
├── State (CartState)
│   ├── items: CartItem[]
│   ├── totalItems: number
│   ├── totalPrice: number
│   └── isOpen: boolean
├── Actions (CartActions)
│   ├── addToCart
│   ├── removeFromCart
│   ├── updateQuantity
│   ├── clearCart
│   └── toggleCart
└── Effects
    ├── localStorage sync
    └── real-time updates
```

## 🔌 API Architecture

### RESTful Endpoints

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/stripe/create-checkout` | Single item checkout | `{priceId, beatTitle, successUrl, cancelUrl}` | `{url, sessionId}` |
| POST | `/api/stripe/create-multi-checkout` | Multi-item checkout | `{items[], successUrl, cancelUrl}` | `{url, sessionId}` |
| POST | `/api/stripe/webhook` | Stripe webhook | Stripe event | `{received: true}` |
| GET | `/api/orders/multi-payment/[sessionId]` | Get multi-item order | sessionId | `{success, data}` |
| POST | `/api/download/multi-order/[orderId]` | Generate downloads | `{customerEmail}` | `{success, data}` |
| GET | `/api/download/beat/[beatId]` | Download file | `{orderId, customerEmail, type}` | File stream |
| GET | `/api/download/stems/[beatId]` | Download stems | `{orderId, customerEmail}` | File stream (License-restricted) |

### API Response Patterns

#### Success Response
```typescript
{
  success: true,
  data: T
}
```

#### Error Response
```typescript
{
  success: false,
  error: string
}
```

## 🔒 Security Architecture

### Authentication & Authorization

1. **Order Ownership**: Server validates customer email matches order
2. **Beat Access**: Verify beat is part of the order
3. **Download Security**: Time-limited signed URLs
4. **Input Validation**: All inputs sanitized and validated
5. **License Verification**: Stems access restricted to Trackout/Unlimited licenses

### Data Protection

1. **Client-Side**: Cart data in localStorage (non-sensitive)
2. **Server-Side**: Order data in encrypted database
3. **Transmission**: HTTPS for all API calls
4. **Storage**: Secure file storage with Cloudinary
5. **License Enforcement**: Server-side validation of license types

## ⚡ Performance Architecture

### Optimization Strategies

1. **State Management**
   - useReducer for complex state updates
   - useMemo for expensive calculations
   - useCallback for event handlers

2. **Database**
   - Proper indexing on frequently queried fields
   - Optimized Prisma queries
   - Connection pooling

3. **UI Performance**
   - Lazy loading for heavy components
   - Debounced user inputs
   - Optimistic updates

4. **Caching**
   - localStorage for cart persistence
   - Browser caching for static assets
   - CDN for file downloads

## 🔄 Error Handling Architecture

### Error Boundaries

1. **Component Level**: Try-catch in components
2. **API Level**: Consistent error responses
3. **Global Level**: Error boundaries for React errors

### Error Types

1. **Validation Errors**: 400 Bad Request
2. **Authentication Errors**: 401 Unauthorized
3. **Authorization Errors**: 403 Forbidden
4. **Not Found Errors**: 404 Not Found
5. **Server Errors**: 500 Internal Server Error

### Error Recovery

1. **Retry Mechanisms**: For transient failures
2. **Fallback UI**: When components fail
3. **User Feedback**: Clear error messages
4. **Logging**: Comprehensive error logging

## 🧪 Testing Architecture

### Testing Strategy

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Complete user flow testing
4. **Manual Testing**: Cart-test page for validation

### Test Data

1. **Mock Beats**: Test data for development
2. **Test Orders**: Sample order data
3. **Stripe Test Mode**: Safe payment testing

## 📊 Monitoring Architecture

### Key Metrics

1. **Cart Metrics**
   - Add to cart rate
   - Cart abandonment rate
   - Checkout completion rate

2. **Order Metrics**
   - Order success rate
   - Average order value
   - Payment failure rate

3. **Download Metrics**
   - Download success rate
   - Download completion rate
   - File access patterns

4. **License Metrics**
   - License type distribution
   - Stems download rate
   - License upgrade rate

### Logging Strategy

1. **Client-Side**: Console logging for debugging
2. **Server-Side**: Structured logging for analysis
3. **Error Tracking**: Comprehensive error logging
4. **Performance Monitoring**: Response time tracking

## 🚀 Deployment Architecture

### Environment Configuration

1. **Development**: Local development with test data
2. **Staging**: Production-like environment for testing
3. **Production**: Live environment with real data

### Infrastructure Requirements

1. **Database**: PostgreSQL with proper indexing
2. **File Storage**: Cloudinary for beat files
3. **CDN**: For static asset delivery
4. **Monitoring**: Error tracking and performance monitoring

## 🔄 Maintenance Architecture

### Regular Maintenance

1. **Database Cleanup**: Remove old test data
2. **Log Rotation**: Manage log file sizes
3. **Dependency Updates**: Keep packages current
4. **Security Updates**: Apply security patches

### Monitoring & Alerts

1. **Error Rate Monitoring**: Alert on high error rates
2. **Performance Monitoring**: Alert on slow responses
3. **Database Monitoring**: Alert on connection issues
4. **Payment Monitoring**: Alert on payment failures

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Stateless Design**: No server-side session storage
2. **Database Scaling**: Read replicas for queries
3. **CDN Usage**: Global content delivery
4. **Load Balancing**: Distribute traffic across servers

### Vertical Scaling

1. **Database Optimization**: Query optimization
2. **Caching Strategy**: Reduce database load
3. **Resource Monitoring**: CPU and memory usage
4. **Performance Tuning**: Optimize bottlenecks

---

**Architecture Version**: 2.0.0
**Last Updated**: January 2025
**Maintainer**: Development Team
