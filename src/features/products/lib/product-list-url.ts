import { ROUTES } from '@/constants/routes';
import type { ProductsFilter } from '@/features/products/types/product-types';
import type { PaginationParams } from '@/types/api';

export const defaultProductFilters: ProductsFilter = {
  search: '',
  categoryId: 'all',
};

export const defaultProductPagination: PaginationParams = {
  page: 1,
  pageSize: 10,
};

const productListParamKeys = ['search', 'categoryId', 'page', 'pageSize'] as const;

const parsePositiveInteger = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

export const readProductListUrlState = (
  searchParams: URLSearchParams
): { filters: ProductsFilter; pagination: PaginationParams } => {
  return {
    filters: {
      search: searchParams.get('search') ?? defaultProductFilters.search,
      categoryId: searchParams.get('categoryId') || defaultProductFilters.categoryId,
    },
    pagination: {
      page: parsePositiveInteger(searchParams.get('page'), defaultProductPagination.page),
      pageSize: parsePositiveInteger(searchParams.get('pageSize'), defaultProductPagination.pageSize),
    },
  };
};

export const createProductListSearchParams = (
  filters: ProductsFilter,
  pagination: PaginationParams
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (filters.search) {
    searchParams.set('search', filters.search);
  }

  if (filters.categoryId !== defaultProductFilters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  if (pagination.page !== defaultProductPagination.page) {
    searchParams.set('page', String(pagination.page));
  }

  if (pagination.pageSize !== defaultProductPagination.pageSize) {
    searchParams.set('pageSize', String(pagination.pageSize));
  }

  return searchParams;
};

export const copyProductListSearchParams = (source: URLSearchParams): URLSearchParams => {
  const searchParams = new URLSearchParams();

  productListParamKeys.forEach((key) => {
    const value = source.get(key);

    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
};

export const appendProductListSearchParams = (path: string, source: URLSearchParams): string => {
  const query = copyProductListSearchParams(source).toString();
  return query ? `${path}?${query}` : path;
};

export const buildProductsListRoute = (source: URLSearchParams): string => {
  return appendProductListSearchParams(ROUTES.products, source);
};
