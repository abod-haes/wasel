import type { ProductCurrency } from '@/features/products/types/product-types';
import { apiClient } from '@/services/api/client';

export type ProductOfferDiscountType = 'Percentage' | 'FixedPrice';
export type ProductOfferStatus = 'Scheduled' | 'Active' | 'Expired' | 'Disabled';

export interface ProductOfferRequest {
  discountType: ProductOfferDiscountType;
  value: number;
  startsAt: string;
  endsAt: string;
  isEnabled: boolean;
}

export interface ProductOfferResponse {
  id: string;
  productId: string;
  discountType: ProductOfferDiscountType;
  value: number;
  startsAt: string;
  endsAt: string;
  isEnabled: boolean;
  status: ProductOfferStatus;
  originalBasePrice: number;
  finalBasePrice: number;
  savingsBasePrice: number;
  baseCurrency: ProductCurrency;
  createdAt: string;
  updatedAt: string;
}

export const productOffersApi = {
  async getOffers(productId: string): Promise<ProductOfferResponse[]> {
    const { data } = await apiClient.get<ProductOfferResponse[]>(
      `/api/Products/${productId}/offers`
    );
    return data ?? [];
  },

  async createOffer(
    productId: string,
    payload: ProductOfferRequest
  ): Promise<ProductOfferResponse> {
    const { data } = await apiClient.post<ProductOfferResponse>(
      `/api/Products/${productId}/offers`,
      payload
    );
    return data;
  },

  async updateOffer(
    productId: string,
    offerId: string,
    payload: ProductOfferRequest
  ): Promise<ProductOfferResponse> {
    const { data } = await apiClient.put<ProductOfferResponse>(
      `/api/Products/${productId}/offers/${offerId}`,
      payload
    );
    return data;
  },

  async deleteOffer(productId: string, offerId: string): Promise<void> {
    await apiClient.delete(`/api/Products/${productId}/offers/${offerId}`);
  },
};
