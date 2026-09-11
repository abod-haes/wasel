import { RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  useCurrencySettingsQuery,
  useUpdateCurrencySettingsMutation,
} from '@/features/settings/hooks/use-currency-settings-query';
import { currencySettingsSchema } from '@/features/settings/schemas/currency-settings-schema';
import type { ProductDisplayCurrency } from '@/features/settings/types/settings-types';

interface CurrencyFormValues {
  usdToSypRate: string;
  usdToTryRate: string;
  productDisplayCurrency: ProductDisplayCurrency;
}

interface CurrencyFormErrors {
  usdToSypRate?: string;
  usdToTryRate?: string;
  productDisplayCurrency?: string;
}

const emptyValues: CurrencyFormValues = {
  usdToSypRate: '1',
  usdToTryRate: '1',
  productDisplayCurrency: 'USD',
};

export function CurrencySettingsCard(): React.JSX.Element {
  const { i18n } = useTranslation();
  const isArabic = i18n.resolvedLanguage?.startsWith('ar') ?? true;
  const currencyQuery = useCurrencySettingsQuery();
  const updateCurrencyMutation = useUpdateCurrencySettingsMutation();
  const [values, setValues] = useState<CurrencyFormValues>(emptyValues);
  const [errors, setErrors] = useState<CurrencyFormErrors>({});

  const copy = isArabic
    ? {
        title: 'إعدادات عملة المنتجات',
        description:
          'سعر المنتج يُدخل ويُحفظ بالدولار. حدّد سعر صرف الليرة السورية والليرة التركية وعملة العرض التي يعيدها التطبيق.',
        sypRate: 'سعر صرف الدولار إلى الليرة السورية',
        tryRate: 'سعر صرف الدولار إلى الليرة التركية',
        displayCurrency: 'عملة عرض أسعار المنتجات',
        rateHint: 'القيمة تمثل كم تساوي 1 USD من العملة المحددة.',
        preview: 'معاينة أسعار الصرف',
        save: 'حفظ إعدادات العملة',
        loading: 'جاري تحميل إعدادات العملة...',
        error: 'تعذر تحميل إعدادات العملة.',
        retry: 'إعادة المحاولة',
      }
    : {
        title: 'Product currency settings',
        description:
          'Product prices are entered and stored in USD. Configure the SYP and TRY exchange rates and the currency returned for display.',
        sypRate: 'USD to SYP rate',
        tryRate: 'USD to TRY rate',
        displayCurrency: 'Product display currency',
        rateHint: 'The value is the amount of the selected currency equal to 1 USD.',
        preview: 'Exchange-rate preview',
        save: 'Save currency settings',
        loading: 'Loading currency settings...',
        error: 'Could not load currency settings.',
        retry: 'Retry',
      };

  useEffect(() => {
    if (!currencyQuery.data) return;

    setValues({
      usdToSypRate: String(currencyQuery.data.usdToSypRate),
      usdToTryRate: String(currencyQuery.data.usdToTryRate),
      productDisplayCurrency: currencyQuery.data.productDisplayCurrency,
    });
    setErrors({});
  }, [currencyQuery.data]);

  const saveCurrencySettings = (): void => {
    const parsed = currencySettingsSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        usdToSypRate: fieldErrors.usdToSypRate?.[0],
        usdToTryRate: fieldErrors.usdToTryRate?.[0],
        productDisplayCurrency: fieldErrors.productDisplayCurrency?.[0],
      });
      return;
    }

    setErrors({});
    updateCurrencyMutation.mutate(parsed.data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {currencyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{copy.loading}</p>
        ) : currencyQuery.isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{copy.error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void currencyQuery.refetch()}>
              <RefreshCw className="h-4 w-4" />
              {copy.retry}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency-usd-syp">{copy.sypRate}</Label>
                <Input
                  id="currency-usd-syp"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={values.usdToSypRate}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, usdToSypRate: event.target.value }))
                  }
                />
                {errors.usdToSypRate ? (
                  <p className="text-xs text-destructive">{errors.usdToSypRate}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-usd-try">{copy.tryRate}</Label>
                <Input
                  id="currency-usd-try"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={values.usdToTryRate}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, usdToTryRate: event.target.value }))
                  }
                />
                {errors.usdToTryRate ? (
                  <p className="text-xs text-destructive">{errors.usdToTryRate}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>{copy.displayCurrency}</Label>
                <Select
                  value={values.productDisplayCurrency}
                  onValueChange={(productDisplayCurrency) =>
                    setValues((previous) => ({
                      ...previous,
                      productDisplayCurrency: productDisplayCurrency as ProductDisplayCurrency,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SYP">SYP</SelectItem>
                    <SelectItem value="TRY">TRY</SelectItem>
                  </SelectContent>
                </Select>
                {errors.productDisplayCurrency ? (
                  <p className="text-xs text-destructive">{errors.productDisplayCurrency}</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold">{copy.preview}</p>
              <p className="mt-1 text-xs text-muted-foreground">{copy.rateHint}</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span>1 USD = {values.usdToSypRate || '—'} SYP</span>
                <span>1 USD = {values.usdToTryRate || '—'} TRY</span>
                <span>{copy.displayCurrency}: {values.productDisplayCurrency}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="gap-2"
                disabled={updateCurrencyMutation.isPending}
                onClick={saveCurrencySettings}
              >
                <Save className="h-4 w-4" />
                {copy.save}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
