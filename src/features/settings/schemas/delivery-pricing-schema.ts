import { z } from 'zod';

export const deliveryPricingSchema = z
  .object({
    pricePerKilometer: z.coerce.number().finite().min(0),
    fixedDeliveryFee: z.coerce.number().finite().min(0),
    deliveryPricingMode: z.coerce.number().int().min(0).max(1),
    deliveryCashLimitEnabled: z.boolean(),
    deliveryCashLimitAmount: z.coerce.number().finite().min(0),
  })
  .superRefine((value, context) => {
    if (value.deliveryCashLimitEnabled && value.deliveryCashLimitAmount <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryCashLimitAmount'],
        message: 'Cash limit must be greater than zero when enabled.',
      });
    }
  });
