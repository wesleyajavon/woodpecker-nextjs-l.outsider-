import { NextRequest, NextResponse } from 'next/server'
import { BeatService } from '@/services/beatService'
import { BeatFilters, BeatSortOptions } from '@/types/beat'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserIdFromEmail } from '@/lib/userUtils'
import { isUserAdmin } from '@/lib/roleUtils'
import { withRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Vérification du rate limiting pour les lectures
    const rateLimitResult = await withRateLimit(request, 'READ')
    if ('status' in rateLimitResult) {
      return rateLimitResult
    }

    // Récupération de la session utilisateur
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email ? await getUserIdFromEmail(session.user.email) : undefined
    const isAdmin = session?.user?.email ? await isUserAdmin(session.user.email) : false
    
    const { searchParams } = new URL(request.url)
    
    // Récupération des paramètres de requête
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || undefined
    const genre = searchParams.get('genre') || undefined
    const bpmMin = searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined
    const bpmMax = searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined
    const key = searchParams.get('key') || undefined
    const priceMin = searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined
    const priceMax = searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined
    const hasStems = searchParams.get('hasStems') ? searchParams.get('hasStems') === 'true' : undefined
    const isExclusive = searchParams.get('isExclusive') ? searchParams.get('isExclusive') === 'true' : undefined
    const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined
    const sortField = (searchParams.get('sortField') || 'createdAt') as keyof BeatSortOptions['field']
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Validation des paramètres
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Paramètres de pagination invalides' },
        { status: 400 }
      )
    }

    // Construction des filtres
    const filters: BeatFilters = {
      search,
      genre,
      bpmMin,
      bpmMax,
      key,
      priceMin,
      priceMax,
      hasStems,
      isExclusive,
      featured
    }

    // Construction des options de tri
    const sort: BeatSortOptions = {
      field: sortField as 'title' | 'genre' | 'bpm' | 'price' | 'rating' | 'createdAt',
      order: sortOrder
    }

    // Récupération des beats (filtrés par utilisateur seulement si admin)
    const result = await BeatService.getBeats(filters, sort, page, limit, userId || undefined, isAdmin)

    return NextResponse.json({
      success: true,
      data: result.beats,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: page < result.totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des beats:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
