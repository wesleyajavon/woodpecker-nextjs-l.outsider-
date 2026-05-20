'use client';

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useBeatGenres, useBeats } from '@/hooks/queries/useBeats';
import { useDebounce } from '@/hooks/useDebounce';
import { CatalogBeatCard } from '@/components/catalog/CatalogBeatCard';
import { CatalogBeatCardSkeleton } from '@/components/catalog/CatalogBeatCardSkeleton';
import { BeatsStructuredData } from '@/components/BeatsStructuredData';
import { HomeBackground } from '@/components/home/HomeBackground';
import { BeatsFilterBar } from '@/components/beats/BeatsFilterBar';
import { Button } from '@/components/ui/Button';
import { catalogPanelClass } from '@/components/catalog/catalog-styles';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useApp';
import { BEAT_CONFIG } from '@/config/constants';

const VALID_SORT_VALUES = ['newest', 'oldest', 'price_asc', 'price_desc', 'popular'] as const;
const VALID_LIMIT_VALUES = [4, 8, 12, 24];
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
  searchParams: URLSearchParams,
  allGenresLabel: string,
  allKeysLabel: string,
  validKeys: readonly string[],
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
  const bpmMin = !isNaN(bpmMinRaw)
    ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMinRaw))
    : undefined;
  const bpmMaxParam = searchParams.get('bpmMax');
  const bpmMaxRaw = bpmMaxParam ? parseInt(bpmMaxParam, 10) : NaN;
  const bpmMax = !isNaN(bpmMaxRaw)
    ? Math.max(BPM_ABSOLUTE_MIN, Math.min(BPM_ABSOLUTE_MAX, bpmMaxRaw))
    : undefined;
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
  const [progress, setProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });
  const [searchInput, setSearchInput] = useState(() => searchParams?.get('search') || '');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  const paramsForParse = searchParams ?? new URLSearchParams();
  const keys = [allKeysLabel, ...BEAT_CONFIG.keys];
  const { search, genre, page, limit, sortBy, bpmMin, bpmMax, key, priceMin, priceMax, hasStems } =
    parseSearchParams(paramsForParse, allGenresLabel, allKeysLabel, BEAT_CONFIG.keys);

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
        if (typeof updates.bpmMin === 'number' && !isNaN(updates.bpmMin))
          params.set('bpmMin', String(updates.bpmMin));
        else params.delete('bpmMin');
      }
      if ('bpmMax' in updates) {
        if (typeof updates.bpmMax === 'number' && !isNaN(updates.bpmMax))
          params.set('bpmMax', String(updates.bpmMax));
        else params.delete('bpmMax');
      }
      if ('key' in updates) {
        if (updates.key && updates.key !== allKeysLabel) params.set('key', updates.key);
        else params.delete('key');
      }
      if ('priceMin' in updates) {
        if (
          typeof updates.priceMin === 'number' &&
          !isNaN(updates.priceMin) &&
          updates.priceMin >= 0
        )
          params.set('priceMin', String(updates.priceMin));
        else params.delete('priceMin');
      }
      if ('priceMax' in updates) {
        if (
          typeof updates.priceMax === 'number' &&
          !isNaN(updates.priceMax) &&
          updates.priceMax >= 0
        )
          params.set('priceMax', String(updates.priceMax));
        else params.delete('priceMax');
      }
      if ('hasStems' in updates) {
        if (updates.hasStems) params.set('hasStems', 'true');
        else params.delete('hasStems');
      }
      const query = params.toString();
      router.replace(query ? `/beats?${query}` : '/beats', { scroll: false });
    },
    [searchParams, router, allGenresLabel, allKeysLabel],
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

  const togglePlay = useCallback(
    async (beatId: string, previewUrl?: string) => {
      if (playingBeat === beatId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPlayingBeat(null);
        setProgress({ currentTime: 0, duration: 0 });
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

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
            audio.addEventListener('canplaythrough', () => setPlayingBeat(beatId));
            audio.addEventListener('error', () => setPlayingBeat(null));
            audio.addEventListener('ended', () => {
              setPlayingBeat(null);
              setProgress({ currentTime: 0, duration: 0 });
              audioRef.current = null;
            });

            await audio.play();
          } catch (playError) {
            console.error('Error playing audio:', playError);
            setPlayingBeat(null);
          }
        }
      }
    },
    [playingBeat],
  );

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const startIndex = totalBeats > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = Math.min(page * limit, totalBeats);

  const goToPage = (newPage: number) => {
    updateUrl({ page: Math.max(1, Math.min(newPage, totalPages)) });
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

  const hasSearchFilter = search.trim() !== '';
  const hasGenreFilter = genre !== allGenresLabel;
  const hasSortFilter = sortBy !== 'newest';
  const hasBpmFilter = bpmMin != null || bpmMax != null;
  const hasKeyFilter = key !== allKeysLabel;
  const hasPriceFilter =
    (priceMin != null && priceMin > 0) || (priceMax != null && priceMax > 0);
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

  const resultsLabel =
    loading && beats.length === 0
      ? t('beats.loadingBeats')
      : beats.length > 0
        ? t('beats.showingResults', {
            start: startIndex.toString(),
            end: endIndex.toString(),
            total: totalBeats.toString(),
          })
        : t('beats.noBeatsAvailable');

  const pageShell = (content: ReactNode) => (
    <div className="relative min-h-screen overflow-hidden bg-background pt-20 pb-16">
      <HomeBackground />
      <div className="container relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <nav aria-label={t('nav.breadcrumb')} className="sr-only">
          <ol>
            <li>
              <Link href="/">{t('nav.home')}</Link>
            </li>
            <li>{t('nav.beats')}</li>
          </ol>
        </nav>
        {content}
      </div>
    </div>
  );

  if (error) {
    return pageShell(
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="mb-2 text-lg font-medium text-red-300">{t('beats.errorLoading')}</p>
          <p className="mb-6 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <Button onClick={handleResetFilters} variant="outline" className="border-white/12">
            {t('beats.retry')}
          </Button>
        </div>
      </div>,
    );
  }

  return pageShell(
    <>
      <BeatsStructuredData beats={beats} />

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 border-b border-white/6 pb-8 pt-2"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {t('nav.beats')}
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('beats.title')}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('beats.description')}
            </p>
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground lg:text-right"
          >
            {totalBeats > 0 ? `${totalBeats} beats` : resultsLabel}
          </p>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <BeatsFilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          genre={genre}
          genres={genres}
          onGenreChange={(value) => updateUrl({ genre: value, resetPage: true })}
          keyValue={key}
          keys={keys}
          onKeyChange={(value) => updateUrl({ key: value, resetPage: true })}
          sortBy={sortBy}
          onSortChange={(value) => updateUrl({ sortBy: value, resetPage: true })}
          limit={limit}
          onLimitChange={(value) => updateUrl({ limit: value, page: 1 })}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          bpmMin={bpmMin}
          bpmMax={bpmMax}
          bpmRangeHint={bpmRangeHint}
          bpmAbsoluteMin={BPM_ABSOLUTE_MIN}
          bpmAbsoluteMax={BPM_ABSOLUTE_MAX}
          onBpmMinChange={(value) => updateUrl({ bpmMin: value, resetPage: true })}
          onBpmMaxChange={(value) => updateUrl({ bpmMax: value, resetPage: true })}
          hasStems={hasStems}
          onHasStemsChange={(value) => updateUrl({ hasStems: value, resetPage: true })}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={(value) => updateUrl({ priceMin: value, resetPage: true })}
          onPriceMaxChange={(value) => updateUrl({ priceMax: value, resetPage: true })}
          advancedFiltersOpen={advancedFiltersOpen}
          onAdvancedFiltersToggle={() => setAdvancedFiltersOpen((open) => !open)}
          moreFiltersOpen={moreFiltersOpen}
          onMoreFiltersToggle={() => setMoreFiltersOpen((open) => !open)}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          onResetFilters={handleResetFilters}
        />
      </motion.div>

      <p className="mb-6 font-mono text-xs text-muted-foreground sm:text-sm">{resultsLabel}</p>

      {loading && beats.length === 0 ? (
        <div
          className={cn(
            'grid gap-4 sm:gap-5',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
              : 'grid-cols-1',
          )}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <CatalogBeatCardSkeleton key={i} layout={viewMode} />
          ))}
        </div>
      ) : beats.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              'grid gap-4 sm:gap-5',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                : 'grid-cols-1',
            )}
          >
            {beats.map((beat) => (
              <CatalogBeatCard
                key={beat.id}
                beat={beat}
                layout={viewMode}
                isPlaying={playingBeat === beat.id}
                onPlay={togglePlay}
                onPause={togglePlay}
                progress={playingBeat === beat.id ? progress : undefined}
                onSeek={playingBeat === beat.id ? handleSeek : undefined}
              />
            ))}
          </motion.div>

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={cn(catalogPanelClass, 'mt-10 flex flex-col items-center justify-center gap-3 p-4 sm:flex-row sm:justify-end sm:p-5')}
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-white/10 px-4 text-sm text-foreground transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('pagination.previous')}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
                        page === pageNum
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
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-white/10 px-4 text-sm text-foreground transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {t('pagination.next')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-20 text-center">
          <p className="mb-6 text-muted-foreground">{t('beats.noBeatsAvailable')}</p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="rounded-full border-white/12 hover:bg-white/[0.04]"
          >
            {t('beats.resetFilters')}
          </Button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16 flex justify-center border-t border-white/6 pt-12"
      >
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-11 rounded-full border-white/12 bg-transparent px-6 text-sm font-medium hover:bg-white/[0.04]"
        >
          <Link href="/contact">
            {t('beats.customBeatCTA')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </>,
  );
}
