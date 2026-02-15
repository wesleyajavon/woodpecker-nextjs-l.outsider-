import { NextRequest, NextResponse } from 'next/server';
import { BeatService } from '@/services/beatService';

/**
 * Cron job: active les beats dont la date de publication planifiée est dépassée.
 * Configuré dans vercel.json (toutes les 5 min en production).
 * Sécurisé par CRON_SECRET - Vercel envoie Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activatedCount = await BeatService.activateScheduledBeats();
    return NextResponse.json({
      success: true,
      activatedCount,
      message: `${activatedCount} beat(s) activé(s)`
    });
  } catch (error) {
    console.error('Erreur cron activate-scheduled-beats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation des beats planifiés' },
      { status: 500 }
    );
  }
}
