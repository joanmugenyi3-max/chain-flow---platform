// packages/shared/src/utils/pagination.ts
// Helpers for building pagination metadata and Prisma-compatible query args.

import type { PaginatedResponse, PaginationParams } from '@chainflow/types';

// ─────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  offset: number;
}

export interface PrismaFindManyArgs {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  offset: number;
}

// ─────────────────────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────────────────────

/**
 * Normalise raw pagination query params, clamping to safe defaults.
 */
export function normalizePagination(params: PaginationParams = {}): NormalizedPagination {
  const page = Math.max(1, Math.floor(Number(params.page) || DEFAULT_PAGE));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(params.limit) || DEFAULT_LIMIT)),
  );
  const offset = calculateOffset(page, limit);
  return { page, limit, offset };
}

/**
 * Calculate the zero-based record offset from a 1-based page number.
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Build a full PaginationMeta object from a total count and normalised params.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  const safePage = Math.min(page, totalPages);
  return {
    total,
    page: safePage,
    limit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    offset: calculateOffset(safePage, limit),
  };
}

/**
 * Build a `PaginatedResponse<T>` wrapper around a data array.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const meta = buildPaginationMeta(total, page, limit);
  return {
    data,
    meta: {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: meta.totalPages,
      hasNextPage: meta.hasNextPage,
      hasPreviousPage: meta.hasPreviousPage,
    },
  };
}

/**
 * Build the Prisma `findMany` arguments (skip, take, orderBy) from pagination params.
 */
export function buildPaginationQuery(params: PaginationParams = {}): PrismaFindManyArgs {
  const { page, limit, offset } = normalizePagination(params);

  const result: PrismaFindManyArgs = {
    skip: offset,
    take: limit,
  };

  if (params.sortBy) {
    result.orderBy = {
      [params.sortBy]: params.sortOrder === 'desc' ? 'desc' : 'asc',
    };
  }

  return result;
}

/**
 * Generate an array of page numbers for a pagination UI component.
 * Always includes first and last page; uses ellipsis (0) to indicate gaps.
 *
 * @example
 * generatePageNumbers(5, 12) → [1, 2, 3, 4, 5, 0, 12]
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  delta = 2,
): number[] {
  if (totalPages <= 1) {
    return [1];
  }

  const pages: number[] = [];
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    }
  }

  const withEllipsis: number[] = [];
  let prev: number | undefined;

  for (const p of pages) {
    if (prev !== undefined) {
      if (p - prev === 2) {
        withEllipsis.push(prev + 1);
      } else if (p - prev > 2) {
        withEllipsis.push(0); // 0 = ellipsis
      }
    }
    withEllipsis.push(p);
    prev = p;
  }

  return withEllipsis;
}

/**
 * Build URL query string params from pagination options.
 */
export function buildPaginationQueryString(
  page: number,
  limit: number,
  additionalParams: Record<string, string | number | boolean | undefined> = {},
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));

  for (const [key, value] of Object.entries(additionalParams)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  return params.toString();
}
