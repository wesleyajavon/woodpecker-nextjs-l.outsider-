'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useTranslation } from '@/contexts/LanguageContext';

interface DownloadStemsButtonProps {
  beatId: string;
  beatTitle: string;
  className?: string;
}

export default function DownloadStemsButton({ 
  beatId, 
  beatTitle, 
  className = '' 
}: DownloadStemsButtonProps) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await fetch(`/api/download/stems/${beatId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('download.downloadError'));
      }

      const data = await response.json();
      
      if (data.success) {
        // Créer un lien de téléchargement temporaire
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${beatTitle}_stems.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.generic');
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
      >
        {isDownloading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
{t('download.downloading')}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Archive className="w-4 h-4" />
{t('download.downloadStems')}
          </div>
        )}
      </Button>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg"
        >
          <p className="text-red-400 text-sm text-center">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
