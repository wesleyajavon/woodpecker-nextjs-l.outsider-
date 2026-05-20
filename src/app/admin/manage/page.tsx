'use client';

import { motion } from 'framer-motion';
import BeatManager from '@/components/BeatManager';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AdminManagePage() {
  const { t } = useTranslation();

  return (
    <AdminPageShell>
      <PublicPageHeader
        label={t('admin.title')}
        title={t('admin.beats')}
        subtitle={t('admin.beatManagementDescription')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <BeatManager
          onEdit={(beat) => {
            window.location.href = `/admin/beats/${beat.id}`;
          }}
          onDelete={(beatId) => {
            console.log('Beat deleted:', beatId);
          }}
          onToggleStatus={(beatId, isActive) => {
            console.log('Beat status changed:', beatId, isActive);
          }}
        />
      </motion.div>
    </AdminPageShell>
  );
}
