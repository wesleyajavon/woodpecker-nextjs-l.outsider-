'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BeatEditCard from '@/components/ui/BeatEditCard';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { useBeat, useUpdateBeat } from '@/hooks/queries/useBeats';

export default function BeatEditPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const beatId = params?.id as string;

    // TanStack Query hooks (includeInactive pour éditer les beats planifiés)
    const {
        data: beatData,
        isLoading: loading,
        error,
        refetch
    } = useBeat(beatId, { includeInactive: true });

    const updateBeatMutation = useUpdateBeat();

    const beat = beatData?.data || null;

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{
        preview: number;
        master: number;
        artwork: number;
        stems: number;
    }>({
        preview: 0,
        master: 0,
        artwork: 0,
        stems: 0
    });
    const [uploadedFiles, setUploadedFiles] = useState<{
        preview?: File;
        master?: File;
        artwork?: File;
        stems?: File;
    }>({});

    // Gestion des fichiers sélectionnés
    const handleFileSelect = (field: 'preview' | 'master' | 'artwork' | 'stems', file: File) => {
        setUploadedFiles(prev => ({ ...prev, [field]: file }));
    };

    // Suppression des fichiers sélectionnés
    const handleRemoveFile = (field: 'preview' | 'master' | 'artwork' | 'stems') => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[field];
            return newFiles;
        });
    };

    // Suppression de l'artwork
    const handleRemoveArtwork = async () => {
        if (!beat) return;

        try {
            setIsUploading(true);
            await updateBeatMutation.mutateAsync({
                id: beatId,
                data: { artworkUrl: null }
            });
            await refetch(); // Refresh data from TanStack Query
        } catch (err) {
            console.error('Erreur lors de la suppression de l\'artwork:', err);
        } finally {
            setIsUploading(false);
        }
    };

    // Gestion des uploads S3
    const handleS3UploadComplete = async (type: 'master' | 'stems', result: { url: string; key: string }) => {
        if (!beat) return;

        const updateData = type === 'master'
            ? { s3MasterUrl: result.url, s3MasterKey: result.key }
            : { s3StemsUrl: result.url, s3StemsKey: result.key };

        try {
            await updateBeatMutation.mutateAsync({
                id: beatId,
                data: updateData
            });
            await refetch(); // Refresh data from TanStack Query
        } catch (err) {
            console.error('Erreur lors de la mise à jour S3:', err);
        }
    };

    const handleS3UploadError = (error: string) => {
        console.error('Erreur S3:', error);
    };

    // Suppression des stems
    const handleRemoveStems = async () => {
        if (!beat) return;

        try {
            setIsUploading(true);
            await updateBeatMutation.mutateAsync({
                id: beatId,
                data: { stemsUrl: null }
            });
            await refetch(); // Refresh data from TanStack Query
        } catch (err) {
            console.error('Erreur lors de la suppression des stems:', err);
        } finally {
            setIsUploading(false);
        }
    };

    // Upload des fichiers
    const handleUpload = async () => {
        if (!beat) return;

        try {
            setIsUploading(true);
            setUploadProgress({ preview: 0, master: 0, artwork: 0, stems: 0 });

            const formData = new FormData();

            // Ajout des fichiers
            if (uploadedFiles.preview) formData.append('preview', uploadedFiles.preview);
            if (uploadedFiles.master) formData.append('master', uploadedFiles.master);
            if (uploadedFiles.artwork) formData.append('artwork', uploadedFiles.artwork);
            if (uploadedFiles.stems) formData.append('stems', uploadedFiles.stems);

            // Simulation du progrès d'upload
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => ({
                    preview: Math.min(prev.preview + 10, 100),
                    master: Math.min(prev.master + 8, 100),
                    artwork: Math.min(prev.artwork + 12, 100),
                    stems: Math.min(prev.stems + 15, 100)
                }));
            }, 200);

            const response = await fetch(`/api/beats/${beatId}/files`, {
                method: 'PUT',
                body: formData
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'upload');
            }

            const result = await response.json();

            if (result.success) {
                await refetch(); // Refresh data from TanStack Query
                setUploadedFiles({});
                setUploadProgress({ preview: 0, master: 0, artwork: 0, stems: 0 });
                router.push(`/admin/beats/${beatId}`);
            }

        } catch (err) {
            console.error('Erreur lors de l\'upload:', err);
        } finally {
            setIsUploading(false);
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
                        <Link href={`/admin/beats/${beatId}`}>
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
                <Link href={`/admin/beats/${beatId}`}>
                    <ArrowLeft className="h-4 w-4" />
                    {t('admin.beatManagement')}
                </Link>
            </Button>

            <PublicPageHeader
                label={t('admin.beatActions')}
                title={t('admin.editFiles')}
                subtitle={t('admin.editFilesDescription')}
            />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <BeatEditCard
                    beat={beat}
                    beatId={beatId}
                    uploadedFiles={uploadedFiles}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                    error={error}
                    onFileSelect={handleFileSelect}
                    onRemoveFile={handleRemoveFile}
                    onS3UploadComplete={handleS3UploadComplete}
                    onS3UploadError={handleS3UploadError}
                    onRemoveArtwork={handleRemoveArtwork}
                    onRemoveStems={handleRemoveStems}
                    onUpload={handleUpload}
                />
            </motion.div>
        </AdminPageShell>
    );
}
