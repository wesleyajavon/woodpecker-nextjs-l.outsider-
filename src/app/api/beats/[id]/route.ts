import { NextRequest, NextResponse } from 'next/server';
import { BeatService } from '@/services/beatService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserIdFromEmail } from '@/lib/userUtils';
import { isUserAdmin } from '@/lib/roleUtils';
import { CloudinaryService } from '@/lib/cloudinary';

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - Récupérer un beat par ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      );
    }

    // Admins can request includeInactive to see scheduled beats
    const { searchParams } = new URL(request.url);
    const includeInactiveParam = searchParams.get('includeInactive') === 'true';
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email ? await isUserAdmin(session.user.email) : false;
    const userId = session?.user?.email ? (await getUserIdFromEmail(session.user.email)) ?? undefined : undefined;
    const includeInactive = includeInactiveParam && isAdmin;

    const beat = await BeatService.getBeatById(id, userId, isAdmin, includeInactive);

    if (!beat) {
      return NextResponse.json(
        { error: 'Beat non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: beat
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du beat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un beat
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérification que le beat existe (includeInactive pour permettre l'édition de beats planifiés)
    const existingBeat = await BeatService.getBeatById(id, undefined, false, true);
    if (!existingBeat) {
      return NextResponse.json(
        { error: 'Beat non trouvé' },
        { status: 404 }
      );
    }

    // Mise à jour du beat
    const updatedBeat = await BeatService.updateBeat(id, body);

    return NextResponse.json({
      success: true,
      message: 'Beat mis à jour avec succès',
      data: updatedBeat
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du beat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mise à jour partielle d'un beat
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérification que le beat existe (includeInactive pour permettre l'édition de beats planifiés)
    const existingBeat = await BeatService.getBeatById(id, undefined, false, true);
    if (!existingBeat) {
      return NextResponse.json(
        { error: 'Beat non trouvé' },
        { status: 404 }
      );
    }

    // Si on supprime l'artwork, supprimer aussi le fichier Cloudinary
    if (body.artworkUrl === null && existingBeat.artworkUrl) {
      try {
        const artworkPublicId = extractPublicId(existingBeat.artworkUrl);
        if (artworkPublicId) {
          await CloudinaryService.deleteResource(artworkPublicId, 'image');
        }
      } catch (cloudinaryError) {
        console.error('Erreur lors de la suppression de l\'artwork Cloudinary:', cloudinaryError);
        // On continue même si la suppression Cloudinary échoue
      }
    }

    // Si on supprime les stems, supprimer aussi le fichier Cloudinary
    if (body.stemsUrl === null && existingBeat.stemsUrl) {
      try {
        const stemsPublicId = extractPublicId(existingBeat.stemsUrl);
        if (stemsPublicId) {
          await CloudinaryService.deleteResource(stemsPublicId, 'raw');
        }
      } catch (cloudinaryError) {
        console.error('Erreur lors de la suppression des stems Cloudinary:', cloudinaryError);
        // On continue même si la suppression Cloudinary échoue
      }
    }

    // Mise à jour du beat
    const updatedBeat = await BeatService.updateBeat(id, body);

    return NextResponse.json({
      success: true,
      message: 'Beat mis à jour avec succès',
      data: updatedBeat
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du beat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un beat
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID du beat requis' },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérification que le beat existe (includeInactive pour permettre la suppression de beats planifiés)
    const existingBeat = await BeatService.getBeatById(id, undefined, false, true);
    if (!existingBeat) {
      return NextResponse.json(
        { error: 'Beat non trouvé' },
        { status: 404 }
      );
    }

    // Suppression des fichiers Cloudinary
    try {
      if (existingBeat.previewUrl) {
        const previewPublicId = extractPublicId(existingBeat.previewUrl);
        if (previewPublicId) {
          await CloudinaryService.deleteResource(previewPublicId, 'video');
        }
      }

      if (existingBeat.fullUrl) {
        const masterPublicId = extractPublicId(existingBeat.fullUrl);
        if (masterPublicId) {
          await CloudinaryService.deleteResource(masterPublicId, 'video');
        }
      }

      if (existingBeat.artworkUrl) {
        const artworkPublicId = extractPublicId(existingBeat.artworkUrl);
        if (artworkPublicId) {
          await CloudinaryService.deleteResource(artworkPublicId, 'image');
        }
      }

      if (existingBeat.stemsUrl) {
        const stemsPublicId = extractPublicId(existingBeat.stemsUrl);
        if (stemsPublicId) {
          await CloudinaryService.deleteResource(stemsPublicId, 'raw');
        }
      }


    } catch (cloudinaryError) {
      console.error('Erreur lors de la suppression des fichiers Cloudinary:', cloudinaryError);
      // On continue même si la suppression Cloudinary échoue
    }

    // Suppression du beat de la base de données
    await BeatService.deleteBeat(id);

    return NextResponse.json({
      success: true,
      message: 'Beat supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du beat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour extraire le public ID d'une URL Cloudinary
function extractPublicId(url: string): string | null {
  const match = url.match(/\/v\d+\/(.+)\.(mp3|wav|zip|jpg|jpeg|png|webp)$/);
  return match ? match[1] : null;
}