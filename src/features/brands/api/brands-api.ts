import axios from 'axios';

import type { Brand, BrandInput, BrandsFilter } from '@/features/brands/types/brand-types';
import { apiClient } from '@/services/api/client';
import { getPaginatedItems, toPaginatedData } from '@/services/api/pagination';
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
  async getById(brandId: string): Promise<Brand | null> {
    try {
      const { data } = await apiClient.get<BrandApiResponse>(`/api/Brands/${encodeURIComponent(brandId)}`);
      const brand = mapBrand(data);
      return brand.id ? brand : null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

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

  async getOptions(search = '', signal?: AbortSignal): Promise<Brand[]> {
    // A dropdown must not download every page on mount. The search term is
    // sent to the server so users can still find brands beyond the first page.
    const { data } = await apiClient.get<BrandPaginatedResponse | BrandApiResponse[]>('/api/Brands', {
      params: { page: 1, pageSize: 100, search: search.trim() || undefined },
      signal,
    });
    const items = Array.isArray(data) ? data : getPaginatedItems(data);
    return Array.from(
      new Map(items.map(mapBrand).filter((brand) => brand.id).map((brand) => [brand.id, brand])).values()
    );
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
