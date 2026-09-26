import { deliveryPricingSchema } from '@/features/settings/schemas/delivery-pricing-schema';
import { apiClient } from '@/services/api/client';

export interface DeliveryPricingSettings {
  pricePerKilometer: number;
  fixedDeliveryFee: number;
  deliveryPricingMode: 0 | 1;
  deliveryCashLimitEnabled: boolean;
  deliveryCashLimitAmount: number;
}

export type UpdateDeliveryPricingSettings = Partial<DeliveryPricingSettings>;

export const deliveryPricingApi = {
  async get(): Promise<DeliveryPricingSettings> {
    const { data } = await apiClient.get<DeliveryPricingSettings>('/api/Options/delivery-pricing');
    return deliveryPricingSchema.parse(data) as DeliveryPricingSettings;
  },

  async update(input: UpdateDeliveryPricingSettings): Promise<DeliveryPricingSettings> {
    const { data } = await apiClient.put<DeliveryPricingSettings>(
      '/api/Options/delivery-pricing',
      input,
    );
    return deliveryPricingSchema.parse(data) as DeliveryPricingSettings;
  },
};
