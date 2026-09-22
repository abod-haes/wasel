import { z } from 'zod';

export const deliveryPricingSchema = z.object({
  pricePerKilometer: z.coerce.number().finite().min(0),
  fixedDeliveryFee: z.coerce.number().finite().min(0),
});
