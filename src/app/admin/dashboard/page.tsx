'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, Calendar, Music, Package, ShoppingCart, TrendingUp, DollarSign, Users } from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminStats } from '@/hooks/queries/useAdminStats';
import { useAdminMultiItemOrders } from '@/hooks/queries/useOrders';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();

  // TanStack Query hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useAdminStats();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError
  } = useAdminMultiItemOrders({ limit: 5 });

  // Formatage des statistiques
  const formattedStats = stats ? [
    {
      title: t('admin.totalBeats'),
      value: stats.totalBeats.toString(),
      icon: Music,
      color: 'text-blue-400'
    },
    {
      title: t('admin.totalOrders'),
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-green-400'
    },
    {
      title: t('admin.totalRevenue'),
      value: `€${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-400'
    },
    {
      title: t('admin.uniqueCustomers'),
      value: stats.uniqueCustomers.toString(),
      icon: Users,
      color: 'text-orange-400'
    }
  ] : [];

  const latestOrders = (ordersData?.orders || []).slice(0, 5);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount));
  };

  const getOrderAmount = (order: NonNullable<typeof ordersData>['orders'][number]) => {
    return order.items.reduce((total, item) => total + Number(item.totalPrice), 0);
  };

  const getOrderTitle = (order: NonNullable<typeof ordersData>['orders'][number]) => {
    if (order.items.length === 1) {
      return order.items[0]?.beat?.title || t('admin.beatNotFound');
    }

    return t('admin.multiOrderTitle', { count: order.items.length });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // États de chargement et d'erreur
  const isLoading = statsLoading || ordersLoading;
  const hasError = statsError || ordersError;

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
             ordersError instanceof Error ? ordersError.message : 
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
              <div className="flex items-center mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color === 'text-blue-400' ? 'bg-blue-500/20' : stat.color === 'text-green-400' ? 'bg-green-500/20' : stat.color === 'text-purple-400' ? 'bg-purple-500/20' : 'bg-orange-500/20')}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Latest Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Latest Orders */}
          <div className="bg-card/10 backdrop-blur-lg rounded-xl p-6 border border-border/20">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('admin.latestOrders')}</h2>
                  <p className="text-sm text-muted-foreground">{t('admin.latestOrdersDescription')}</p>
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                {t('admin.viewAllOrders')}
              </Link>
            </div>

            {latestOrders.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">{t('admin.noRecentOrders')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/20 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground truncate">{getOrderTitle(order)}</p>
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatAmount(getOrderAmount(order))}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="truncate">{order.customerEmail}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span>{order.items.length} {t('admin.licenses')}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                      getStatusColor(order.status)
                    )}>
                      {order.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/admin/upload"
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all duration-300"
                >
                  <Music className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium text-foreground">{t('admin.uploadBeat')}</span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/admin/manage"
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t('admin.manageBeats')}</span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t('admin.viewOrders')}</span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link
                  href="/admin/stats"
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/20 hover:bg-card/30 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t('admin.detailedAnalytics')}</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
