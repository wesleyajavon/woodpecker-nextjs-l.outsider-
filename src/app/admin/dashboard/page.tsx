'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart3,
  Calendar,
  Music,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminStats } from '@/hooks/queries/useAdminStats';
import { useAdminMultiItemOrders } from '@/hooks/queries/useOrders';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();

  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useAdminMultiItemOrders({ limit: 5 });

  const formattedStats = stats
    ? [
        { title: t('admin.totalBeats'), value: stats.totalBeats.toString(), icon: Music },
        { title: t('admin.totalOrders'), value: stats.totalOrders.toString(), icon: ShoppingCart },
        {
          title: t('admin.totalRevenue'),
          value: `€${stats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
        },
        { title: t('admin.uniqueCustomers'), value: stats.uniqueCustomers.toString(), icon: Users },
      ]
    : [];

  const latestOrders = (ordersData?.orders || []).slice(0, 5);
  const isLoading = statsLoading || ordersLoading;
  const hasError = statsError || ordersError;

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatAmount = (amount: number | string) =>
    new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount));

  const getOrderAmount = (order: NonNullable<typeof ordersData>['orders'][number]) =>
    order.items.reduce((total, item) => total + Number(item.totalPrice), 0);

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
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200';
      case 'PENDING':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'border-red-500/20 bg-red-500/5 text-red-300';
      default:
        return 'border-white/10 bg-white/[0.03] text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <AdminPageShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t('admin.pleaseWait')}
          </p>
        </div>
      </AdminPageShell>
    );
  }

  if (hasError) {
    return (
      <AdminPageShell>
        <div className="py-16 text-center">
          <div className={cn(catalogPanelClass, 'mx-auto max-w-md p-6')}>
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-red-300" />
            <p className="mb-6 text-sm text-muted-foreground">
              {statsError instanceof Error
                ? statsError.message
                : ordersError instanceof Error
                  ? ordersError.message
                  : t('admin.loadingError')}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/12">
              {t('beats.retry')}
            </Button>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <PublicPageHeader
        label={t('admin.title')}
        title={t('admin.dashboardTitle')}
        subtitle={t('admin.dashboardSubtitle')}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {formattedStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.04 }}
            className={cn(catalogPanelClass, 'p-5')}
          >
            <stat.icon className="mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {stat.title}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={cn(catalogPanelClass, 'p-6')}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {t('admin.latestOrders')}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('admin.latestOrdersDescription')}
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              {t('admin.viewAllOrders')}
            </Link>
          </div>

          {latestOrders.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('admin.noRecentOrders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getOrderTitle(order)}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatAmount(getOrderAmount(order))}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="truncate">{order.customerEmail}</span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 font-mono text-xs uppercase tracking-wide',
                      getStatusColor(order.status),
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className={cn(catalogPanelClass, 'p-6')}
        >
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">
            {t('admin.quickActions')}
          </h2>
          <div className="space-y-2">
            {[
              { href: '/admin/upload', icon: Music, label: t('admin.uploadBeat') },
              { href: '/admin/manage', icon: BarChart3, label: t('admin.manageBeats') },
              { href: '/admin/orders', icon: ShoppingCart, label: t('admin.viewOrders') },
              { href: '/admin/stats', icon: TrendingUp, label: t('admin.detailedAnalytics') },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-white/12 hover:bg-white/[0.04]"
              >
                <span className="inline-flex items-center gap-3">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminPageShell>
  );
}
