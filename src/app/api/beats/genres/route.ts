import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { BeatService } from '@/services/beatService'
import { withRateLimit } from '@/lib/rate-limit'
import { isUserAdmin } from '@/lib/roleUtils'
import { getUserIdFromEmail } from '@/lib/userUtils'

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await withRateLimit(request, 'READ')
    if ('status' in rateLimitResult) {
      return rateLimitResult
    }

    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    const isAdmin = email ? await isUserAdmin(email) : false
    const userId = email ? await getUserIdFromEmail(email) : undefined
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    if (includeInactive && !isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      )
    }

    const genres = await BeatService.getGenres(userId || undefined, isAdmin, includeInactive)

    return NextResponse.json({
      success: true,
      data: genres
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des genres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
