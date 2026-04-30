import { NextRequest, NextResponse } from 'next/server'
import { hasCustomerPurchasedBeat } from '@/services/orderService'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get('email')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      )
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email du client requis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Vérification de l'achat
    const hasPurchased = await hasCustomerPurchasedBeat(customerEmail, id)

    return NextResponse.json({
      success: true,
      data: {
        beatId: id,
        customerEmail,
        hasPurchased,
        message: hasPurchased 
          ? 'Ce beat a déjà été acheté par ce client'
          : 'Ce beat n\'a pas encore été acheté par ce client'
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'achat:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
