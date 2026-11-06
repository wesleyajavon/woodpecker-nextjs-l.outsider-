import { NextResponse } from 'next/server'

/** Closed: order history is available only to the signed-in owner via GET /api/orders/me. */
export async function GET() {
  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
}
