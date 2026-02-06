'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit, Star, Lock, ChevronLeft, ChevronRight, Grid3X3, List, Music, Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Beat } from '@/types/beat';
import { useTranslation, useLanguage } from '@/hooks/useApp';
import { useAdminBeats, useToggleBeatStatus } from '@/hooks/queries/useAdminBeats';
import { useDebounce } from '@/hooks/useDebounce';
import { BEAT_CONFIG } from '@/config/constants';
import { cn } from '@/lib/utils';

const VALID_SORT_VALUES = ['newest', 'oldest', 'price_asc', 'price_desc', 'popular'] as const;
const VALID_LIMIT_VALUES = [4, 8, 12, 24, 50];
const BPM_ABSOLUTE_MIN = 60;
const BPM_ABSOLUTE_MAX = 220;

const bpmRangeHint = (() => {
  const ranges = Object.values(BEAT_CONFIG.bpmRanges);
  return {
    min: Math.min(...ranges.map((r) => r.min)),
    max: Math.max(...ranges.map((r) => r.max)),
  };
})();

function parseSearchParams(
  searchParams: URLSearchParams | null,
  allGenresLabel: string,
  allKeysLabel: string,
  validGenres: readonly string[],
  validKeys: readonly string[]
) {
  const params = searchParams ?? new URLSearchParams();
  const search = params.get('search') || '';
  const genreParam = params.get('genre') || allGenresLabel;
  const genre = genreParam === allGenresLabel || validGenres.includes(genreParam) ? genreParam : allGenresLabel;
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const limitParam = parseInt(params.get('limit') || '12', 10);
  const limit = VALID_LIMIT_VALUES.includes(limitParam) ? limitParam : 12;
  const sortParam = params.get('sortBy') || 'newest';
  const sortBy = VALID_SORT_VALUES.includes(sortParam as (typeof VALID_SORT_VALUES)[number])
    ? (sortParam as (typeof VALID_SORT_VALUES)[number])
    : 'newest';
  const bpmMinParam = params.get('bpmMin');
  const bpmMinRaw = bpmMinParam ? parseInt(bpmMinParam, 10) : NaN;
  const bpmMin = !isNaN(bpmMinRaw) ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMinRaw)) : undefined;
  const bpmMaxParam = params.get('bpmMax');
  const bpmMaxRaw = bpmMaxParam ? parseInt(bpmMaxParam, 10) : NaN;
  const bpmMax = !isNaN(bpmMaxRaw) ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMaxRaw)) : undefined;
  const keyParam = params.get('key') || allKeysLabel;
  const key = keyParam === allKeysLabel || validKeys.includes(keyParam) ? keyParam : allKeysLabel;
  const priceMinParam = params.get('priceMin');
  const priceMin = priceMinParam ? parseFloat(priceMinParam) : undefined;
  const priceMaxParam = params.get('priceMax');
  const priceMax = priceMaxParam ? parseFloat(priceMaxParam) : undefined;
  const hasStems = params.get('hasStems') === 'true';
  const featured = params.get('featured') === 'true' ? true : params.get('featured') === 'false' ? false : undefined;
  const isExclusive = params.get('isExclusive') === 'true' ? true : params.get('isExclusive') === 'false' ? false : undefined;
  const includeInactive = params.get('includeInactive') !== 'false'; // default true for admin (show all beats)
  return { search, genre, page, limit, sortBy, bpmMin, bpmMax, key, priceMin, priceMax, hasStems, featured, isExclusive, includeInactive };
}

interface BeatManagerProps {
  onEdit?: (beat: Beat) => void;
  onDelete?: (beatId: string) => void;
  onToggleStatus?: (beatId: string, isActive: boolean) => void;
}

