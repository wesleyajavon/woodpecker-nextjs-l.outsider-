'use client';

import { motion } from 'framer-motion';
import { BarChart3, Music, ShoppingCart, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { useAdminStats, useAdminActivities } from '@/hooks/queries/useAdminStats';

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  // TanStack Query hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useAdminStats();

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    error: activitiesError
  } = useAdminActivities();

  // Formatage des statistiques
  const formattedStats = stats ? [
    {
      title: t('admin.totalBeats'),
      value: stats.totalBeats.toString(),
      change: `+${stats.beatsChange}%`,
      changeType: 'positive',
      icon: Music,
      color: 'text-blue-400'
    },
    {
      title: t('admin.totalOrders'),
      value: stats.totalOrders.toString(),
      change: `+${stats.ordersChange}%`,
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-green-400'
    },
    {
      title: t('admin.totalRevenue'),
      value: `€${stats.totalRevenue.toLocaleString()}`,
      change: `+${stats.revenueChange}%`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-400'
    },
    {
      title: t('admin.activeVisitors'),
      value: stats.activeVisitors.toString(),
      change: `+${stats.visitorsChange}%`,
      changeType: 'positive',
      icon: Eye,
      color: 'text-orange-400'
    }
  ] : [];

  // Formatage des activités
  const formattedActivities = activities.map(activity => ({
    ...activity,
    action: t(`admin.${activity.action}`),
    time: `${activity.time} ${t('admin.ago')}`
  }));

  // États de chargement et d'erreur
  const isLoading = statsLoading || activitiesLoading;
  const hasError = statsError || activitiesError;

  if (isLoading) {
    return (
      <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8 relative flex items-center justify-center">
        <DottedSurface className="size-full z-0" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 relative z-10"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">Chargement du dashboard...</h3>
            <p className="text-sm text-muted-foreground">Veuillez patienter</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex-1 pt-16 sm:pt-20 pb-8 sm:pb-12 px-3 sm:px-4 lg:px-8 relative flex items-center justify-center">
        <DottedSurface className="size-full z-0" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6 relative z-10"
        >
          <BarChart3 className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-6">
            {statsError instanceof Error ? statsError.message : 
             activitiesError instanceof Error ? activitiesError.message : 
             'Impossible de charger les données du dashboard.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
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

      <div className="max-w-6xl mx-auto py-4 sm:py-8 relative z-10">
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
            <TextRewind text={t('admin.dashboardTitle')} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t('admin.dashboardSubtitle')}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {formattedStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-card/10 backdrop-blur-lg rounded-xl p-6 border border-border/20 hover:border-border/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color === 'text-blue-400' ? 'bg-blue-500/20' : stat.color === 'text-green-400' ? 'bg-green-500/20' : stat.color === 'text-purple-400' ? 'bg-purple-500/20' : 'bg-orange-500/20')}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <span className={cn("text-sm font-medium", stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400')}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recent Activities */}
          <div className="bg-card/10 backdrop-blur-lg rounded-xl p-6 border border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('admin.recentActivity')}</h2>
            </div>
            <div className="space-y-4">
              {formattedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/20 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    activity.type === 'upload' ? 'bg-blue-500/20' :
                      activity.type === 'order' ? 'bg-green-500/20' :
                        'bg-purple-500/20'
                  )}>
                    {activity.type === 'upload' ? (
                      <Music className="w-4 h-4 text-blue-400" />
                    ) : activity.type === 'order' ? (
                      <ShoppingCart className="w-4 h-4 text-green-400" />
                    ) : (
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.beat}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card/10 backdrop-blur-lg rounded-xl p-6 border border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('admin.quickActions')}</h2>
            </div>
            <div className="space-y-3">
              <motion.a
                href="/admin/upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all duration-300"
              >
                <Music className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-foreground">{t('admin.uploadBeat')}</span>
              </motion.a>
              <motion.a
                href="/admin/manage"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t('admin.manageBeats')}</span>
              </motion.a>
              <motion.a
                href="/admin/orders"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t('admin.viewOrders')}</span>
              </motion.a>
              <motion.a
                href="/admin/stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t('admin.detailedAnalytics')}</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
