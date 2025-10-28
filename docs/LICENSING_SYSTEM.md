# 🎵 Licensing System Documentation

## Overview

The Woodpecker Beats platform implements a comprehensive three-tier licensing system that allows customers to purchase beats with different usage rights and access levels. Each license type has its own pricing and download permissions.

## 🏷️ License Types

### 1. WAV Lease (€19.99)
**Most Basic License**
- **Price**: €19.99
- **Downloads**: WAV/MP3 master files only
- **Usage Rights**: 
  - Non-exclusive rights
  - Commercial use
  - Streaming
- **Restrictions**: No stems access
- **Target**: Independent artists, demos, personal projects

### 2. Trackout Lease (€39.99)
**Professional License**
- **Price**: €39.99
- **Downloads**: WAV/MP3 master files + Stems
- **Usage Rights**:
  - Non-exclusive rights
  - Commercial use
  - Streaming
  - Limited distribution
- **Restrictions**: Distribution limited to specified terms
- **Target**: Professional artists, commercial releases

### 3. Unlimited Lease (€79.99)
**Premium License**
- **Price**: €79.99
- **Downloads**: WAV/MP3 master files + Stems
- **Usage Rights**:
  - Non-exclusive rights
  - Commercial use
  - Streaming
  - Unlimited distribution
- **Restrictions**: None (within non-exclusive terms)
- **Target**: Major releases, high-budget projects

## 🔧 Technical Implementation

### Database Schema

```prisma
model Beat {
  // Pricing for different license types
  wavLeasePrice      Decimal  @db.Decimal(10, 2) @default(19.99)
  trackoutLeasePrice Decimal  @db.Decimal(10, 2) @default(39.99)
  unlimitedLeasePrice Decimal @db.Decimal(10, 2) @default(79.99)
  
  // Stripe Price IDs for each license type
  stripeWavPriceId      String?
  stripeTrackoutPriceId String?
  stripeUnlimitedPriceId String?
  
  // File URLs
  fullUrl    String?  // Master WAV/MP3
  stemsUrl   String?  // ZIP file containing stems
  artworkUrl String?  // Beat artwork
}

enum LicenseType {
  WAV_LEASE
  TRACKOUT_LEASE
  UNLIMITED_LEASE
  EXCLUSIVE
  CUSTOM
}
```

### Stripe Integration

Each beat automatically creates three Stripe products:
- **Product**: Main beat product
- **Price 1**: WAV Lease price (€19.99)
- **Price 2**: Trackout Lease price (€39.99)
- **Price 3**: Unlimited Lease price (€79.99)

```typescript
// Automatic Stripe product creation
const stripeProducts = await createBeatStripeProducts({
  id: beat.id,
  title: beat.title,
  description: beat.description,
  wavLeasePrice: 19.99,
  trackoutLeasePrice: 39.99,
  unlimitedLeasePrice: 79.99
})
```

## 🎨 User Interface

### License Selection Modal

The `BeatCard` component includes an elegant license selection modal:

```typescript
<BeatCard
  beat={beat}
  isPlaying={isPlaying}
  onPlay={togglePlay}
  onPause={togglePlay}
/>
```

**Features**:
- Animated modal with smooth transitions
- Clear license descriptions
- Price display for each option
- Visual indicators for selected license
- Mobile-responsive design

### Cart Integration

Cart items include license information:

```typescript
interface CartItem {
  beat: Beat
  licenseType: LicenseType
  quantity: number
  addedAt: Date
}
```

**Cart Summary**:
- Dynamic pricing based on selected licenses
- License type indicators
- Total calculations per license
- Clear breakdown of costs

## 🔒 Security & Access Control

### Download Restrictions

The system enforces license-based access:

```typescript
// Stems download API
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check if user has appropriate license
  const hasStemsLicense = await prisma.order.findFirst({
    where: {
      customerEmail: session.user.email,
      beatId: beatId,
      status: { in: ['PAID', 'COMPLETED'] },
      licenseType: { in: ['TRACKOUT_LEASE', 'UNLIMITED_LEASE'] }
    }
  })
  
  if (!hasStemsLicense) {
    return NextResponse.json(
      { error: 'License required for stems download' },
      { status: 403 }
    )
  }
}
```

### License Verification

- **Server-side validation**: All download requests verified
- **Order ownership**: Customer email must match order
- **License type checking**: Stems only for Trackout/Unlimited
- **Time-limited URLs**: Download links expire after 30 minutes

## 📊 Business Logic

### Pricing Strategy

```typescript
const getPriceByLicense = (beat: Beat, licenseType: LicenseType): number => {
  switch (licenseType) {
    case 'WAV_LEASE':
      return beat.wavLeasePrice
    case 'TRACKOUT_LEASE':
      return beat.trackoutLeasePrice
    case 'UNLIMITED_LEASE':
      return beat.unlimitedLeasePrice
    default:
      return beat.wavLeasePrice
  }
}
```

### Usage Rights

