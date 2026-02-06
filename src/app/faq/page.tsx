'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  Music,
  CreditCard,
  Download,
  Shield,
  Users,
  Loader2,
  AlertCircle,
  Search
} from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { TextRewind } from '@/components/ui/text-rewind';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
}

export default function FAQPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const faqCategories = [
    { id: 'all', name: t('faq.categories.all'), icon: HelpCircle },
    { id: 'licenses', name: t('faq.categories.licenses'), icon: Shield },
    { id: 'payment', name: t('faq.categories.payment'), icon: CreditCard },
    { id: 'download', name: t('faq.categories.download'), icon: Download },
    { id: 'usage', name: t('faq.categories.usage'), icon: Music },
    { id: 'account', name: t('faq.categories.account'), icon: Users }
  ];

  const ITEMS_PER_PAGE = 3;

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/faq');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFaqData(data.faqs || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredFAQs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFAQs = filteredFAQs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  function toggleExpanded(id: string) {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load FAQs</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DottedSurface />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-10 left-1/2 size-full .translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,var(--theme-gradient),transparent_50%)]',
            'blur-[30px]',
          )}
        />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="mb-16 mt-6">
              <TextRewind text={`${t('faq.title')} ${t('faq.titleHighlight')}`} />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('faq.subtitle')}
            </p>
          </motion.div>

          {/* Search & Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('faq.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-background/50 backdrop-blur-lg border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 shadow-lg"
                />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 text-center">
                {/* <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
                  <div className="text-2xl font-bold text-indigo-400">{filteredFAQs.length}</div>
                  <div className="text-sm text-muted-foreground">{t('faq.resultsCount', { count: filteredFAQs.length })}</div>
                </div> */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{faqData.length}</div>
                  <div className="text-sm text-muted-foreground">{t('faq.totalQuestions')}</div>
                </div>
                <div className="bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-xl p-4 border border-pink-500/20">
                  <div className="text-2xl font-bold text-pink-400">{faqCategories.length - 1}</div>
                  <div className="text-sm text-muted-foreground">{t('faq.categories.word')}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Filter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{t('faq.filterByCategory')}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {faqCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300 font-medium",
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30 shadow-lg"
                        : "bg-card/10 text-foreground border-border/40 hover:bg-card/20 hover:border-border/60"
                    )}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 mb-16"
          >
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-12 text-center shadow-xl"
              >
                <HelpCircle className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-3">{t('faq.noResults')}</h3>
                <p className="text-muted-foreground text-lg">
                  {t('faq.noResultsDescription')}
                </p>
              </motion.div>
            ) : (
              paginatedFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-card/10 transition-all duration-300"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-foreground text-lg mb-2">{faq.question}</h3>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-500/20">
                          <span className="text-xs font-medium text-indigo-400 capitalize">{faq.category}</span>
                        </div>
                        {faq.featured && (
                          <div className="px-3 py-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full border border-yellow-500/20">
                            <span className="text-xs font-medium text-yellow-400">Featured</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedItems.includes(faq.id) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {expandedItems.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border/20"
                      >
                        <div className="p-6 bg-gradient-to-r from-card/5 to-card/10">
                          <p className="text-muted-foreground leading-relaxed text-base">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card/20 backdrop-blur-xl rounded-2xl border border-border/30 p-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {t('faq.showingResults', { 
                    start: startIndex + 1, 
                    end: Math.min(endIndex, filteredFAQs.length), 
                    total: filteredFAQs.length 
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-4 py-2 rounded-xl border transition-all duration-300 font-medium",
                      currentPage === 1
                        ? "bg-card/10 text-muted-foreground border-border/40 cursor-not-allowed"
                        : "bg-card/10 text-foreground border-border/40 hover:bg-card/20 hover:border-border/60"
                    )}
                  >
                    {t('common.previous')}
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-10 h-10 rounded-xl border transition-all duration-300 font-medium",
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30 shadow-lg"
                              : "bg-card/10 text-foreground border-border/40 hover:bg-card/20 hover:border-border/60"
                          )}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-4 py-2 rounded-xl border transition-all duration-300 font-medium",
                      currentPage === totalPages
                        ? "bg-card/10 text-muted-foreground border-border/40 cursor-not-allowed"
                        : "bg-card/10 text-foreground border-border/40 hover:bg-card/20 hover:border-border/60"
                    )}
                  >
                    {t('common.next')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}