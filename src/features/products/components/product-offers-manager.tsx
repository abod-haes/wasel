import { useMemo, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import type {
  ProductOfferDiscountType,
  ProductOfferRequest,
  ProductOfferResponse,
  ProductOfferStatus,
} from '@/features/products/api/product-offers-api';
import {
  useCreateProductOfferMutation,
  useDeleteProductOfferMutation,
  useProductOffersQuery,
  useUpdateProductOfferMutation,
} from '@/features/products/hooks/use-product-offers-query';
import type { Product } from '@/features/products/types/product-types';

interface ProductOffersManagerProps {
  product: Product;
}

interface OfferFormState {
  discountType: ProductOfferDiscountType;
  value: string;
  startsAt: string;
  endsAt: string;
  isEnabled: boolean;
}

const emptyForm = (): OfferFormState => ({
  discountType: 'Percentage',
  value: '',
  startsAt: '',
  endsAt: '',
  isEnabled: true,
});

const toLocalDateTimeValue = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

const toRequest = (form: OfferFormState): ProductOfferRequest => ({
  discountType: form.discountType,
  value: Number(form.value),
  startsAt: new Date(form.startsAt).toISOString(),
  endsAt: new Date(form.endsAt).toISOString(),
  isEnabled: form.isEnabled,
});

const statusVariant = (status: ProductOfferStatus) => {
  switch (status) {
    case 'Active':
      return 'success' as const;
    case 'Scheduled':
      return 'warning' as const;
    case 'Disabled':
      return 'danger' as const;
    case 'Expired':
    default:
      return 'outline' as const;
  }
};

const statusLabel: Record<ProductOfferStatus, string> = {
  Active: 'نشط',
  Scheduled: 'مجدول',
  Expired: 'منتهي',
  Disabled: 'معطل',
};

const typeLabel: Record<ProductOfferDiscountType, string> = {
  Percentage: 'نسبة مئوية',
  FixedPrice: 'سعر ثابت',
};

const formatMoney = (value: number): string =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export function ProductOffersManager({
  product,
}: ProductOffersManagerProps): React.JSX.Element {
  const offersQuery = useProductOffersQuery(product.id);
  const createMutation = useCreateProductOfferMutation();
  const updateMutation = useUpdateProductOfferMutation();
  const deleteMutation = useDeleteProductOfferMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ProductOfferResponse | null>(null);
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const basePrice = product.basePrice ?? product.price;
  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const offers = useMemo(() => offersQuery.data ?? [], [offersQuery.data]);

  const openCreate = (): void => {
    setEditingOffer(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (offer: ProductOfferResponse): void => {
    setEditingOffer(offer);
    setForm({
      discountType: offer.discountType,
      value: String(offer.value),
      startsAt: toLocalDateTimeValue(offer.startsAt),
      endsAt: toLocalDateTimeValue(offer.endsAt),
      isEnabled: offer.isEnabled,
    });
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const value = Number(form.value);
    const start = new Date(form.startsAt).getTime();
    const end = new Date(form.endsAt).getTime();

    if (!Number.isFinite(value)) {
      toast.error('أدخل قيمة صحيحة للعرض');
      return false;
    }
    if (!form.startsAt || !form.endsAt || Number.isNaN(start) || Number.isNaN(end)) {
      toast.error('حدد تاريخ ووقت بداية ونهاية العرض');
      return false;
    }
    if (end <= start) {
      toast.error('وقت نهاية العرض يجب أن يكون بعد وقت البداية');
      return false;
    }
    if (form.discountType === 'Percentage' && (value <= 0 || value > 100)) {
      toast.error('نسبة الخصم يجب أن تكون أكبر من 0 وحتى 100');
      return false;
    }
    if (form.discountType === 'FixedPrice' && (value < 0 || value >= basePrice)) {
      toast.error('السعر الثابت يجب أن يكون أقل من السعر الأساسي للمنتج');
      return false;
    }
    return true;
  };

  const submit = (): void => {
    if (!validate()) return;

    const payload = toRequest(form);
    const onSuccess = () => setDialogOpen(false);

    if (editingOffer) {
      updateMutation.mutate(
        { productId: product.id, offerId: editingOffer.id, payload },
        { onSuccess }
      );
      return;
    }

    createMutation.mutate({ productId: product.id, payload }, { onSuccess });
  };

  const toggleOffer = (offer: ProductOfferResponse, isEnabled: boolean): void => {
    updateMutation.mutate({
      productId: product.id,
      offerId: offer.id,
      payload: {
        discountType: offer.discountType,
        value: offer.value,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
        isEnabled,
      },
    });
  };

  const removeOffer = (offer: ProductOfferResponse): void => {
    if (!window.confirm('هل تريد حذف هذا العرض؟')) return;
    deleteMutation.mutate({ productId: product.id, offerId: offer.id });
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">العروض والخصومات</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              السعر الأساسي: {formatMoney(basePrice)} USD — حالة العرض والسعر النهائي محسوبان من الباك إند.
            </p>
          </div>
        </div>
        <Button type="button" onClick={openCreate} disabled={isMutating}>
          <Plus className="me-2 h-4 w-4" />
          إضافة عرض
        </Button>
      </div>

      {offersQuery.isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">جاري تحميل العروض...</div>
      ) : offersQuery.isError ? (
        <div className="space-y-3 p-8 text-center">
          <p className="text-sm text-destructive">تعذر تحميل عروض هذا المنتج.</p>
          <Button variant="outline" type="button" onClick={() => void offersQuery.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          لا يوجد عروض مضافة لهذا المنتج حالياً.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">النوع</th>
                <th className="px-4 py-3 text-start">القيمة</th>
                <th className="px-4 py-3 text-start">السعر الأصلي</th>
                <th className="px-4 py-3 text-start">السعر النهائي</th>
                <th className="px-4 py-3 text-start">التوفير</th>
                <th className="px-4 py-3 text-start">البداية</th>
                <th className="px-4 py-3 text-start">النهاية</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">مفعل</th>
                <th className="px-4 py-3 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-medium">{typeLabel[offer.discountType]}</td>
                  <td className="px-4 py-3">
                    {offer.discountType === 'Percentage'
                      ? `${formatMoney(offer.value)}%`
                      : `${formatMoney(offer.value)} USD`}
                  </td>
                  <td className="px-4 py-3">{formatMoney(offer.originalBasePrice)} USD</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatMoney(offer.finalBasePrice)} USD
                  </td>
                  <td className="px-4 py-3">{formatMoney(offer.savingsBasePrice)} USD</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(offer.startsAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(offer.endsAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(offer.status)}>{statusLabel[offer.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={offer.isEnabled}
                      disabled={isMutating}
                      onCheckedChange={(checked) => toggleOffer(offer, checked)}
                      aria-label={offer.isEnabled ? 'تعطيل العرض' : 'تفعيل العرض'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isMutating}
                        onClick={() => openEdit(offer)}
                        aria-label="تعديل العرض"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isMutating}
                        onClick={() => removeOffer(offer)}
                        aria-label="حذف العرض"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
            <DialogDescription>
              استخدم توقيت جهازك، وسيتم إرسال التاريخ بصيغة ISO-8601 للباك إند.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>نوع الخصم</Label>
              <Select
                value={form.discountType}
                onValueChange={(value: ProductOfferDiscountType) =>
                  setForm((current) => ({ ...current, discountType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">نسبة مئوية</SelectItem>
                  <SelectItem value="FixedPrice">سعر نهائي ثابت</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{form.discountType === 'Percentage' ? 'نسبة الخصم' : 'السعر النهائي (USD)'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(event) =>
                  setForm((current) => ({ ...current, value: event.target.value }))
                }
                placeholder={form.discountType === 'Percentage' ? 'مثال: 20' : 'مثال: 7.50'}
              />
            </div>

            <div className="space-y-2">
              <Label>يبدأ في</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startsAt: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>ينتهي في</Label>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endsAt: event.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-4 sm:col-span-2">
              <div>
                <p className="font-medium">تفعيل العرض</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  يمكن حفظ عرض معطل ثم تفعيله لاحقاً.
                </p>
              </div>
              <Switch
                checked={form.isEnabled}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, isEnabled: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
