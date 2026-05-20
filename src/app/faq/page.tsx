'use client';

import { useState, useEffect, useRef } from 'react';
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
  Search,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { PublicPageShell } from '@/components/home/PublicPageShell';
import { PublicPageHeader } from '@/components/home/PublicPageHeader';
import { Button } from '@/components/ui/Button';
import {
  catalogInputClass,
  catalogPanelClass,
} from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FAQCategoryDto, FAQItemDto, FAQListResponse } from '@/lib/faq';

const ITEMS_PER_PAGE = 3;
const SEARCH_DEBOUNCE_MS = 300;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  licenses: Shield,
  payment: CreditCard,
  download: Download,
  usage: Music,
  account: Users,
};

function getCategoryLabel(
  slug: string,
  displayName: string,
  t: (key: string) => string,
): string {
  const key = `faq.categories.${slug}`;
  const translated = t(key);
  return translated !== key ? translated : displayName;
}

export default function FAQPage() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<FAQItemDto[]>([]);
  const [categories, setCategories] = useState<FAQCategoryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadFaqs() {
      if (isFirstLoad.current) {
        setLoading(true);
      } else {
        setFetching(true);
      }

      try {
        const params = new URLSearchParams({
          language,
          page: String(currentPage),
          limit: String(ITEMS_PER_PAGE),
        });
        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }
        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim());
        }

        const response = await fetch(`/api/faq?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: FAQListResponse = await response.json();
        if (cancelled) return;

        setFaqs(data.faqs ?? []);
        setCategories(data.categories ?? []);
        setTotalCount(data.totalCount ?? 0);
        setTotalActiveCount(data.totalActiveCount ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 0);
        setError(null);
        isFirstLoad.current = false;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch FAQs:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFetching(false);
        }
      }
    }

    loadFaqs();
    return () => {
      cancelled = true;
    };
  }, [language, selectedCategory, debouncedSearch, currentPage]);

  const filterCategories = [
    { id: 'all', name: t('faq.categories.all'), icon: HelpCircle },
    ...categories.map((category) => ({
      id: category.slug,
      name: getCategoryLabel(category.slug, category.displayName, t),
      icon: CATEGORY_ICONS[category.slug] ?? HelpCircle,
    })),
  ];

  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = totalCount === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  function toggleExpanded(id: string) {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  if (loading) {
    return (
      <PublicPageShell maxWidth="max-w-4xl">
        <div className="flex min-h-[40vh] flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t('faq.loading')}
          </p>
        </div>
      </PublicPageShell>
    );
  }

  if (error) {
    return (
      <PublicPageShell maxWidth="max-w-4xl">
        <PublicPageHeader label={t('nav.faq')} title={t('faq.title')} />
        <div className="py-16 text-center">
          <div className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-300" />
            <p className="mb-2 text-lg font-medium text-red-300">{t('faq.errorTitle')}</p>
            <p className="mb-6 text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/12">
              {t('beats.retry')}
            </Button>
          </div>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell maxWidth="max-w-4xl">
      <PublicPageHeader
        label={t('nav.faq')}
        title={t('faq.title')}
        subtitle={t('faq.subtitle')}
        meta={
          <span className={cn(fetching && 'opacity-60')}>
            {totalActiveCount} {t('faq.totalQuestions')}
          </span>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cn(catalogPanelClass, 'mb-8 p-5 sm:p-6')}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('faq.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(catalogInputClass, 'pl-10')}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-8"
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t('faq.filterByCategory')}
        </p>
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              disabled={fetching}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                selectedCategory === category.id
                  ? 'border-white/20 bg-white text-black'
                  : 'border-white/10 text-muted-foreground hover:border-white/14 hover:bg-white/[0.04] hover:text-foreground',
              )}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn('mb-10 space-y-4', fetching && 'pointer-events-none opacity-60')}
      >
        {totalCount === 0 ? (
          <div className={cn(catalogPanelClass, 'py-16 text-center')}>
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">{t('faq.noResults')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('faq.noResultsDescription')}</p>
          </div>
        ) : (
          faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              className={cn(catalogPanelClass, 'overflow-hidden')}
            >
              <button
                type="button"
                onClick={() => toggleExpanded(faq.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02] sm:p-6"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">{faq.question}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                      {getCategoryLabel(faq.category, faq.categoryName, t)}
                    </span>
                    {faq.featured && (
                      <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                        {t('faq.featured')}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300',
                    expandedItems.includes(faq.id) && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence>
                {expandedItems.includes(faq.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-white/6"
                  >
                    <p className="p-5 text-sm leading-relaxed text-muted-foreground sm:p-6 sm:text-base">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </motion.div>

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn(
            catalogPanelClass,
            'flex flex-col items-center justify-between gap-4 p-4 sm:flex-row sm:p-5',
            fetching && 'opacity-60',
          )}
        >
          <p className="font-mono text-xs text-muted-foreground">
            {t('faq.showingResults', {
              start: String(startIndex),
              end: String(endIndex),
              total: String(totalCount),
            })}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || fetching}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/10 px-4 text-sm transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common.previous')}
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                const pageNum =
                  totalPages <= 5
                    ? index + 1
                    : Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={fetching}
                    className={cn(
                      'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
                      currentPage === pageNum
                        ? 'bg-white text-black'
                        : 'border border-white/10 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || fetching}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-white/10 px-4 text-sm transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('common.next')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </PublicPageShell>
  );
}
