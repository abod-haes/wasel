import type { Brand, BrandInput, BrandsFilter } from '@/features/brands/types/brand-types';
import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { ApiPaginatedResult, PaginatedData, PaginationParams } from '@/types/api';

interface BrandApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
}

type BrandPaginatedResponse = Partial<ApiPaginatedResult<BrandApiResponse>> & {
  items?: BrandApiResponse[];
};

const mapBrand = (brand: BrandApiResponse): Brand => ({
  id: brand.id ?? brand.Id ?? '',
  name: brand.name ?? brand.Name ?? '',
});

export const brandsApi = {
  async getBrands(filters: BrandsFilter, pagination: PaginationParams): Promise<PaginatedData<Brand>> {
    const { data } = await apiClient.get<BrandPaginatedResponse>('/api/Brands', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search.trim() || undefined,
      },
    });

    const paginated = toPaginatedData(data, pagination);
    return { ...paginated, items: paginated.items.map(mapBrand) };
  },

  async getOptions(): Promise<Brand[]> {
    const pageSize = 100;
    const maxPages = 50; // Safety limit if the API ignores pagination.
    const brands = new Map<string, Brand>();

    for (let page = 1; page <= maxPages; page += 1) {
      const { data } = await apiClient.get<BrandPaginatedResponse | BrandApiResponse[]>('/api/Brands', {
        params: { page, pageSize },
      });
      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data.Items) ? data.Items : Array.isArray(data.items) ? data.items : [];
      if (rawItems.length === 0) break;

      const sizeBefore = brands.size;
      for (const item of rawItems) {
        const brand = mapBrand(item);
        if (brand.id) brands.set(brand.id, brand);
      }

      // Stop if the backend returns the same page over and over.
      if (brands.size === sizeBefore || Array.isArray(data)) break;
      const totalPages = !Array.isArray(data) ? (data as { totalPages?: number; TotalPages?: number }).totalPages ?? (data as { TotalPages?: number }).TotalPages : undefined;
      const totalCount = 'TotalCount' in data ? data.TotalCount : undefined;
      const computedPages = totalCount ? Math.ceil(totalCount / pageSize) : undefined;
      if (page >= (totalPages ?? computedPages ?? (rawItems.length < pageSize ? page : maxPages))) break;
    }

    return [...brands.values()];
  },

  async createBrand(input: BrandInput): Promise<Brand> {
    const { data } = await apiClient.post<BrandApiResponse>('/api/Brands', {
      name: input.name.trim(),
    });
    return mapBrand(data);
  },

  async updateBrand(id: string, input: BrandInput): Promise<Brand> {
    const { data } = await apiClient.put<BrandApiResponse>(`/api/Brands/${id}`, {
      name: input.name.trim(),
    });
    return mapBrand(data);
  },

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/api/Brands/${id}`);
  },
};
