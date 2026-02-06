'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  CreditCard, 
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Order, MultiItemOrder } from '@/types/order';
import { useTranslation, useLanguage } from '@/hooks/useApp';
import { useAdminOrders, useAdminMultiItemOrders } from '@/hooks/queries/useOrders';

type OrderWithType = (Order & { type: 'single' }) | (MultiItemOrder & { type: 'multi' });

interface AdminOrdersProps {
  className?: string;
}

export default function AdminOrders({ className = '' }: AdminOrdersProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  
  // TanStack Query hooks
  const {
    data: singleOrdersData,
    isLoading: singleOrdersLoading,
    error: _singleOrdersError
  } = useAdminOrders();
  
  const {
    data: multiOrdersData,
    isLoading: multiOrdersLoading,
    error: _multiOrdersError
  } = useAdminMultiItemOrders();
  
  const loading = singleOrdersLoading || multiOrdersLoading;
  
  // États locaux pour l'UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'single' | 'multi'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Use useMemo to calculate filtered orders - orders moved inside to avoid stale closure
  const filteredOrders = useMemo(() => {
    const ordersList: OrderWithType[] = [
      ...(singleOrdersData?.orders || []).map((order: Order) => ({ ...order, type: 'single' as const })),
      ...(multiOrdersData?.orders || []).map((order: MultiItemOrder) => ({ ...order, type: 'multi' as const }))
    ];
    let filtered = ordersList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.type === 'single' ? order.beat.title : 'Multi-item').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(order => order.type === filterType);
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'amount':
          aValue = Number(a.totalAmount);
          bValue = Number(b.totalAmount);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [singleOrdersData?.orders, multiOrdersData?.orders, searchTerm, filterType, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy, sortOrder]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder={t('admin.searchOrders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base touch-manipulation"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'single' | 'multi')}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base touch-manipulation"
            >
              <option value="all">{t('admin.allOrders')}</option>
              <option value="single">{t('admin.singleOrders')}</option>
              <option value="multi">{t('admin.multiOrders')}</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base touch-manipulation"
            >
              <option value="date">{t('admin.sortByDate')}</option>
              <option value="amount">{t('admin.sortByAmount')}</option>
              <option value="status">{t('admin.sortByStatus')}</option>
            </select>

            {/* Sort order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors text-sm sm:text-base touch-manipulation"
            >
              {sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{sortOrder === 'asc' ? t('admin.ascending') : t('admin.descending')}</span>
            </button>

            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base touch-manipulation"
            >
              <option value={5}>{t('admin.itemsPerPage', { count: 5 })}</option>
              <option value={10}>{t('admin.itemsPerPage', { count: 10 })}</option>
              <option value={25}>{t('admin.itemsPerPage', { count: 25 })}</option>
              <option value={50}>{t('admin.itemsPerPage', { count: 50 })}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-base sm:text-lg">{t('admin.noOrdersFound')}</p>
          </div>
        ) : (
          paginatedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
            >
              {/* Order Header */}
              <div 
                className="p-4 sm:p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {order.type === 'single' ? (
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      ) : (
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                        {order.type === 'single' 
                          ? (order as Order & { type: 'single' }).beat?.title || 'Beat non trouvé'
                          : (order as MultiItemOrder & { type: 'multi' }).items?.length === 1 
                            ? (order as MultiItemOrder & { type: 'multi' }).items[0]?.beat?.title || 'Beat non trouvé'
                            : t('admin.multiOrderTitle', { count: (order as MultiItemOrder & { type: 'multi' }).items?.length || 0 })
                        }
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{order.customerEmail}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">
                            {order.type === 'single' 
                              ? order.licenseType 
                              : `${(order as MultiItemOrder & { type: 'multi' }).items?.length || 0} ${t('admin.licenses')}`
                            }
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-white">
                        {formatAmount(order.totalAmount)}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors touch-manipulation">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/20 p-4 sm:p-6 bg-white/5"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Order Information */}
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('admin.orderInformation')}</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-300 text-sm sm:text-base">{t('success.orderId')}:</span>
                          <span className="text-white font-mono text-xs sm:text-sm break-all">{order.id}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-300 text-sm sm:text-base">{t('admin.customerEmail')}:</span>
                          <span className="text-white text-sm sm:text-base break-all">{order.customerEmail}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-300 text-sm sm:text-base">{t('admin.orderDate')}:</span>
                          <span className="text-white text-sm sm:text-base">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-300 text-sm sm:text-base">{t('common.totalAmount')}:</span>
                          <span className="text-white font-semibold text-sm sm:text-base">{formatAmount(order.totalAmount)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-gray-300 text-sm sm:text-base">{t('common.status')}:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">{t('admin.orderedItems')}</h4>
                      {order.type === 'single' ? (
                        <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-white text-sm sm:text-base truncate">{order.beat.title}</h5>
                              <p className="text-xs sm:text-sm text-gray-300">{order.beat.genre} • {order.beat.bpm} BPM</p>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold text-sm sm:text-base">{formatAmount(order.beat.wavLeasePrice)}</div>
                              <div className="text-xs sm:text-sm text-gray-300">{t('admin.quantity')}: 1</div>
                              <div className="text-xs sm:text-sm text-indigo-300 font-medium">{order.licenseType}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {(order as MultiItemOrder & { type: 'multi' }).items?.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-white/10 rounded-lg p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-white text-sm sm:text-base truncate">{item.beat.title}</h5>
                                  <p className="text-xs sm:text-sm text-gray-300">{item.beat.genre} • {item.beat.bpm} BPM</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-semibold text-sm sm:text-base">{formatAmount(item.unitPrice)}</div>
                                  <div className="text-xs sm:text-sm text-gray-300">{t('admin.quantity')}: {item.quantity}</div>
                                  <div className="text-xs sm:text-sm text-indigo-300 font-medium">{item.licenseType}</div>
                                  <div className="text-xs sm:text-sm text-purple-300 font-medium">
                                    {t('common.total')}: {formatAmount(item.totalPrice)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/20">
                    <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 text-sm sm:text-base touch-manipulation shadow-lg hover:shadow-xl">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('admin.viewDetails')}
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white rounded-lg transition-all duration-300 text-sm sm:text-base touch-manipulation shadow-lg hover:shadow-xl">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('common.download')}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/20 gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              {t('admin.showingOrders', { start: startIndex + 1, end: Math.min(endIndex, filteredOrders.length), total: filteredOrders.length })}
            </span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Previous button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-white hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm touch-manipulation"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('pagination.previous')}</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = currentPage - 1 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg text-white hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm touch-manipulation"
            >
              <span className="hidden sm:inline">{t('pagination.next')}</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
