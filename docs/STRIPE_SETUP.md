# Stripe Integration Setup

This guide will help you set up Stripe integration for your Woodpecker Beats application with the new licensing system and dynamic pricing.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Your Stripe API keys

## Setup Steps

### 1. Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Make sure you're using **Test mode** keys for development

### 2. Environment Variables

Create a `.env.local` file in your project root and add:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**⚠️ Important:** Never commit your secret key to version control!

### 3. Test the Integration

Run the test script to create a sample product:

```bash
pnpm run stripe:create-product
```

This will:
- Create a test beat product called "Test Beat - Midnight Trap"
- Create three prices for different license types:
  - WAV Lease: €19.99
  - Trackout Lease: €39.99
  - Unlimited Lease: €79.99
- Add metadata (genre, BPM, key, duration, license type)
- List all existing products

### 4. What Gets Created

The test script creates:
- **Product**: A beat with metadata
- **Three Prices**: One for each license type (WAV, Trackout, Unlimited)
- **Checkout Session**: Ready for payment processing with license selection

### 5. Available Functions

The Stripe integration provides these helper functions:

- `createBeatStripeProducts()` - Creates a beat product with three license prices
- `createCheckoutSessionWithPriceId()` - Creates checkout session with existing priceId
- `createCheckoutSessionWithLicense()` - Creates checkout session with dynamic pricing
- `listProducts()` - Lists all Stripe products
- `getProduct(productId)` - Retrieves a specific product

### 6. Next Steps

After testing:
1. Create real products for your beats with three license prices
2. Integrate license selection into your frontend
3. Handle webhook events for successful payments
4. Connect payments to your order system
5. Implement license-based download restrictions
6. Test the complete flow with different license types

## Testing

Use Stripe's test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
