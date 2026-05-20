/** Default page size for public FAQ listing */
export const FAQ_PAGE_SIZE_DEFAULT = 10;

/** Maximum items per page (P0 guard) */
export const FAQ_PAGE_SIZE_MAX = 50;

export function clampFaqPagination(page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const rawLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : FAQ_PAGE_SIZE_DEFAULT;
  const safeLimit = Math.min(FAQ_PAGE_SIZE_MAX, Math.max(1, rawLimit));
  return { page: safePage, limit: safeLimit };
}

export interface FAQCategoryDto {
  slug: string;
  displayName: string;
  icon: string | null;
}

export interface FAQItemDto {
  id: string;
  category: string;
  categoryName: string;
  question: string;
  answer: string;
  shortAnswer: string | null;
  featured: boolean;
  slug: string | null;
}

export interface FAQListResponse {
  faqs: FAQItemDto[];
  categories: FAQCategoryDto[];
  totalCount: number;
  totalActiveCount: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  cached?: boolean;
  error?: string;
}
