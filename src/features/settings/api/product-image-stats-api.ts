import { apiClient } from '@/services/api/client';

export interface ProductImageStats {
  productsWithImage: number;
  productsWithoutImage: number;
  productsWithBrokenImages: number;
  variantImages: number;
  variantsWithoutImage: number;
}

export const productImageStatsApi = {
  async getStats(): Promise<ProductImageStats> {
    const { data } = await apiClient.get<ProductImageStats>('/api/Products/image-stats');
    return data;
  },
};
