import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserIdFromEmail } from '@/lib/userUtils';
import { prisma } from '@/lib/prisma';
import { s3Service } from '@/lib/s3-service';

interface RouteParams {
  params: Promise<{
    beatId: string
  }>
}

// GET - Télécharger les stems d'un beat
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { beatId } = await params;

    if (!beatId) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      );
    }

    // Vérification des autorisations (l'utilisateur doit avoir acheté le beat)
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const hasStemsPurchase = await prisma.multiItemOrder.findFirst({
      where: {
        customerEmail: session.user.email,
        status: { in: ['PAID', 'COMPLETED'] },
        items: {
          some: {
            beatId: beatId,
            licenseType: { in: ['TRACKOUT_LEASE', 'UNLIMITED_LEASE'] },
          },
        },
      },
    })

    if (!hasStemsPurchase) {
      return NextResponse.json(
        { error: 'Vous devez avoir acheté ce beat avec une licence Trackout ou Unlimited pour télécharger les stems' },
        { status: 403 }
      );
    }

    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
      select: { s3StemsKey: true, title: true },
    })

    if (!beat?.s3StemsKey) {
      return NextResponse.json(
        { error: 'Stems indisponibles' },
        { status: 404 }
      );
    }

    const downloadUrl = await s3Service.generatePresignedDownloadUrl(beat.s3StemsKey, 30 * 60)

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      beatTitle: beat.title
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement des stems:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
