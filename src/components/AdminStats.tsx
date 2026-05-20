'use client';

import { motion } from 'framer-motion';
import { Music, ShoppingCart, DollarSign, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useApp';
import { useAdminStats } from '@/hooks/queries/useAdminStats';
import { catalogCardClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';

export default function AdminStats() {
  const { t } = useTranslation();
  
  // TanStack Query hook
  const {
    data: stats,
    isLoading: loading,
    error
  } = useAdminStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(catalogCardClass, 'p-6 text-center')}
          >
            <div className="animate-pulse">
              <div className="h-8 bg-white/[0.08] rounded mb-2"></div>
              <div className="h-4 bg-white/[0.06] rounded"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-400">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: Music,
      value: stats.totalBeats,
      label: t('admin.totalBeats'),
    },
    {
      icon: ShoppingCart,
      value: stats.totalOrders,
      label: t('admin.totalOrders'),
    },
    {
      icon: DollarSign,
      value: `${stats.totalRevenue}€`,
      label: t('admin.totalRevenue'),
    },
    {
      icon: Users,
      value: stats.uniqueCustomers,
      label: t('admin.uniqueCustomers'),
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(catalogCardClass, 'p-6 text-center')}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full border border-white/10 bg-white/[0.04]">
              <card.icon className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {card.value}
          </div>
          <div className="text-muted-foreground text-sm">
            {card.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
