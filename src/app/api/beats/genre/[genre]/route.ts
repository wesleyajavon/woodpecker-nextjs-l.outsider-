import { NextRequest, NextResponse } from 'next/server'
import { BeatService } from '@/services/beatService'

interface RouteParams {
  params: Promise<{
    genre: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { genre } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!genre) {
      return NextResponse.json(
        { error: 'Genre requis' },
        { status: 400 }
      )
    }

    // Validation du paramètre limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limite invalide (1-50)' },
        { status: 400 }
      )
    }

    // Récupération des beats par genre
    const beats = await BeatService.getBeatsByGenre(genre, limit)

    return NextResponse.json({
      success: true,
      data: beats.map((beat) => BeatService.toPublicBeat(beat)),
      genre,
      count: beats.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des beats par genre:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
