export interface ApiPaginatedResult<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  TotalCount: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
