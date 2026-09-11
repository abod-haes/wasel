import { z } from 'zod';

const exchangeRateSchema = z.coerce
  .number()
  .finite()
  .positive('Exchange rate must be greater than 0');

export const currencySettingsSchema = z.object({
  usdToSypRate: exchangeRateSchema,
  usdToTryRate: exchangeRateSchema,
  productDisplayCurrency: z.enum(['USD', 'SYP', 'TRY']),
});

export const updateCurrencySettingsSchema = currencySettingsSchema.partial();

export type CurrencySettingsSchema = z.infer<typeof currencySettingsSchema>;
