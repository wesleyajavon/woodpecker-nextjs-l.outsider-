'use client';

import { motion } from 'framer-motion';
import AdminOrders from '@/components/AdminOrders';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { useTranslation } from '@/contexts/LanguageContext';

export default function AdminOrdersPage() {
  const { t } = useTranslation();

  return (
    <AdminPageShell>
      <PublicPageHeader
        label={t('admin.title')}
        title={t('admin.orders')}
        subtitle={t('admin.ordersDescription')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <AdminOrders />
      </motion.div>
    </AdminPageShell>
  );
}
