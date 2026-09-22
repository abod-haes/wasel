import { deliveryPricingSchema } from '@/features/settings/schemas/delivery-pricing-schema';
import { apiClient } from '@/services/api/client';

export interface DeliveryPricingSettings {
  pricePerKilometer: number;
  fixedDeliveryFee: number;
}

export const deliveryPricingApi = {
  async get(): Promise<DeliveryPricingSettings> {
    const { data } = await apiClient.get<DeliveryPricingSettings>('/api/Options/delivery-pricing');
    return deliveryPricingSchema.parse(data);
  },

  async update(input: DeliveryPricingSettings): Promise<DeliveryPricingSettings> {
    const payload = deliveryPricingSchema.parse(input);
    const { data } = await apiClient.put<DeliveryPricingSettings>(
      '/api/Options/delivery-pricing',
      payload,
    );
    return deliveryPricingSchema.parse(data);
  },
};
