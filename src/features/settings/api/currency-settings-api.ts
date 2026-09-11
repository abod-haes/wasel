import { env } from '@/env';
import {
  currencySettingsSchema,
  updateCurrencySettingsSchema,
} from '@/features/settings/schemas/currency-settings-schema';
import type {
  CurrencySettings,
  ProductDisplayCurrency,
  UpdateCurrencySettingsInput,
} from '@/features/settings/types/settings-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

interface CurrencySettingsApiResponse {
  usdToSypRate?: number;
  UsdToSypRate?: number;
  usdToTryRate?: number;
  UsdToTryRate?: number;
  productDisplayCurrency?: ProductDisplayCurrency;
  ProductDisplayCurrency?: ProductDisplayCurrency;
}

let currencySettingsDb: CurrencySettings = {
  usdToSypRate: 1,
  usdToTryRate: 1,
  productDisplayCurrency: 'USD',
};

const mapCurrencySettings = (data?: CurrencySettingsApiResponse | null): CurrencySettings => {
  return currencySettingsSchema.parse({
    usdToSypRate: data?.usdToSypRate ?? data?.UsdToSypRate ?? 1,
    usdToTryRate: data?.usdToTryRate ?? data?.UsdToTryRate ?? 1,
    productDisplayCurrency:
      data?.productDisplayCurrency ?? data?.ProductDisplayCurrency ?? 'USD',
  });
};

export const currencySettingsApi = {
  async getCurrencySettings(): Promise<CurrencySettings> {
    if (env.enableMockApi) {
      await delay(250);
      return { ...currencySettingsDb };
    }

    const { data } = await apiClient.get<CurrencySettingsApiResponse>('/api/Options/currency');
    return mapCurrencySettings(data);
  },

  async updateCurrencySettings(payload: UpdateCurrencySettingsInput): Promise<CurrencySettings> {
    const parsed = updateCurrencySettingsSchema.parse(payload);

    if (env.enableMockApi) {
      await delay(350);
      currencySettingsDb = currencySettingsSchema.parse({
        ...currencySettingsDb,
        ...parsed,
      });
      return { ...currencySettingsDb };
    }

    const { data } = await apiClient.put<CurrencySettingsApiResponse>('/api/Options/currency', parsed);
    return mapCurrencySettings(data);
  },
};
