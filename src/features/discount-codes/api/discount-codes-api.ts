import type {
  DiscountCode,
  DiscountCodeRequest,
} from '@/features/discount-codes/types/discount-code-types';
import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { ApiPaginatedResult, PaginatedData, PaginationParams } from '@/types/api';

type DiscountCodesResponse = Partial<ApiPaginatedResult<DiscountCode>> & {
  items?: DiscountCode[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
};

export const discountCodesApi = {
  async getDiscountCodes(
    pagination: PaginationParams
  ): Promise<PaginatedData<DiscountCode>> {
    const { data } = await apiClient.get<DiscountCodesResponse>('/api/DiscountCodes/admin', {
      params: pagination,
    });

    return toPaginatedData(data, pagination);
  },

  async createDiscountCode(payload: DiscountCodeRequest): Promise<DiscountCode> {
    const { data } = await apiClient.post<DiscountCode>('/api/DiscountCodes/admin', payload);
    return data;
  },

  async updateDiscountCode(
    id: string,
    payload: DiscountCodeRequest
  ): Promise<DiscountCode> {
    const { data } = await apiClient.put<DiscountCode>(
      `/api/DiscountCodes/admin/${id}`,
      payload
    );
    return data;
  },

  async deleteDiscountCode(id: string): Promise<void> {
    await apiClient.delete(`/api/DiscountCodes/admin/${id}`);
  },
};
