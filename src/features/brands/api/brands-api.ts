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
    const { data } = await apiClient.get<BrandPaginatedResponse>('/api/Brands', {
      params: { page: 1, pageSize: 100 },
    });

    const paginated = toPaginatedData(data, { page: 1, pageSize: 100 });
    return paginated.items.map(mapBrand);
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
