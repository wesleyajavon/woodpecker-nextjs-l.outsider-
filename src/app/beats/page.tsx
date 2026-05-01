'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Music, RotateCcw, SlidersHorizontal, Gauge, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useBeatGenres, useBeats } from '@/hooks/queries/useBeats';
import { useDebounce } from '@/hooks/useDebounce';
import BeatCard from '@/components/BeatCard';
import BeatCardSkeleton from '@/components/BeatCardSkeleton';
import { BeatsStructuredData } from '@/components/BeatsStructuredData';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useApp';
import { BEAT_CONFIG } from '@/config/constants';

const VALID_SORT_VALUES = ['newest', 'oldest', 'price_asc', 'price_desc', 'popular'] as const;
const VALID_LIMIT_VALUES = [4, 8, 12, 24];
const BPM_ABSOLUTE_MIN = 60;
const BPM_ABSOLUTE_MAX = 220;

// BPM range hints from BEAT_CONFIG.bpmRanges
const bpmRangeHint = (() => {
  const ranges = Object.values(BEAT_CONFIG.bpmRanges);
  return {
    min: Math.min(...ranges.map((r) => r.min)),
    max: Math.max(...ranges.map((r) => r.max)),
  };
})();

function parseSearchParams(
  searchParams: URLSearchParams,
  allGenresLabel: string,
  allKeysLabel: string,
  validKeys: readonly string[]
) {
  const search = searchParams.get('search') || '';
  const genreParam = searchParams.get('genre') || allGenresLabel;
  const genre = genreParam.trim() || allGenresLabel;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limitParam = parseInt(searchParams.get('limit') || '4', 10);
  const limit = VALID_LIMIT_VALUES.includes(limitParam) ? limitParam : 4;
  const sortParam = searchParams.get('sortBy') || 'newest';
  const sortBy = VALID_SORT_VALUES.includes(sortParam as (typeof VALID_SORT_VALUES)[number])
    ? (sortParam as (typeof VALID_SORT_VALUES)[number])
    : 'newest';
  const bpmMinParam = searchParams.get('bpmMin');
  const bpmMinRaw = bpmMinParam ? parseInt(bpmMinParam, 10) : NaN;
  const bpmMin = !isNaN(bpmMinRaw) ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMinRaw)) : undefined;
  const bpmMaxParam = searchParams.get('bpmMax');
  const bpmMaxRaw = bpmMaxParam ? parseInt(bpmMaxParam, 10) : NaN;
  const bpmMax = !isNaN(bpmMaxRaw) ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMaxRaw)) : undefined;
  const keyParam = searchParams.get('key') || allKeysLabel;
  const key = keyParam === allKeysLabel || validKeys.includes(keyParam) ? keyParam : allKeysLabel;
  const priceMinParam = searchParams.get('priceMin');
  const priceMin = priceMinParam ? parseFloat(priceMinParam) : undefined;
  const priceMaxParam = searchParams.get('priceMax');
  const priceMax = priceMaxParam ? parseFloat(priceMaxParam) : undefined;
  const hasStems = searchParams.get('hasStems') === 'true';
  return { search, genre, page, limit, sortBy, bpmMin, bpmMax, key, priceMin, priceMax, hasStems };
}

