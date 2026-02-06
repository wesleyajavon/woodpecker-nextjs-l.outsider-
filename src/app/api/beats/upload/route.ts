import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';
import { BeatService } from '@/services/beatService';
import { CreateBeatInput } from '@/types/beat';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserIdFromEmail } from '@/lib/userUtils';
import { createBeatStripeProducts } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Récupération de l'ID utilisateur
    const userId = await getUserIdFromEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupération des données de la requête
    const formData = await request.formData();
    
    // Récupération des URLs Cloudinary (upload direct)
    const previewUrl = formData.get('previewUrl') as string | null;
    const previewPublicId = formData.get('previewPublicId') as string | null;
    const artworkUrl = formData.get('artworkUrl') as string | null;
    const artworkPublicId = formData.get('artworkPublicId') as string | null;
    
    // Récupération des données S3 (masters et stems)
    const s3MasterUrl = formData.get('s3MasterUrl') as string | null || undefined;
    const s3MasterKey = formData.get('s3MasterKey') as string | null || undefined;
    const s3StemsUrl = formData.get('s3StemsUrl') as string | null || undefined;
    const s3StemsKey = formData.get('s3StemsKey') as string | null || undefined;

    // Validation des données requises
    if (!previewUrl || !previewPublicId) {
      return NextResponse.json({
        error: 'Preview audio requis (upload Cloudinary)'
      }, { status: 400 });
    }

    if (!s3MasterUrl || !s3MasterKey) {
      return NextResponse.json({
        error: 'Master audio requis (upload S3)'
      }, { status: 400 });
    }

    // Préparation des résultats d'upload
    const uploadResults: Record<string, { public_id: string; secure_url: string; resource_type: string; duration?: number }> = {};
    
    // Ajout des données Cloudinary
    uploadResults.preview = {
      public_id: previewPublicId,
      secure_url: previewUrl,
      resource_type: 'video'
    };

    if (artworkUrl && artworkPublicId) {
      uploadResults.artwork = {
        public_id: artworkPublicId,
        secure_url: artworkUrl,
        resource_type: 'image'
      };
    }

    try {
      // Les fichiers sont déjà uploadés directement vers Cloudinary et S3
      // On utilise les URLs et clés fournies
      console.log('Using pre-uploaded files:', {
        preview: uploadResults.preview?.public_id,
        artwork: uploadResults.artwork?.public_id,
        s3Master: s3MasterKey,
        s3Stems: s3StemsKey
      });
    } catch (error) {
      console.error('Erreur lors de la création du beat:', error);
      return NextResponse.json({
        error: 'Erreur lors de la création du beat',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 });
    }

    // Création du beat dans la base de données
    try {
      const beatData: CreateBeatInput = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        genre: formData.get('genre') as string,
        bpm: parseInt(formData.get('bpm') as string),
        key: formData.get('key') as string,
        mode: (formData.get('mode') as string) || 'majeur',
        duration: formData.get('duration') as string,
        wavLeasePrice: parseFloat(formData.get('wavLeasePrice') as string),
        trackoutLeasePrice: parseFloat(formData.get('trackoutLeasePrice') as string),
        unlimitedLeasePrice: parseFloat(formData.get('unlimitedLeasePrice') as string),
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
        previewUrl: uploadResults.preview?.secure_url,
        fullUrl: s3MasterUrl, // URL S3 pour le master
        artworkUrl: uploadResults.artwork?.secure_url,
        stemsUrl: s3StemsUrl, // URL S3 pour les stems
        s3MasterUrl: s3MasterUrl,
        s3MasterKey: s3MasterKey,
        s3StemsUrl: s3StemsUrl,
        s3StemsKey: s3StemsKey,
        isExclusive: formData.get('isExclusive') === 'true',
        featured: formData.get('featured') === 'true'
      };

      const newBeat = await BeatService.createBeat(beatData, userId);

      // Créer les produits Stripe pour ce beat
      try {
        console.log('🎵 Creating Stripe products for new beat...');
        const stripeProducts = await createBeatStripeProducts({
          id: newBeat.id,
          title: newBeat.title,
          description: newBeat.description || null,
          wavLeasePrice: newBeat.wavLeasePrice,
          trackoutLeasePrice: newBeat.trackoutLeasePrice,
          unlimitedLeasePrice: newBeat.unlimitedLeasePrice
        });

        // Mettre à jour le beat avec les priceId Stripe
        const updatedBeat = await BeatService.updateBeat(newBeat.id, {
          stripeWavPriceId: stripeProducts.prices.wav,
          stripeTrackoutPriceId: stripeProducts.prices.trackout,
          stripeUnlimitedPriceId: stripeProducts.prices.unlimited
        });

        console.log('✅ Stripe products created successfully');

        return NextResponse.json({
          success: true,
          message: 'Beat uploadé avec succès et produits Stripe créés',
          data: {
            beat: updatedBeat,
            uploads: uploadResults,
            stripeProducts
          }
        }, { status: 201 });

      } catch (stripeError) {
        console.error('❌ Error creating Stripe products:', stripeError);
        
        // Retourner le beat même si Stripe a échoué
        return NextResponse.json({
          success: true,
          message: 'Beat uploadé avec succès (erreur Stripe - produits à créer manuellement)',
          data: {
            beat: newBeat,
            uploads: uploadResults,
            stripeError: 'Failed to create Stripe products'
          }
        }, { status: 201 });
      }

    } catch (dbError) {
      console.error('Erreur lors de la création du beat:', dbError);
      
      // Nettoyage des fichiers en cas d'erreur de base de données
      for (const result of Object.values(uploadResults)) {
        if (result && result.public_id) {
          try {
            await CloudinaryService.deleteResource(
              result.public_id,
              result.resource_type === 'video' ? 'video' : 'image'
            );
          } catch (cleanupError) {
            console.error('Erreur lors du nettoyage:', cleanupError);
          }
        }
      }

      return NextResponse.json({
        error: 'Échec de la création du beat',
        details: dbError instanceof Error ? dbError.message : 'Erreur inconnue'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur générale lors de l\'upload:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Configuration pour gérer les gros fichiers
export const config = {
  maxDuration: 300, // 5 minutes pour les gros fichiers audio
};
