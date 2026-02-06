import { NextRequest, NextResponse } from 'next/server'
import { BeatService } from '@/services/beatService'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getUserIdFromEmail } from '@/lib/userUtils'
import { isUserAdmin } from '@/lib/roleUtils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      )
    }

    const isAdmin = await isUserAdmin(session.user.email)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      )
    }

    const userId = await getUserIdFromEmail(session.user.email)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du beat requis' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const isActive = body?.isActive

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Le champ isActive (boolean) est requis' },
        { status: 400 }
      )
    }

    const updatedBeat = await BeatService.updateBeat(id, { isActive }, userId)

    return NextResponse.json({
      success: true,
      data: updatedBeat,
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut du beat:', error)
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
