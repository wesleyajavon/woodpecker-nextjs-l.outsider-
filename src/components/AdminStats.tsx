'use client';

import { motion } from 'framer-motion';
import { Music, ShoppingCart, DollarSign, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useApp';
import { useAdminStats } from '@/hooks/queries/useAdminStats';

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
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center"
          >
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded"></div>
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
      color: 'indigo',
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
    },
    {
      icon: ShoppingCart,
      value: stats.totalOrders,
      label: t('admin.totalOrders'),
      color: 'indigo',
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
    },
    {
      icon: DollarSign,
      value: `${stats.totalRevenue}€`,
      label: t('admin.totalRevenue'),
      color: 'indigo',
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
    },
    {
      icon: Eye,
      value: 342,
      label: t('admin.activeVisitors'),
      color: 'indigo',
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30'
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
          className={`${card.bgColor} backdrop-blur-lg rounded-xl p-6 text-center border ${card.borderColor} hover:scale-105 hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-xl`}
        >
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${card.bgColor} border ${card.borderColor}`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
          </div>
          <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
            {card.value}
          </div>
          <div className="text-gray-300 text-sm">
            {card.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
