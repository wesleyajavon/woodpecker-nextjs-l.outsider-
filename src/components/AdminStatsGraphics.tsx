'use client';

import { motion } from 'framer-motion';
import { Music, ShoppingCart, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useApp';
import { useAdminStats, useAdminDailyRevenue } from '@/hooks/queries/useAdminStats';
import { Chart } from 'react-google-charts';

export default function AdminStatsGraphics() {
  const { t } = useTranslation();
  
  // TanStack Query hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useAdminStats();
  
  const {
    data: dailyRevenueData,
    isLoading: dailyRevenueLoading,
    error: dailyRevenueError
  } = useAdminDailyRevenue(30);

  // Format data for Google Charts
  const getChartData = (data: typeof dailyRevenueData) => {
    if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return [['Date', 'Revenue (€)'], ['No Data', 0]];
    }

    const chartData = [
      ['Date', 'Revenue (€)'],
      ...data.data.slice(-14).map(item => [item.formattedDate, item.revenue || 0])
    ];

    return chartData;
  };

  // Chart options for Google Charts
  const chartOptions = {
    title: '',
    backgroundColor: 'transparent',
    hAxis: {
      baselineColor: '#666',
      gridlines: { color: '#444' },
      textStyle: { color: '#9ca3af' }
    },
    vAxis: {
      baselineColor: '#666',
      gridlines: { color: '#444' },
      textStyle: { color: '#9ca3af' },
      format: '# €'
    },
    series: {
      0: {
        color: '#f7a600' // Orange color to match theme
      }
    },
    legend: {
      position: 'none'
    },
    chartArea: {
      left: 20,
      top: 20,
      right: 20,
      bottom: 40,
      width: '100%',
      height: '80%'
    }
  };

  // Combine loading and error states
  const loading = statsLoading || dailyRevenueLoading;
  const error = statsError || dailyRevenueError;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">{t('admin.charts')}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-6"
            >
              <div className="animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-4"></div>
                <div className="h-32 bg-white/20 rounded"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">{t('admin.charts')}</h3>
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate real metrics based on actual data with safe null checks
  const totalRevenue = stats.totalRevenue || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalBeats = stats.totalBeats || 0;
  const uniqueCustomers = stats.uniqueCustomers ?? 0;
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const revenuePerBeat = totalBeats > 0 ? totalRevenue / totalBeats : 0;
  const ordersPerCustomer = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;



  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-purple-400" />
{t('admin.chartsAndAnalytics')}
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-white">{t('admin_revenueOverview')}</h4>
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-green-400 mb-2">{totalRevenue}€</div>
            <div className="text-gray-300">{t('admin.totalRevenue')}</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.totalOrders')}:</span>
              <span className="text-white font-semibold">{totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.uniqueCustomers')}:</span>
              <span className="text-white font-semibold">{uniqueCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.totalBeats')}:</span>
              <span className="text-white font-semibold">{totalBeats}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">{t('admin_orderAnalysis')}</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.averageOrderValue')}:</span>
              <span className="text-white font-semibold">{averageOrderValue.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.revenuePerBeat')}:</span>
              <span className="text-white font-semibold">{revenuePerBeat.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin.ordersPerCustomer')}:</span>
              <span className="text-white font-semibold">{ordersPerCustomer.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">{t('admin_customerLoyalty')}:</span>
              <span className="text-white font-semibold">
                {ordersPerCustomer > 1 ? t('admin_high') : ordersPerCustomer > 0 ? t('admin_medium') : t('admin_low')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Content Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-purple-400" />
            <h4 className="text-lg font-semibold text-white">{t('admin_contentPerformance')}</h4>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-purple-500/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{totalBeats}</div>
              <div className="text-sm text-gray-300">{t('admin_beatsCreated')}</div>
            </div>
            <div className="text-center p-4 bg-blue-500/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{totalOrders}</div>
              <div className="text-sm text-gray-300">{t('admin_totalSales')}</div>
            </div>
            <div className="text-center p-4 bg-green-500/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {totalBeats > 0 ? ((totalOrders / totalBeats) * 100).toFixed(2) : 0}%
              </div>
              <div className="text-sm text-gray-300">{t('admin_salesSuccessRate')}</div>
            </div>
          </div>
        </motion.div>

        {/* Daily Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-400" />
            <h4 className="text-lg font-semibold text-white">{t('admin_dailyRevenue')}</h4>
          </div>
          
          <div className="h-64 mb-4">
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="100%"
              data={getChartData(dailyRevenueData)}
              options={chartOptions}
              style={{
                backgroundColor: 'transparent'
              }}
            />
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
