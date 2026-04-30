import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

/** Stripe requires the raw body to verify the signature */
export const config = {
  api: {
    bodyParser: false,
  },
}

const buffer = async (req: NextApiRequest) => {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${err}`)
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent succeeded:', paymentIntent.id)
      break
    }
    case 'checkout.session.completed': {
      /** Cart checkout is processed in src/app/api/stripe/webhook/route.ts */
      console.log(
        'Legacy pages webhook: checkout.session.completed ignored (use App Router webhook for cart)'
      )
      break
    }
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}
