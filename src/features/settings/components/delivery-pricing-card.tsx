import { RefreshCw, Save, Truck } from 'lucide-react';
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
  Switch,
} from '@/components/ui';
import {
  useDeliveryPricingQuery,
  useUpdateDeliveryPricingMutation,
} from '@/features/settings/hooks/use-delivery-pricing-query';
import { deliveryPricingSchema } from '@/features/settings/schemas/delivery-pricing-schema';

export function DeliveryPricingCard(): React.JSX.Element {
  const { t } = useTranslation();
  const query = useDeliveryPricingQuery();
  const mutation = useUpdateDeliveryPricingMutation();
  const [pricePerKilometer, setPricePerKilometer] = useState('');
  const [fixedDeliveryFee, setFixedDeliveryFee] = useState('');
  const [deliveryPricingMode, setDeliveryPricingMode] = useState<0 | 1>(0);
  const [cashLimitEnabled, setCashLimitEnabled] = useState(false);
  const [cashLimitAmount, setCashLimitAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.data) return;
    setPricePerKilometer(String(query.data.pricePerKilometer));
    setFixedDeliveryFee(String(query.data.fixedDeliveryFee));
    setDeliveryPricingMode(query.data.deliveryPricingMode);
    setCashLimitEnabled(query.data.deliveryCashLimitEnabled);
    setCashLimitAmount(String(query.data.deliveryCashLimitAmount));
    setError('');
  }, [query.data]);

  const save = (): void => {
    const parsed = deliveryPricingSchema.safeParse({
      pricePerKilometer,
      fixedDeliveryFee,
      deliveryPricingMode,
      deliveryCashLimitEnabled: cashLimitEnabled,
      deliveryCashLimitAmount: cashLimitAmount,
    });

    if (!parsed.success) {
      setError(
        cashLimitEnabled && Number(cashLimitAmount) <= 0
          ? t('deliveryPricing.cashLimitPositive')
          : t('deliveryPricing.invalidValues'),
      );
      return;
    }

    setError('');
    mutation.mutate({
      ...parsed.data,
      deliveryPricingMode: parsed.data.deliveryPricingMode as 0 | 1,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <CardTitle>{t('deliveryPricing.title')}</CardTitle>
        </div>
        <CardDescription>{t('deliveryPricing.description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : query.isError ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{t('deliveryPricing.loadError')}</p>
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              <RefreshCw className="h-4 w-4" />
              {t('deliveryPricing.retry')}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label>{t('deliveryPricing.mode')}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={deliveryPricingMode === 0 ? 'default' : 'outline'}
                  onClick={() => setDeliveryPricingMode(0)}
                >
                  {t('deliveryPricing.distanceBased')}
                </Button>
                <Button
                  type="button"
                  variant={deliveryPricingMode === 1 ? 'default' : 'outline'}
                  onClick={() => setDeliveryPricingMode(1)}
                >
                  {t('deliveryPricing.fixed')}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-price-km">{t('deliveryPricing.pricePerKm')}</Label>
                <Input
                  id="delivery-price-km"
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerKilometer}
                  onChange={(event) => setPricePerKilometer(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-fixed-fee">{t('deliveryPricing.fixedFee')}</Label>
                <Input
                  id="delivery-fixed-fee"
                  type="number"
                  min="0"
                  step="any"
                  value={fixedDeliveryFee}
                  onChange={(event) => setFixedDeliveryFee(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="delivery-cash-limit">{t('deliveryPricing.cashLimit')}</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('deliveryPricing.cashLimitDescription')}
                  </p>
                </div>
                <Switch
                  id="delivery-cash-limit"
                  checked={cashLimitEnabled}
                  onCheckedChange={setCashLimitEnabled}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="delivery-cash-limit-amount">
                  {t('deliveryPricing.cashLimitAmount')}
                </Label>
                <Input
                  id="delivery-cash-limit-amount"
                  type="number"
                  min="0"
                  step="any"
                  disabled={!cashLimitEnabled}
                  value={cashLimitAmount}
                  onChange={(event) => setCashLimitAmount(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground">
              {t('deliveryPricing.authoritativeHint')}
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <div className="flex justify-end">
              <Button className="gap-2" disabled={mutation.isPending} onClick={save}>
                <Save className="h-4 w-4" />
                {t('deliveryPricing.save')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
