import { RefreshCw, Save, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui';
import {
  useDeliveryPricingQuery,
  useUpdateDeliveryPricingMutation,
} from '@/features/settings/hooks/use-delivery-pricing-query';
import { deliveryPricingSchema } from '@/features/settings/schemas/delivery-pricing-schema';

export function DeliveryPricingCard(): React.JSX.Element {
  const query = useDeliveryPricingQuery();
  const mutation = useUpdateDeliveryPricingMutation();
  const [pricePerKilometer, setPricePerKilometer] = useState('');
  const [fixedDeliveryFee, setFixedDeliveryFee] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.data) return;
    setPricePerKilometer(String(query.data.pricePerKilometer));
    setFixedDeliveryFee(String(query.data.fixedDeliveryFee));
    setError('');
  }, [query.data]);

  const save = (): void => {
    const parsed = deliveryPricingSchema.safeParse({
      pricePerKilometer,
      fixedDeliveryFee,
    });

    if (!parsed.success) {
      setError('القيم يجب أن تكون أرقامًا أكبر من أو تساوي صفر.');
      return;
    }

    setError('');
    mutation.mutate(parsed.data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <CardTitle>تسعير التوصيل</CardTitle>
        </div>
        <CardDescription>
          الرسم الثابت هو المعروض حاليًا في تطبيق العميل، بينما سعر الكيلومتر محفوظ لنموذج المسار.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">جاري تحميل إعدادات التوصيل...</p>
        ) : query.isError ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">تعذر تحميل إعدادات التوصيل.</p>
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-price-km">السعر لكل كيلومتر</Label>
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
                <Label htmlFor="delivery-fixed-fee">رسم التوصيل الثابت</Label>
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

            <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground">
              تطبيق العميل يعتمد حاليًا <strong className="text-foreground">fixedDeliveryFee</strong> و
              <strong className="text-foreground"> fixedTotalAmount</strong>.
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <div className="flex justify-end">
              <Button className="gap-2" disabled={mutation.isPending} onClick={save}>
                <Save className="h-4 w-4" />
                حفظ إعدادات التوصيل
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
