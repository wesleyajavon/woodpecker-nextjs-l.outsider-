import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isUserAdmin } from '@/lib/roleUtils';
import { BeatService } from '@/services/beatService';
import { attachBeatStems, clearBeatStems } from '@/services/beatStemsService';

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const STEMS_PREFIX_ERROR = 'beats/stems/';

async function authorizeAdminBeat(id: string | undefined): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentification requise' },
      { status: 401 }
    );
  }

  const isAdmin = await isUserAdmin(session.user.email);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Accès admin requis' },
      { status: 403 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: 'ID du beat requis' },
      { status: 400 }
    );
  }

  const existingBeat = await BeatService.getBeatById(id, undefined, false, true);
  if (!existingBeat) {
    return NextResponse.json(
      { error: 'Beat non trouvé' },
      { status: 404 }
    );
  }

  return null;
}

// DELETE - Retirer les stems d'un beat
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const denied = await authorizeAdminBeat(id);
    if (denied) return denied;

    const beat = await clearBeatStems(id);

    return NextResponse.json({
      success: true,
      message: 'Stems supprimés',
      data: beat
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des stems:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Attacher des stems à un beat
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const denied = await authorizeAdminBeat(id);
    if (denied) return denied;

    const body = await request.json();
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    const key = typeof body?.key === 'string' ? body.key.trim() : '';

    if (!url || !key) {
      return NextResponse.json(
        { error: 'url et key sont requis' },
        { status: 400 }
      );
    }

    const beat = await attachBeatStems(id, { url, key });

    return NextResponse.json({
      success: true,
      message: 'Stems mis à jour',
      data: beat
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes(STEMS_PREFIX_ERROR)) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour des stems:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
