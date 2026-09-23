import type { LanguageCode } from '@/types/i18n';

export type ProductDisplayCurrency = 'USD' | 'SYP' | 'TRY';

export interface WorkspaceSettings {
  displayName: string;
  language: LanguageCode;
  compactSidebar: boolean;
}

export interface CurrencySettings {
  usdToSypRate: number;
  usdToTryRate: number;
  productDisplayCurrency: ProductDisplayCurrency;
}

export type UpdateWorkspaceSettingsInput = Partial<WorkspaceSettings>;
export type UpdateCurrencySettingsInput = Partial<CurrencySettings>;