export default function BeatsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const allGenresLabel = t('beats.allGenres');
  const allKeysLabel = t('beats.allKeys');
  const { data: existingGenres = [] } = useBeatGenres();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({ currentTime: 0, duration: 0 });
  const [searchInput, setSearchInput] = useState(
    () => searchParams?.get('search') || ''
  );
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  const paramsForParse = searchParams ?? new URLSearchParams();
  const keys = [allKeysLabel, ...BEAT_CONFIG.keys];
  const { search, genre, page, limit, sortBy, bpmMin, bpmMax, key, priceMin, priceMax, hasStems } = parseSearchParams(
    paramsForParse,
    allGenresLabel,
    allKeysLabel,
    BEAT_CONFIG.keys
  );
  const genres = useMemo(() => {
    const options = new Set<string>([allGenresLabel, ...BEAT_CONFIG.genres, ...existingGenres]);
    if (genre !== allGenresLabel) options.add(genre);
    return Array.from(options);
  }, [allGenresLabel, existingGenres, genre]);

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
      const query = params.toString();
      router.replace(query ? `/beats?${query}` : '/beats', { scroll: false });
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
    error,
  } = useBeats({
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
    sortBy,
  });

  const beats = useMemo(() => beatsData?.data || [], [beatsData?.data]);
  const totalBeats = beatsData?.pagination?.total || 0;
  const totalPages = beatsData?.pagination?.totalPages || Math.ceil(totalBeats / limit);
  
  // Gestion de la lecture/arrêt
  const togglePlay = useCallback(async (beatId: string, previewUrl?: string) => {
    if (playingBeat === beatId) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingBeat(null);
      setProgress({ currentTime: 0, duration: 0 });
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Start new audio if preview URL exists
      if (previewUrl) {
        try {
          const audio = new Audio(previewUrl);
          audioRef.current = audio;
          
          setProgress({ currentTime: 0, duration: 0 });
          
          audio.addEventListener('loadedmetadata', () => {
            setProgress((p) => ({ ...p, duration: audio.duration }));
          });
          
          audio.addEventListener('timeupdate', () => {
            setProgress((p) => ({ ...p, currentTime: audio.currentTime }));
          });
          
          audio.addEventListener('canplaythrough', () => {
            setPlayingBeat(beatId);
          });
          
          audio.addEventListener('error', () => {
            console.error('Error playing audio');
            setPlayingBeat(null);
          });
          
          audio.addEventListener('ended', () => {
            setPlayingBeat(null);
            setProgress({ currentTime: 0, duration: 0 });
            audioRef.current = null;
          });
          
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          setPlayingBeat(null);
        }
      }
    }
  }, [playingBeat]);

  // Cleanup audio when component unmounts or playingBeat changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when playingBeat changes to null
  useEffect(() => {
    if (!playingBeat && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [playingBeat]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress((p) => ({ ...p, currentTime: time }));
    }
  }, []);

  // Space key: toggle play/pause when a beat is playing or focus is within a BeatCard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const target = e.target as HTMLElement;
      const isTyping = target.closest('input, textarea, [contenteditable="true"]');
      if (isTyping) return;

      const focusedCard = document.activeElement?.closest('[data-beat-card]') as HTMLElement | null;
      const beatIdFromCard = focusedCard?.getAttribute('data-beat-id');

      if (playingBeat) {
        e.preventDefault();
        togglePlay(playingBeat);
        return;
      }
      if (beatIdFromCard) {
        e.preventDefault();
        const beat = beats.find((b) => b.id === beatIdFromCard);
        if (beat?.previewUrl) togglePlay(beat.id, beat.previewUrl);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingBeat, beats, togglePlay]);

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalBeats);

  const goToPage = (newPage: number) => {
    updateUrl({ page: Math.max(1, Math.min(newPage, totalPages)) });
  };

  const goToPreviousPage = () => {
    if (page > 1) updateUrl({ page: page - 1 });
  };

  const goToNextPage = () => {
    if (page < totalPages) updateUrl({ page: page + 1 });
  };

  const handleSearch = (term: string) => {
    setSearchInput(term);
  };

  const handleGenreFilter = (newGenre: string) => {
    updateUrl({ genre: newGenre, resetPage: true });
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
      page: 1,
    });
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    updateUrl({ limit: newLimit, page: 1 });
  };

  const handleSortChange = (newSortBy: string) => {
    updateUrl({ sortBy: newSortBy, resetPage: true });
  };

  const hasSearchFilter = search.trim() !== '';
  const hasGenreFilter = genre !== allGenresLabel;
  const hasSortFilter = sortBy !== 'newest';
  const hasBpmFilter = bpmMin != null || bpmMax != null;
  const hasKeyFilter = key !== allKeysLabel;
  const hasPriceFilter = (priceMin != null && priceMin > 0) || (priceMax != null && priceMax > 0);
  const hasStemsFilter = hasStems;
  const activeFiltersCount = [
    hasSearchFilter,
    hasGenreFilter,
    hasSortFilter,
    hasBpmFilter,
    hasKeyFilter,
    hasPriceFilter,
    hasStemsFilter,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background pt-20">
        <DottedSurface className="size-full z-0 opacity-70" />
        <div aria-hidden="true" className="audio-scanlines pointer-events-none absolute inset-0 z-0 opacity-35" />
        
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

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Breadcrumb */}
          <nav aria-label={t('nav.breadcrumb')} className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">
                <span>{t('nav.beats')}</span>
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 text-lg mb-4">{t('beats.errorLoading')}</p>
              <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : String(error)}</p>
              <button
                onClick={() => handleResetFilters()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('beats.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-20">
      <DottedSurface className="size-full z-0 opacity-70" />
      <div aria-hidden="true" className="audio-scanlines pointer-events-none absolute inset-0 z-0 opacity-35" />
      
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

      <div className="signal-glow fixed left-4 top-4 z-[5001] hidden items-center gap-3 rounded-xl border border-primary/20 bg-background/80 px-4 py-3 text-foreground shadow-lg shadow-primary/5 backdrop-blur-lg md:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Music className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold">{t('beats.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('nav.beats')}</p>
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-[1500px] px-4 py-4 sm:py-6">
        <BeatsStructuredData beats={beats} />
        {/* Breadcrumb */}
        <nav aria-label={t('nav.breadcrumb')} className="sr-only">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                {t('nav.home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">
              <span>{t('nav.beats')}</span>
            </li>
          </ol>
        </nav>

        {/* Compact page context */}
        <div className="mb-4 flex flex-col gap-2 px-1 md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="signal-glow flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('beats.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('beats.description')}</p>
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="signal-glow mb-4 rounded-xl border border-primary/15 bg-card/20 p-3 shadow-sm backdrop-blur-lg sm:mb-5 sm:p-4"
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Barre de recherche */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={t('beats.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full touch-manipulation rounded-lg border border-primary/20 bg-card/30 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:py-3 sm:pl-10 sm:pr-4 sm:text-base"
              />
            </div>

            {/* Filtres et contrôles */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Filtre par genre */}
              <div className="flex items-center gap-2 flex-1">
                <Filter className="text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <select
                  value={genre}
                  onChange={(e) => handleGenreFilter(e.target.value)}
                  className="w-full touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-4 sm:py-3 sm:text-base"
                >
                  {genres.map((g) => (
                    <option key={g} value={g} className="bg-card text-foreground">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par tonalité */}
              <select
                value={key}
                onChange={(e) => updateUrl({ key: e.target.value, resetPage: true })}
                className="w-full touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto sm:px-4 sm:py-3 sm:text-base"
                aria-label={t('beats.keyFilter')}
              >
                {keys.map((k) => (
                  <option key={k} value={k} className="bg-card text-foreground">
                    {k}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto sm:px-4 sm:py-3 sm:text-base"
              >
                <option value="newest" className="bg-card text-foreground">{t('beats.sortNewest')}</option>
                <option value="oldest" className="bg-card text-foreground">{t('beats.sortOldest')}</option>
                <option value="price_asc" className="bg-card text-foreground">{t('beats.sortPriceAsc')}</option>
                <option value="price_desc" className="bg-card text-foreground">{t('beats.sortPriceDesc')}</option>
                <option value="popular" className="bg-card text-foreground">{t('beats.sortPopular')}</option>
              </select>

              {/* Items per page selector */}
              <select
                value={limit}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="w-full touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-auto sm:px-4 sm:py-3 sm:text-base"
              >
                <option value={4} className="bg-card text-foreground">{t('beats.itemsPerPage', { count: '4' })}</option>
                <option value={8} className="bg-card text-foreground">{t('beats.itemsPerPage', { count: '8' })}</option>
                <option value={12} className="bg-card text-foreground">{t('beats.itemsPerPage', { count: '12' })}</option>
                <option value={24} className="bg-card text-foreground">{t('beats.itemsPerPage', { count: '24' })}</option>
              </select>

              {/* Toggle de vue */}
              <div className="flex items-center gap-1 sm:gap-2 bg-card/20 rounded-lg p-1 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 sm:p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 sm:p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Badge et bouton Réinitialiser (visibles quand des filtres sont actifs) */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span
                    className="inline-flex items-center rounded-lg border border-primary/30 bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary sm:text-sm"
                    aria-live="polite"
                  >
                    {activeFiltersCount === 1
                      ? t('beats.activeFiltersCount', { count: '1' })
                      : t('beats.activeFiltersCount_plural', { count: String(activeFiltersCount) })}
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2.5 bg-card/20 border border-border/30 rounded-lg text-xs sm:text-sm text-foreground hover:bg-card/30 hover:border-border/50 transition-colors touch-manipulation w-full sm:w-auto justify-center"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t('beats.resetFilters')}
                  </button>
                </div>
              )}
            </div>

            {/* Filtres avancés - collapsible sur mobile, aligné avec les filtres principaux */}
            <div className="border-t border-border/15 pt-3 sm:pt-4 mt-1 sm:mt-0">
              <button
                type="button"
                onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-primary/20 bg-card/20 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-card/30 sm:hidden"
                aria-expanded={advancedFiltersOpen}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  {t('beats.advancedFilters')}
                </span>
                {advancedFiltersOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  advancedFiltersOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
                  'sm:!max-h-none sm:!opacity-100'
                )}
              >
                <div className="flex flex-wrap items-end gap-3 sm:gap-4 pt-2 sm:pt-0">
                  {/* BPM range - style aligné avec les selects */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Gauge className="text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 hidden sm:block" />
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      <label htmlFor="bpm-min" className="sr-only">
                        {t('beats.bpmRange')} min
                      </label>
                      <input
                        id="bpm-min"
                        type="number"
                        min={BPM_ABSOLUTE_MIN}
                        max={BPM_ABSOLUTE_MAX}
                        placeholder={String(bpmRangeHint.min)}
                        value={bpmMin ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                          updateUrl({ bpmMin: !isNaN(v as number) ? v : undefined, resetPage: true });
                        }}
                        aria-label={`${t('beats.bpmRange')} min (${bpmRangeHint.min}-${bpmRangeHint.max})`}
                        className="w-20 touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:w-24 sm:py-3 sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-muted-foreground text-sm font-medium" aria-hidden="true">–</span>
                      <label htmlFor="bpm-max" className="sr-only">
                        {t('beats.bpmRange')} max
                      </label>
                      <input
                        id="bpm-max"
                        type="number"
                        min={BPM_ABSOLUTE_MIN}
                        max={BPM_ABSOLUTE_MAX}
                        placeholder={String(bpmRangeHint.max)}
                        value={bpmMax ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                          updateUrl({ bpmMax: !isNaN(v as number) ? v : undefined, resetPage: true });
                        }}
                        aria-label={`${t('beats.bpmRange')} max (${bpmRangeHint.min}-${bpmRangeHint.max})`}
                        className="w-20 touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:w-24 sm:py-3 sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">BPM</span>
                  </div>

                  {/* Avec stems - style pill aligné */}
                  <label className="flex min-h-[44px] cursor-pointer touch-manipulation items-center gap-2.5 rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 transition-colors hover:border-primary/35 hover:bg-card/40 sm:min-h-[48px] sm:py-3">
                    <input
                      type="checkbox"
                      checked={hasStems}
                      onChange={(e) => updateUrl({ hasStems: e.target.checked, resetPage: true })}
                      className="h-4 w-4 rounded border-border/50 bg-card/20 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm sm:text-base text-foreground select-none">{t('beats.withStems')}</span>
                  </label>

                  {/* Plus de filtres (prix) - section expandable stylée */}
                  <div className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
                      className="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/35 hover:bg-card/40 sm:min-h-[48px] sm:w-auto sm:justify-start sm:py-3 sm:text-base"
                      aria-expanded={moreFiltersOpen}
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        {t('beats.moreFilters')}
                      </span>
                      {moreFiltersOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-200',
                        moreFiltersOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="flex flex-wrap items-end gap-3 sm:gap-4 pt-3 pl-1">
                        <div className="flex flex-col gap-1.5 min-w-[100px] flex-1 sm:flex-initial">
                          <label htmlFor="price-min" className="text-xs font-medium text-muted-foreground">
                            {t('beats.priceMin')}
                          </label>
                          <input
                            id="price-min"
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0"
                            value={priceMin ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              updateUrl({ priceMin: v != null && !isNaN(v) ? v : undefined, resetPage: true });
                            }}
                            className="w-full min-w-[100px] touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:py-3 sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-[100px] flex-1 sm:flex-initial">
                          <label htmlFor="price-max" className="text-xs font-medium text-muted-foreground">
                            {t('beats.priceMax')}
                          </label>
                          <input
                            id="price-max"
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="∞"
                            value={priceMax ?? ''}
                            onChange={(e) => {
                              const v = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              updateUrl({ priceMax: v != null && !isNaN(v) ? v : undefined, resetPage: true });
                            }}
                            className="w-full min-w-[100px] touch-manipulation rounded-lg border border-primary/20 bg-card/30 px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary sm:py-3 sm:text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* aria-live region for results count - never empty, announces filter/page updates to screen readers */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-3 min-h-[1.25rem] text-center text-xs text-muted-foreground sm:text-left sm:text-sm"
        >
          {loading && beats.length === 0
            ? t('beats.loadingBeats')
            : beats.length > 0
              ? t('beats.showingResults', {
                  start: startIndex.toString(),
                  end: endIndex.toString(),
                  total: totalBeats.toString(),
                })
              : t('beats.noBeatsAvailable')}
        </div>

        {/* Grille des beats */}
        {loading && beats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <BeatCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : beats.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`grid gap-7 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {beats.map((beat, index) => (
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <BeatCard
                    beat={beat}
                    isPlaying={playingBeat === beat.id}
                    onPlay={togglePlay}
                    onPause={togglePlay}
                    progress={playingBeat === beat.id ? progress : undefined}
                    onSeek={playingBeat === beat.id ? handleSeek : undefined}
                    className={viewMode === 'list' ? 'flex items-center' : ''}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="signal-glow mt-8 rounded-xl border border-primary/15 bg-card/20 p-4 backdrop-blur-lg sm:mt-12 sm:p-6"
              >
                {/* Pagination controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 sm:gap-2">
                  {/* Previous button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-card/10 border border-border/20 rounded-lg text-xs sm:text-sm text-foreground hover:bg-card/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation w-full sm:w-auto justify-center"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t('pagination.previous')}</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 sm:gap-1">
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
                          className={`px-3 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                            page === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card/10 text-muted-foreground hover:bg-card/20'
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
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-card/10 border border-border/20 rounded-lg text-xs sm:text-sm text-foreground hover:bg-card/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation w-full sm:w-auto justify-center"
                  >
                    <span className="hidden sm:inline">{t('pagination.next')}</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
              {t('beats.noBeatsAvailable')}
            </div>
            <button
              onClick={handleResetFilters}
              className="touch-manipulation rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 sm:px-6 sm:py-3 sm:text-base"
            >
              {t('beats.resetFilters')}
            </button>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center flex justify-center mt-12 sm:mt-16 px-4"
        >
          <Link href="/contact">
            <HoverBorderGradient
              containerClassName="rounded-xl sm:rounded-2xl"
              className="inline-flex items-center gap-2 text-foreground px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 touch-manipulation"
              duration={1.5}
              clockwise={true}
            >
{t('beats.customBeatCTA')}
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
            </HoverBorderGradient>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
