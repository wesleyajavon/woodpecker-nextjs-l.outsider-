'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import BeatInfoCard from '@/components/ui/BeatInfoCard';
import { cn } from '@/lib/utils';
import { Beat } from '@/types/beat';
import { useTranslation } from '@/contexts/LanguageContext';
import { useBeat } from '@/hooks/queries/useBeats';

export default function BeatManagementPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const beatId = params?.id as string;

  // TanStack Query hook (includeInactive pour voir les beats planifiés)
  const {
    data: beatData,
    isLoading: loading,
    error,
    refetch
  } = useBeat(beatId, { includeInactive: true });

  const beat = beatData?.data || null;

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);
  const [editData, setEditData] = useState<Partial<Beat>>({});

  // Gestion des modifications
  const handleEditChange = (field: keyof Beat, value: string | number | boolean | string[] | Date | null) => {
    // Exclure les prix des modifications inline
    if (field === 'wavLeasePrice' || field === 'trackoutLeasePrice' || field === 'unlimitedLeasePrice') {
      return;
    }

    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Sauvegarde des modifications
  const handleSave = async () => {
    if (!beat) return;

    try {
      setIsSaving(true);
      // Convertir scheduledReleaseAt (datetime-local) en ISO UTC avant envoi
      const dataToSend: Record<string, unknown> = { ...editData };
      const scheduledRaw = dataToSend.scheduledReleaseAt as Date | string | null | undefined;
      if (typeof scheduledRaw === 'string' && scheduledRaw.trim()) {
        const localDate = new Date(scheduledRaw);
        if (!isNaN(localDate.getTime())) {
          dataToSend.scheduledReleaseAt = localDate.toISOString();
        }
      } else if (scheduledRaw === null || scheduledRaw === '') {
        dataToSend.scheduledReleaseAt = null;
      }

      const response = await fetch(`/api/beats/${beatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      await response.json();
      await refetch(); // Refresh data from TanStack Query
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Annulation des modifications
  const handleCancel = () => {
    setEditData(beat || {});
    setIsEditing(false);
  };

  // Bascule featured (clic sur le badge)
  const handleToggleFeatured = async (featured: boolean) => {
    if (!beat) return;

    try {
      setIsTogglingFeatured(true);
      const response = await fetch(`/api/beats/${beatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await refetch();
    } catch (err) {
      console.error('Erreur lors du changement featured:', err);
    } finally {
      setIsTogglingFeatured(false);
    }
  };

  // Suppression du beat
  const handleDelete = async () => {
    if (!beat || !confirm('Êtes-vous sûr de vouloir supprimer ce beat ?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/beats/${beatId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      router.push('/admin/upload');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <DottedSurface className="size-full z-0" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
              'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
              'blur-[30px]',
            )}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">{t('admin.loadingBeat')}</p>
        </motion.div>
      </div>
    );
  }

  if (error || !beat) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <DottedSurface className="size-full z-0" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
              'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
              'blur-[30px]',
            )}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6 relative z-10"
        >
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('admin.beatNotFound')}</h1>
          <p className="text-muted-foreground mb-6">{error instanceof Error ? error.message : error || t('admin.beatNotFoundDescription')}</p>
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-lg hover:bg-card/30 text-foreground px-6 py-3 rounded-lg transition-all duration-300 border border-border/20 hover:border-border/30"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('admin.backToManagement')}
          </Link>
        </motion.div>
      </div>

    );
  }

  return (
    <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8 relative">
      <DottedSurface className="size-full z-0" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
      </div>

      <div className="max-w-4xl mx-auto py-4 sm:py-8 relative z-10">
        {/* Back to management */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/admin/manage"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">{t('admin.backToManagement')}</span>
          </Link>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 px-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 mt-6"
          >
            <TextRewind text={t('admin.beatManagement')} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t('admin.beatManagementDescription')}
          </motion.p>
        </motion.div>

        {/* Beat Info Card */}
        <BeatInfoCard
          beat={beat}
          isEditing={isEditing}
          editData={editData}
          onEditChange={handleEditChange}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onEditFiles={() => router.push(`/admin/beats/${beatId}/edit`)}
          onStartEdit={() => setIsEditing(true)}
          onToggleFeatured={handleToggleFeatured}
          isSaving={isSaving}
          isDeleting={isDeleting}
          isTogglingFeatured={isTogglingFeatured}
        />
      </div>
    </div>

  );
}
