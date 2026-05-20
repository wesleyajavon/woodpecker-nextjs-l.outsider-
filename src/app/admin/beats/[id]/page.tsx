'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BeatInfoCard from '@/components/ui/BeatInfoCard';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { Beat } from '@/types/beat';
import { useTranslation } from '@/contexts/LanguageContext';
import { useBeat } from '@/hooks/queries/useBeats';

export default function BeatManagementPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const beatId = params?.id as string;

  const { data: beatData, isLoading: loading, error, refetch } = useBeat(beatId, {
    includeInactive: true,
  });

  const beat = beatData?.data || null;

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);
  const [editData, setEditData] = useState<Partial<Beat>>({});

  const handleEditChange = (
    field: keyof Beat,
    value: string | number | boolean | string[] | Date | null,
  ) => {
    if (
      field === 'wavLeasePrice' ||
      field === 'trackoutLeasePrice' ||
      field === 'unlimitedLeasePrice'
    ) {
      return;
    }
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!beat) return;

    try {
      setIsSaving(true);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      await response.json();
      await refetch();
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(beat || {});
    setIsEditing(false);
  };

  const handleToggleFeatured = async (featured: boolean) => {
    if (!beat) return;

    try {
      setIsTogglingFeatured(true);
      const response = await fetch(`/api/beats/${beatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      await refetch();
    } catch (err) {
      console.error('Erreur lors du changement featured:', err);
    } finally {
      setIsTogglingFeatured(false);
    }
  };

  const handleDelete = async () => {
    if (!beat || !confirm('Êtes-vous sûr de vouloir supprimer ce beat ?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/beats/${beatId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      router.push('/admin/manage');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell maxWidth="max-w-4xl">
        <div className="flex min-h-[50vh] flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t('admin.loadingBeat')}
          </p>
        </div>
      </AdminPageShell>
    );
  }

  if (error || !beat) {
    return (
      <AdminPageShell maxWidth="max-w-4xl">
        <div className={cn(catalogPanelClass, 'mx-auto max-w-md p-8 text-center')}>
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-300" />
          <h1 className="text-xl font-semibold text-foreground">{t('admin.beatNotFound')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t('admin.beatNotFoundDescription')}
          </p>
          <Button asChild variant="outline" className="mt-6 border-white/12">
            <Link href="/admin/manage">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.backToManagement')}
            </Link>
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell maxWidth="max-w-4xl">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mb-6 h-9 border-white/12 bg-transparent hover:bg-white/[0.04]"
      >
        <Link href="/admin/manage">
          <ArrowLeft className="h-4 w-4" />
          {t('admin.backToManagement')}
        </Link>
      </Button>

      <PublicPageHeader
        label={t('admin.beatActions')}
        title={t('admin.beatManagement')}
        subtitle={t('admin.beatManagementDescription')}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
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
      </motion.div>
    </AdminPageShell>
  );
}
