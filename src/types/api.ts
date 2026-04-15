export interface ApiPaginatedResult<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  TotalCount: number;
}