export default function BeatManager({ onDelete: _onDelete, onToggleStatus }: BeatManagerProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const allGenresLabel = t('beats.allGenres');
  const allKeysLabel = t('beats.allKeys');

  const [searchInput, setSearchInput] = useState(() => searchParams?.get('search') || '');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const debouncedSearch = useDebounce(searchInput, 350);

  const genres = [allGenresLabel, ...BEAT_CONFIG.genres];
  const keys = [allKeysLabel, ...BEAT_CONFIG.keys];
  const { search, genre, page, limit, sortBy, bpmMin, bpmMax, key, priceMin, priceMax, hasStems, featured, isExclusive, includeInactive } = parseSearchParams(
    searchParams,
    allGenresLabel,
    allKeysLabel,
    BEAT_CONFIG.genres,
    BEAT_CONFIG.keys
  );

  const updateUrl = useCallback(
    (updates: {
      search?: string;
      genre?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      bpmMin?: number;
      bpmMax?: number;
      key?: string;
      priceMin?: number;
      priceMax?: number;
      hasStems?: boolean;
      featured?: boolean;
      isExclusive?: boolean;
      includeInactive?: boolean;
      resetPage?: boolean;
    }) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (updates.search !== undefined) {
        if (updates.search) params.set('search', updates.search);
        else params.delete('search');
      }
      if (updates.genre !== undefined) {
        if (updates.genre && updates.genre !== allGenresLabel) params.set('genre', updates.genre);
        else params.delete('genre');
      }
      if (updates.page !== undefined) params.set('page', String(updates.page));
      else if (updates.resetPage) params.set('page', '1');
      if (updates.limit !== undefined) params.set('limit', String(updates.limit));
      if (updates.sortBy !== undefined) params.set('sortBy', updates.sortBy);
      if ('bpmMin' in updates) {
        if (typeof updates.bpmMin === 'number' && !isNaN(updates.bpmMin)) params.set('bpmMin', String(updates.bpmMin));
        else params.delete('bpmMin');
      }
      if ('bpmMax' in updates) {
        if (typeof updates.bpmMax === 'number' && !isNaN(updates.bpmMax)) params.set('bpmMax', String(updates.bpmMax));
        else params.delete('bpmMax');
      }
      if ('key' in updates) {
        if (updates.key && updates.key !== allKeysLabel) params.set('key', updates.key);
        else params.delete('key');
      }
      if ('priceMin' in updates) {
        if (typeof updates.priceMin === 'number' && !isNaN(updates.priceMin) && updates.priceMin >= 0) params.set('priceMin', String(updates.priceMin));
        else params.delete('priceMin');
      }
      if ('priceMax' in updates) {
        if (typeof updates.priceMax === 'number' && !isNaN(updates.priceMax) && updates.priceMax >= 0) params.set('priceMax', String(updates.priceMax));
        else params.delete('priceMax');
      }
      if ('hasStems' in updates) {
        if (updates.hasStems) params.set('hasStems', 'true');
        else params.delete('hasStems');
      }
      if ('featured' in updates) {
        if (updates.featured === true) params.set('featured', 'true');
        else if (updates.featured === false) params.set('featured', 'false');
        else params.delete('featured');
      }
      if ('isExclusive' in updates) {
        if (updates.isExclusive === true) params.set('isExclusive', 'true');
        else if (updates.isExclusive === false) params.set('isExclusive', 'false');
        else params.delete('isExclusive');
      }
      if ('includeInactive' in updates) {
        if (updates.includeInactive) params.set('includeInactive', 'true');
        else params.set('includeInactive', 'false');
      }
      const query = params.toString();
      router.replace(query ? `/admin/manage?${query}` : '/admin/manage', { scroll: false });
    },
    [searchParams, router, allGenresLabel, allKeysLabel]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl({ search: debouncedSearch, resetPage: true });
    }
  }, [debouncedSearch, search, updateUrl]);

  const {
    data: beatsData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useAdminBeats({
    page,
    limit,
    search: debouncedSearch || undefined,
    genre: genre === allGenresLabel ? undefined : genre,
    bpmMin,
    bpmMax,
    key: key === allKeysLabel ? undefined : key,
    priceMin,
    priceMax,
    hasStems: hasStems || undefined,
    featured,
    isExclusive,
    includeInactive,
    sortBy,
  });

  const beats = beatsData?.data ?? [];
  const pagination = beatsData?.pagination;
  const totalBeats = pagination?.total ?? beats.length;
  const totalPages = pagination?.totalPages ?? Math.ceil(totalBeats / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalBeats);

  const toggleStatusMutation = useToggleBeatStatus();
  const goToPage = (newPage: number) => {
    updateUrl({ page: Math.max(1, Math.min(newPage, totalPages)) });
  };

  const goToPreviousPage = () => {
    if (page > 1) updateUrl({ page: page - 1 });
  };

  const goToNextPage = () => {
    if (page < totalPages) updateUrl({ page: page + 1 });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    updateUrl({
      search: '',
      genre: allGenresLabel,
      key: allKeysLabel,
      bpmMin: undefined,
      bpmMax: undefined,
      priceMin: undefined,
      priceMax: undefined,
      hasStems: false,
      featured: undefined,
      isExclusive: undefined,
      includeInactive: true,
      page: 1,
    });
  };

  const hasSearchFilter = search.trim() !== '';
  const hasGenreFilter = genre !== allGenresLabel;
  const hasSortFilter = sortBy !== 'newest';
  const hasBpmFilter = bpmMin != null || bpmMax != null;
  const hasKeyFilter = key !== allKeysLabel;
  const hasPriceFilter = (priceMin != null && priceMin > 0) || (priceMax != null && priceMax > 0);
  const hasStemsFilter = hasStems;
  const hasFeaturedFilter = featured !== undefined;
  const hasExclusiveFilter = isExclusive !== undefined;
  const hasInactiveFilter = includeInactive;
  const activeFiltersCount = [
    hasSearchFilter,
    hasGenreFilter,
    hasSortFilter,
    hasBpmFilter,
    hasKeyFilter,
    hasPriceFilter,
    hasStemsFilter,
    hasFeaturedFilter,
    hasExclusiveFilter,
    hasInactiveFilter,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  // Gestion des mutations
  const handleToggleStatus = async (beatId: string, isActive: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: beatId, isActive });
      onToggleStatus?.(beatId, isActive);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(t('admin.updateError'));
    }
  };

  // Gestion de la lecture
  // Gestion des erreurs
  const error = queryError ? (queryError instanceof Error ? queryError.message : t('errors.generic')) : null;

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('admin.loadingBeats')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-400 text-lg mb-4">{t('admin.loadingError')}</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche - style /beats */}
      <div className="bg-card/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/20">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Barre de recherche */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder={t('admin.searchBeats')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-card/20 border border-border/30 rounded-lg text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-manipulation"
            />
          </div>

          {/* Filtres et contrôles */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[140px]">
              <Filter className="text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <select
                value={genre}
                onChange={(e) => updateUrl({ genre: e.target.value, resetPage: true })}
                className="w-full bg-card/20 border border-border/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
              >
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-card text-foreground">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={key}
              onChange={(e) => updateUrl({ key: e.target.value, resetPage: true })}
              className="w-full sm:w-auto min-w-[100px] bg-card/20 border border-border/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
              aria-label={t('beats.keyFilter')}
            >
              {keys.map((k) => (
                <option key={k} value={k} className="bg-card text-foreground">
                  {k}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => updateUrl({ sortBy: e.target.value, resetPage: true })}
              className="w-full sm:w-auto min-w-[120px] bg-card/20 border border-border/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
            >
              <option value="newest" className="bg-card text-foreground">{t('beats.sortNewest')}</option>
              <option value="oldest" className="bg-card text-foreground">{t('beats.sortOldest')}</option>
              <option value="price_asc" className="bg-card text-foreground">{t('beats.sortPriceAsc')}</option>
              <option value="price_desc" className="bg-card text-foreground">{t('beats.sortPriceDesc')}</option>
              <option value="popular" className="bg-card text-foreground">{t('beats.sortPopular')}</option>
            </select>

            <select
              value={limit}
              onChange={(e) => updateUrl({ limit: Number(e.target.value), page: 1 })}
              className="w-full sm:w-auto min-w-[80px] bg-card/20 border border-border/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
            >
              {VALID_LIMIT_VALUES.map((v) => (
                <option key={v} value={v} className="bg-card text-foreground">{t('beats.itemsPerPage', { count: String(v) })}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 sm:gap-2 bg-card/20 rounded-lg p-1 w-full sm:w-auto justify-center">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 sm:p-2 rounded-md transition-colors touch-manipulation',
                  viewMode === 'list' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('admin.listView')}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  'p-2 sm:p-2 rounded-md transition-colors touch-manipulation',
                  viewMode === 'card' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'text-muted-foreground hover:text-foreground'
                )}
                title={t('admin.cardView')}
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {activeFiltersCount === 1
                    ? t('beats.activeFiltersCount', { count: '1' })
                    : t('beats.activeFiltersCount_plural', { count: String(activeFiltersCount) })}
                </span>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-card/20 border border-border/30 rounded-lg text-xs sm:text-sm text-foreground hover:bg-card/30 hover:border-border/50 transition-colors touch-manipulation"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t('beats.resetFilters')}
                </button>
              </div>
            )}
          </div>

          {/* Filtres avancés - collapsible */}
          <div className="border-t border-border/20 pt-4 mt-2">
            <button
              type="button"
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              className="flex sm:hidden w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              aria-expanded={advancedFiltersOpen}
            >
              <span>{t('beats.advancedFilters')}</span>
              {advancedFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div
              className={cn(
                'grid gap-4 sm:grid-cols-[auto_auto_1fr] sm:grid-flow-col sm:items-end',
                advancedFiltersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 sm:!grid-rows-[1fr] sm:!opacity-100'
              )}
            >
              <div className="overflow-hidden sm:overflow-visible min-h-0 sm:min-h-auto flex flex-wrap items-end gap-4">
                {/* BPM range */}
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                  <label htmlFor="admin-bpm-min" className="text-xs text-muted-foreground">
                    {t('beats.bpmRange')} ({bpmRangeHint.min}-{bpmRangeHint.max})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="admin-bpm-min"
                      type="number"
                      min={BPM_ABSOLUTE_MIN}
                      max={BPM_ABSOLUTE_MAX}
                      placeholder={String(bpmRangeHint.min)}
                      value={bpmMin ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                        updateUrl({ bpmMin: !isNaN(v as number) ? v : undefined, resetPage: true });
                      }}
                      className="w-16 sm:w-20 bg-card/20 border border-border/30 rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                      id="admin-bpm-max"
                      type="number"
                      min={BPM_ABSOLUTE_MIN}
                      max={BPM_ABSOLUTE_MAX}
                      placeholder={String(bpmRangeHint.max)}
                      value={bpmMax ?? ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                        updateUrl({ bpmMax: !isNaN(v as number) ? v : undefined, resetPage: true });
                      }}
                      className="w-16 sm:w-20 bg-card/20 border border-border/30 rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Avec stems */}
                <label className="flex items-center gap-2 cursor-pointer py-2 sm:py-0">
                  <input
                    type="checkbox"
                    checked={hasStems}
                    onChange={(e) => updateUrl({ hasStems: e.target.checked, resetPage: true })}
                    className="rounded border-border/50 bg-card/20 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground">{t('beats.withStems')}</span>
                </label>

                {/* Admin: Featured, Exclusive, Include inactive */}
                <label className="flex items-center gap-2 cursor-pointer py-2 sm:py-0">
                  <input
                    type="checkbox"
                    checked={featured === true}
                    onChange={(e) => updateUrl({ featured: e.target.checked ? true : undefined, resetPage: true })}
                    className="rounded border-border/50 bg-card/20 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground">{t('admin.featured')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer py-2 sm:py-0">
                  <input
                    type="checkbox"
                    checked={isExclusive === true}
                    onChange={(e) => updateUrl({ isExclusive: e.target.checked ? true : undefined, resetPage: true })}
                    className="rounded border-border/50 bg-card/20 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground">{t('admin.exclusive')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer py-2 sm:py-0">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => updateUrl({ includeInactive: e.target.checked, resetPage: true })}
                    className="rounded border-border/50 bg-card/20 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-foreground">{t('admin.includeInactive')}</span>
                </label>

                {/* Plus de filtres (prix) */}
                <div className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
                    className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-expanded={moreFiltersOpen}
                  >
                    {moreFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {t('beats.moreFilters')}
                  </button>
                  <div className={cn('overflow-hidden transition-all', moreFiltersOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0')}>
                    <div className="flex items-end gap-4 pt-2">
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <label htmlFor="admin-price-min" className="text-xs text-muted-foreground">{t('beats.priceMin')}</label>
                        <input
                          id="admin-price-min"
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="0"
                          value={priceMin ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            updateUrl({ priceMin: v != null && !isNaN(v) ? v : undefined, resetPage: true });
                          }}
                          className="w-full bg-card/20 border border-border/30 rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <label htmlFor="admin-price-max" className="text-xs text-muted-foreground">{t('beats.priceMax')}</label>
                        <input
                          id="admin-price-max"
                          type="number"
                          min={0}
                          step={0.01}
                          placeholder="∞"
                          value={priceMax ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            updateUrl({ priceMax: v != null && !isNaN(v) ? v : undefined, resetPage: true });
                          }}
                          className="w-full bg-card/20 border border-border/30 rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div aria-live="polite" className="text-muted-foreground text-xs sm:text-sm mb-4 min-h-[1.25rem]">
        {loading && beats.length === 0
          ? t('admin.loadingBeats')
          : beats.length > 0
            ? t('beats.showingResults', { start: startIndex.toString(), end: endIndex.toString(), total: totalBeats.toString() })
            : t('admin.noBeatsWithCriteria')}
      </div>

      {/* Liste des beats */}
      <div className={cn(viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-3 sm:space-y-4')}>
        {beats.map((beat) => (
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all duration-300 ${
              viewMode === 'card' ? 'p-4 sm:p-6' : 'p-4 sm:p-6'
            }`}
          >
            {viewMode === 'card' ? (
              // Card View Layout
              <div className="space-y-4">
                {/* Card Header with Artwork */}
                <div className="flex items-start gap-4">
                  {/* Artwork */}
                  <div className="flex-shrink-0">
                    {beat.artworkUrl ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-800/50">
                        <Image
                          src={beat.artworkUrl}
                          alt={beat.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
                        <Music className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Title and Badges */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate mb-2">{beat.title}</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {beat.isExclusive && (
                        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                          {t('beatCard.exclusive').toUpperCase()}
                        </span>
                      )}
                      {beat.featured && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {t('admin.featured').toUpperCase()}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${beat.isActive
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                        {beat.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm sm:text-base line-clamp-2">{beat.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                    <span>{beat.genre}</span>
                    <span>•</span>
                    <span>{beat.bpm} BPM</span>
                    <span>•</span>
                    <span>{beat.key}</span>
                    <span>•</span>
                    <span>{(beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}</span>
                    <span>•</span>
                    <span>{beat.duration}</span>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-2">
                    {/* <div className="text-xs text-gray-400 font-medium">{t('admin.pricing')}</div> */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="text-xs text-purple-300 font-medium">WAV</div>
                        <div className="text-xs sm:text-sm text-white font-semibold">{formatPrice(beat.wavLeasePrice)}</div>
                      </div>
                      <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-xs text-blue-300 font-medium">Trackout</div>
                        <div className="text-xs sm:text-sm text-white font-semibold">{formatPrice(beat.trackoutLeasePrice)}</div>
                      </div>
                      <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-xs text-green-300 font-medium">Unlimited</div>
                        <div className="text-xs sm:text-sm text-white font-semibold">{formatPrice(beat.unlimitedLeasePrice)}</div>
                      </div>
                    </div>
                  </div>

                  {beat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {beat.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {beat.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                          +{beat.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <Link
                    href={`/admin/beats/${beat.id}`}
                    className="p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all duration-300 touch-manipulation"
                    title="Voir les détails"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(beat.id, !beat.isActive)}
                    disabled={toggleStatusMutation.isPending}
                    className={`p-2 rounded-lg transition-colors touch-manipulation ${beat.isActive
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                      } ${toggleStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={beat.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {toggleStatusMutation.isPending ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : beat.isActive ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // List View Layout (existing)
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Informations du beat */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">{beat.title}</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {beat.isExclusive && (
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                        {t('beatCard.exclusive').toUpperCase()}
                      </span>
                    )}
                    {beat.featured && (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {t('admin.featured').toUpperCase()}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${beat.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                      {beat.isActive ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-3 line-clamp-2 text-sm sm:text-base">{beat.description}</p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3">
                  <span>{beat.genre}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{beat.bpm} BPM</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{beat.key}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{(beat.mode ?? 'majeur') === 'majeur' ? t('upload.modeMajeur') : t('upload.modeMineur')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{beat.duration}</span>
                </div>

                {/* Pricing Section for List View */}
                <div className="flex items-center gap-3 mb-3">
                  {/* <div className="text-xs text-gray-400 font-medium">{t('admin.pricing')}:</div> */}
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20">
                      <span className="text-xs text-purple-300 font-medium">WAV</span>
                      <span className="text-xs text-white font-semibold">{formatPrice(beat.wavLeasePrice)}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
                      <span className="text-xs text-blue-300 font-medium">Trackout</span>
                      <span className="text-xs text-white font-semibold">{formatPrice(beat.trackoutLeasePrice)}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
                      <span className="text-xs text-green-300 font-medium">Unlimited</span>
                      <span className="text-xs text-white font-semibold">{formatPrice(beat.unlimitedLeasePrice)}</span>
                    </div>
                  </div>
                </div>

                {beat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                    {beat.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:ml-6">
                <Link
                  href={`/admin/beats/${beat.id}`}
                    className="p-2.5 sm:p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all duration-300 touch-manipulation"
                  title="Voir les détails"
                >
                  <Edit className="w-4 h-4 sm:w-4 sm:h-4" />
                </Link>

                <button
                  onClick={() => handleToggleStatus(beat.id, !beat.isActive)}
                  disabled={toggleStatusMutation.isPending}
                  className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation ${beat.isActive
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                    } ${toggleStatusMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={beat.isActive ? 'Désactiver' : 'Activer'}
                >
                  {toggleStatusMutation.isPending ? (
                    <div className="w-4 h-4 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : beat.isActive ? (
                    <Lock className="w-4 h-4 sm:w-4 sm:h-4" />
                  ) : (
                    <Star className="w-4 h-4 sm:w-4 sm:h-4" />
                  )}
                </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {beats.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-card/10 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-border/20 gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
              {t('beats.showingResults', { start: startIndex.toString(), end: endIndex.toString(), total: totalBeats.toString() })}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={page === 1}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-card/20 border border-border/30 rounded-lg text-foreground hover:bg-card/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm touch-manipulation"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('pagination.previous')}</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 3) {
                  pageNum = i + 1;
                } else if (page <= 2) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 1) {
                  pageNum = totalPages - 2 + i;
                } else {
                  pageNum = page - 1 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      'px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation',
                      page === pageNum
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-card/10 text-muted-foreground hover:bg-card/20 hover:text-foreground'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-card/20 border border-border/30 rounded-lg text-foreground hover:bg-card/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-xs sm:text-sm touch-manipulation"
            >
              <span className="hidden sm:inline">{t('pagination.next')}</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message si aucun beat trouvé */}
      {!loading && beats.length === 0 && (
        <div className="text-center py-8 sm:py-16 px-4">
          <div className="text-gray-400 text-base sm:text-lg mb-4">
            {hasActiveFilters ? t('admin.noBeatsWithCriteria') : t('beats.noBeatsAvailable')}
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base touch-manipulation shadow-lg hover:shadow-xl"
            >
              {t('beats.resetFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
