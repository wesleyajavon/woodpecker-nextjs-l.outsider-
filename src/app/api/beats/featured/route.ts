import { NextRequest, NextResponse } from 'next/server'
import { BeatService } from '@/services/beatService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    // Validation du paramètre limit
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Limite invalide (1-20)' },
        { status: 400 }
      )
    }

    // Récupération des beats en vedette
    const featuredBeats = await BeatService.getFeaturedBeats(limit)

    return NextResponse.json({
      success: true,
      data: featuredBeats.map((beat) => BeatService.toPublicBeat(beat)),
      count: featuredBeats.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des beats en vedette:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
