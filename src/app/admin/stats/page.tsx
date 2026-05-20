'use client';

import { motion } from 'framer-motion';
import AdminStats from '@/components/AdminStats';
import AdminStatsGraphics from '@/components/AdminStatsGraphics';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AdminStatsPage() {
  const { t } = useTranslation();

  return (
    <AdminPageShell>
      <PublicPageHeader
        label={t('admin.title')}
        title={t('admin.stats')}
        subtitle={t('admin.statsDescription')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-8"
      >
        <AdminStats />
        <AdminStatsGraphics />
      </motion.div>
    </AdminPageShell>
  );
}