```typescript
const getUsageRights = (licenseType: LicenseType): string[] => {
  switch (licenseType) {
    case 'WAV_LEASE':
      return ['Non-exclusive rights', 'Commercial use', 'Streaming']
    case 'TRACKOUT_LEASE':
      return ['Non-exclusive rights', 'Commercial use', 'Streaming', 'Limited distribution']
    case 'UNLIMITED_LEASE':
      return ['Non-exclusive rights', 'Commercial use', 'Streaming', 'Unlimited distribution']
    default:
      return ['Non-exclusive rights', 'Commercial use', 'Streaming']
  }
}
```

## 🚀 API Endpoints

### License Management

| Endpoint | Method | Purpose | Access |
|----------|--------|---------|--------|
| `/api/beats/upload` | POST | Create beat with 3 license prices | Admin |
| `/api/beats/[id]/edit` | PUT | Update beat pricing | Admin |
| `/api/download/beat/[beatId]` | GET | Download master files | All licenses |
| `/api/download/stems/[beatId]` | GET | Download stems | Trackout/Unlimited only |

### Checkout Process

```typescript
// Multi-item checkout with licenses
const response = await fetch('/api/stripe/create-multi-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems.map(item => ({
      priceId: getPriceIdByLicense(item.beat, item.licenseType),
      quantity: item.quantity,
      beatTitle: item.beat.title,
      licenseType: item.licenseType
    }))
  })
})
```

## 🧪 Testing

### Test Scenarios

1. **License Selection**:
   - Test modal opening/closing
   - Verify price updates
   - Check license descriptions

2. **Cart Functionality**:
   - Add beats with different licenses
   - Verify total calculations
   - Test license type display

3. **Checkout Process**:
   - Complete purchase with each license type
   - Verify Stripe integration
   - Check order creation

4. **Download Access**:
   - Test master file downloads (all licenses)
   - Test stems downloads (Trackout/Unlimited only)
   - Verify access restrictions

### Test Data

```typescript
const testBeat = {
  id: 'test-beat-1',
  title: 'Test Beat',
  wavLeasePrice: 19.99,
  trackoutLeasePrice: 39.99,
  unlimitedLeasePrice: 79.99,
  stemsUrl: 'https://cloudinary.com/stems/test-beat.zip'
}
```

## 📈 Analytics & Monitoring

### Key Metrics

- **License Distribution**: Track which licenses are most popular
- **Conversion Rates**: Monitor upgrade from WAV to higher tiers
- **Download Patterns**: Analyze stems vs master downloads
- **Revenue per License**: Track profitability by license type

### Reporting

```typescript
// License analytics
const licenseStats = await prisma.order.groupBy({
  by: ['licenseType'],
  _count: { id: true },
  _sum: { totalAmount: true }
})
```

## 🔄 Migration & Updates

### Existing Beats

For existing beats without license pricing:

```bash
# Run migration script
npm run migrate-stripe-prices
```

This will:
- Create Stripe products for existing beats
- Generate three price points
- Update database with price IDs
- Maintain backward compatibility

### Schema Updates

```sql
-- Add new pricing columns
ALTER TABLE "Beat" ADD COLUMN "wavLeasePrice" DECIMAL(10,2) DEFAULT 19.99;
ALTER TABLE "Beat" ADD COLUMN "trackoutLeasePrice" DECIMAL(10,2) DEFAULT 39.99;
ALTER TABLE "Beat" ADD COLUMN "unlimitedLeasePrice" DECIMAL(10,2) DEFAULT 79.99;

-- Add Stripe price ID columns
ALTER TABLE "Beat" ADD COLUMN "stripeWavPriceId" VARCHAR(255);
ALTER TABLE "Beat" ADD COLUMN "stripeTrackoutPriceId" VARCHAR(255);
ALTER TABLE "Beat" ADD COLUMN "stripeUnlimitedPriceId" VARCHAR(255);
```

## 🚨 Troubleshooting

### Common Issues

1. **Stems Not Downloading**:
   - Check license type in order
   - Verify stemsUrl exists
   - Confirm order status is PAID/COMPLETED

2. **Price Not Updating**:
   - Verify licenseType in cart item
   - Check getPriceByLicense function
   - Ensure Stripe price IDs are set

3. **Modal Not Opening**:
   - Check BeatCard component state
   - Verify event handlers
   - Test on different devices

### Debug Tools

```typescript
// Debug license information
console.log('Cart item:', {
  beatTitle: item.beat.title,
  licenseType: item.licenseType,
  price: getPriceByLicense(item.beat, item.licenseType)
})

// Debug download access
console.log('Download access:', {
  hasStems: !!beat.stemsUrl,
  licenseType: order.licenseType,
  canDownloadStems: ['TRACKOUT_LEASE', 'UNLIMITED_LEASE'].includes(order.licenseType)
})
```

## 📞 Support

For issues with the licensing system:

1. Check this documentation
2. Review error logs
3. Test with different license types
4. Verify Stripe configuration
5. Contact development team

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Development Team
