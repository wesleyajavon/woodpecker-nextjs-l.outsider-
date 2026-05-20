'use client';

import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Gauge,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { catalogInputClass, catalogPanelClass, catalogSelectClass } from '@/components/catalog/catalog-styles';
import { useTranslation } from '@/hooks/useApp';

interface BeatsFilterBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  genre: string;
  genres: string[];
  onGenreChange: (genre: string) => void;
  keyValue: string;
  keys: string[];
  onKeyChange: (key: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  bpmMin?: number;
  bpmMax?: number;
  bpmRangeHint: { min: number; max: number };
  bpmAbsoluteMin: number;
  bpmAbsoluteMax: number;
  onBpmMinChange: (value: number | undefined) => void;
  onBpmMaxChange: (value: number | undefined) => void;
  hasStems: boolean;
  onHasStemsChange: (value: boolean) => void;
  priceMin?: number;
  priceMax?: number;
  onPriceMinChange: (value: number | undefined) => void;
  onPriceMaxChange: (value: number | undefined) => void;
  advancedFiltersOpen: boolean;
  onAdvancedFiltersToggle: () => void;
  moreFiltersOpen: boolean;
  onMoreFiltersToggle: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export function BeatsFilterBar({
  searchInput,
  onSearchChange,
  genre,
  genres,
  onGenreChange,
  keyValue,
  keys,
  onKeyChange,
  sortBy,
  onSortChange,
  limit,
  onLimitChange,
  viewMode,
  onViewModeChange,
  bpmMin,
  bpmMax,
  bpmRangeHint,
  bpmAbsoluteMin,
  bpmAbsoluteMax,
  onBpmMinChange,
  onBpmMaxChange,
  hasStems,
  onHasStemsChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  advancedFiltersOpen,
  onAdvancedFiltersToggle,
  moreFiltersOpen,
  onMoreFiltersToggle,
  hasActiveFilters,
  activeFiltersCount,
  onResetFilters,
}: BeatsFilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(catalogPanelClass, 'mb-6 p-4 sm:p-5')}>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t('beats.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(catalogInputClass, 'pl-9')}
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            className={cn(catalogSelectClass, 'lg:min-w-[160px] lg:flex-1')}
            aria-label={t('beats.allGenres')}
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-[#0a0a0a] text-foreground">
                {g}
              </option>
            ))}
          </select>

          <select
            value={keyValue}
            onChange={(e) => onKeyChange(e.target.value)}
            className={cn(catalogSelectClass, 'lg:min-w-[120px]')}
            aria-label={t('beats.keyFilter')}
          >
            {keys.map((k) => (
              <option key={k} value={k} className="bg-[#0a0a0a] text-foreground">
                {k}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={cn(catalogSelectClass, 'lg:min-w-[160px]')}
          >
            <option value="newest" className="bg-[#0a0a0a]">{t('beats.sortNewest')}</option>
            <option value="oldest" className="bg-[#0a0a0a]">{t('beats.sortOldest')}</option>
            <option value="price_asc" className="bg-[#0a0a0a]">{t('beats.sortPriceAsc')}</option>
            <option value="price_desc" className="bg-[#0a0a0a]">{t('beats.sortPriceDesc')}</option>
            <option value="popular" className="bg-[#0a0a0a]">{t('beats.sortPopular')}</option>
          </select>

          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className={cn(catalogSelectClass, 'lg:min-w-[130px]')}
          >
            {[4, 8, 12, 24].map((count) => (
              <option key={count} value={count} className="bg-[#0a0a0a]">
                {t('beats.itemsPerPage', { count: String(count) })}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02] p-1">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-black'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-black'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-white/15 hover:bg-white/[0.04] hover:text-foreground sm:text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('beats.resetFilters')}</span>
                <span className="rounded-full border border-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                  {activeFiltersCount}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-white/6 pt-4">
          <button
            type="button"
            onClick={onAdvancedFiltersToggle}
            className="flex w-full items-center justify-between rounded-lg border border-white/8 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/[0.03] sm:hidden"
            aria-expanded={advancedFiltersOpen}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              {t('beats.advancedFilters')}
            </span>
            {advancedFiltersOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          <div
            className={cn(
              'overflow-hidden transition-all duration-200 sm:!max-h-none sm:!opacity-100',
              advancedFiltersOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0',
            )}
          >
            <div className="flex flex-wrap items-end gap-3 pt-3 sm:gap-4 sm:pt-0">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Gauge className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                <div className="flex flex-1 items-center gap-2 sm:flex-initial">
                  <input
                    id="bpm-min"
                    type="number"
                    min={bpmAbsoluteMin}
                    max={bpmAbsoluteMax}
                    placeholder={String(bpmRangeHint.min)}
                    value={bpmMin ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      onBpmMinChange(!isNaN(v as number) ? v : undefined);
                    }}
                    aria-label={`${t('beats.bpmRange')} min`}
                    className={cn(catalogInputClass, 'w-20 sm:w-24 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
                  />
                  <span className="text-sm text-muted-foreground">–</span>
                  <input
                    id="bpm-max"
                    type="number"
                    min={bpmAbsoluteMin}
                    max={bpmAbsoluteMax}
                    placeholder={String(bpmRangeHint.max)}
                    value={bpmMax ?? ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      onBpmMaxChange(!isNaN(v as number) ? v : undefined);
                    }}
                    aria-label={`${t('beats.bpmRange')} max`}
                    className={cn(catalogInputClass, 'w-20 sm:w-24 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none')}
                  />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  BPM
                </span>
              </div>

              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={hasStems}
                  onChange={(e) => onHasStemsChange(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-white focus:ring-white/20"
                />
                <span className="text-sm text-foreground">{t('beats.withStems')}</span>
              </label>

              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onMoreFiltersToggle}
                  className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.04] sm:w-auto sm:justify-start"
                  aria-expanded={moreFiltersOpen}
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {t('beats.moreFilters')}
                  </span>
                  {moreFiltersOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    moreFiltersOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-wrap gap-3 pt-3">
                    <div className="min-w-[120px] flex-1 space-y-1.5 sm:flex-initial">
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
                          onPriceMinChange(v != null && !isNaN(v) ? v : undefined);
                        }}
                        className={catalogInputClass}
                      />
                    </div>
                    <div className="min-w-[120px] flex-1 space-y-1.5 sm:flex-initial">
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
                          onPriceMaxChange(v != null && !isNaN(v) ? v : undefined);
                        }}
                        className={catalogInputClass}
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
  );
}
