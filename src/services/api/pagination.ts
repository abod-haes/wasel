import type { ApiPaginatedResult, PaginatedData, PaginationParams } from '@/types/api';

type ApiPaginatedEnvelope<T> = Partial<ApiPaginatedResult<T>> & {
  items?: T[];
  page?: number;
  Page?: number;
  currentPage?: number;
  CurrentPage?: number;
  pageSize?: number;
  PageSize?: number;
  perPage?: number;
  PerPage?: number;
  totalCount?: number;
  TotalCount?: number;
  totalPages?: number;
  TotalPages?: number;
};

const getPositiveNumber = (...values: Array<number | undefined>): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return undefined;
};

export const getPaginatedItems = <T>(data: ApiPaginatedEnvelope<T>): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

export const toPaginatedData = <T>(
  data: ApiPaginatedEnvelope<T>,
  fallback: PaginationParams
): PaginatedData<T> => {
  const items = getPaginatedItems(data);
  const page =
    getPositiveNumber(data.Page, data.page, data.CurrentPage, data.currentPage, fallback.page) ??
    fallback.page;
  const pageSize =
    getPositiveNumber(data.PageSize, data.pageSize, data.PerPage, data.perPage, fallback.pageSize) ??
    fallback.pageSize;
  const totalCount = getPositiveNumber(data.TotalCount, data.totalCount) ?? items.length;
  const totalPages =
    getPositiveNumber(data.TotalPages, data.totalPages) ?? Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
  };
};

export const paginateLocalData = <T>(items: T[], pagination: PaginationParams): PaginatedData<T> => {
  const pageSize = Math.max(1, pagination.pageSize);
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(1, pagination.page), totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    totalCount,
    totalPages,
  };
};
