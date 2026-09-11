import { useEffect, useMemo, useState } from 'react';

import { FormField } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { AdMediaUploader } from '@/features/ads/components/ad-media-uploader';
import { adFieldsSchema, validateAdMediaFile } from '@/features/ads/schemas/ad-form-schema';
import type { Ad, AdFormPayload } from '@/features/ads/types/ad-types';
import type { ProductBrief } from '@/features/products/types/product-types';

interface AdFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  defaultAd?: Ad;
  products: ProductBrief[];
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AdFormPayload) => void;
}

interface FormValues {
  title: string;
  description: string;
  order: string;
  productId: string;
  mediaFile?: File;
}

const emptyValues: FormValues = {
  title: '',
  description: '',
  order: '0',
  productId: 'none',
  mediaFile: undefined,
};

export function AdFormDialog({
  open,
  mode,
  defaultAd,
  products,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: AdFormDialogProps): React.JSX.Element {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (mode === 'edit' && defaultAd) {
      setValues({
        title: defaultAd.title ?? '',
        description: defaultAd.description ?? '',
        order: String(defaultAd.order),
        productId: defaultAd.productId ?? 'none',
        mediaFile: undefined,
      });
      return;
    }
    setValues(emptyValues);
  }, [defaultAd, mode, open]);

  const currentProductMissing = useMemo(() => {
    if (!defaultAd?.productId) return false;
    return !products.some((product) => product.id === defaultAd.productId);
  }, [defaultAd?.productId, products]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const mediaError = validateAdMediaFile(values.mediaFile, mode === 'create');
    const parsed = adFieldsSchema.safeParse({
      title: values.title,
      description: values.description,
      order: values.order,
      productId: values.productId,
    });

    if (!parsed.success || mediaError) {
      const fieldErrors = parsed.success ? undefined : parsed.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors?.title?.[0],
        description: fieldErrors?.description?.[0],
        order: fieldErrors?.order?.[0],
        productId: fieldErrors?.productId?.[0],
        mediaFile: mediaError,
      });
      return;
    }

    setErrors({});
    onSubmit({
      media: values.mediaFile,
      title: parsed.data.title,
      description: parsed.data.description,
      order: parsed.data.order,
      productId: parsed.data.productId === 'none' ? undefined : parsed.data.productId,
    });
  };

  const canChooseNoProduct = mode === 'create' || !defaultAd?.productId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة إعلان' : 'تعديل الإعلان'}</DialogTitle>
          <DialogDescription>
            يدعم صورة أو GIF أو فيديو. ملف الوسائط مطلوب عند إنشاء الإعلان، واختياري عند التعديل.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitHandler} className="space-y-5">
          <FormField labelKey="ملف الإعلان" htmlFor="ad-media" required={mode === 'create'} error={errors.mediaFile}>
            <AdMediaUploader
              id="ad-media"
              value={values.mediaFile}
              currentMediaPath={mode === 'edit' ? defaultAd?.mediaPath : undefined}
              currentMediaType={mode === 'edit' ? defaultAd?.mediaType : undefined}
              disabled={isSubmitting}
              onChange={(mediaFile) => setValues((previous) => ({ ...previous, mediaFile }))}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField labelKey="العنوان" htmlFor="ad-title" error={errors.title}>
              <Input
                id="ad-title"
                value={values.title}
                maxLength={200}
                placeholder="عنوان اختياري"
                onChange={(event) => setValues((previous) => ({ ...previous, title: event.target.value }))}
              />
            </FormField>
            <FormField labelKey="الترتيب" htmlFor="ad-order" error={errors.order}>
              <Input
                id="ad-order"
                type="number"
                step="1"
                value={values.order}
                onChange={(event) => setValues((previous) => ({ ...previous, order: event.target.value }))}
              />
            </FormField>
          </div>

          <FormField labelKey="الوصف" htmlFor="ad-description" error={errors.description}>
            <Textarea
              id="ad-description"
              rows={3}
              maxLength={1024}
              value={values.description}
              placeholder="وصف اختياري للحملة"
              onChange={(event) => setValues((previous) => ({ ...previous, description: event.target.value }))}
            />
          </FormField>

          <FormField labelKey="المنتج المرتبط" error={errors.productId}>
            <Select
              value={values.productId}
              onValueChange={(productId) => setValues((previous) => ({ ...previous, productId }))}
            >
              <SelectTrigger><SelectValue placeholder="اختر منتجًا" /></SelectTrigger>
              <SelectContent>
                {canChooseNoProduct ? <SelectItem value="none">بدون ربط بمنتج</SelectItem> : null}
                {currentProductMissing && defaultAd?.productId ? (
                  <SelectItem value={defaultAd.productId}>
                    {defaultAd.product?.name || 'المنتج المرتبط حاليًا'}
                  </SelectItem>
                ) : null}
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}{product.parCode ? ` — ${product.parCode}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mode === 'edit' && defaultAd?.productId ? (
              <p className="mt-2 text-xs text-muted-foreground">
                العقد الحالي يسمح بتغيير المنتج، لكنه لا يعرّف قيمة لفك ارتباط ProductId الموجود؛ لذلك خيار بدون منتج غير متاح لهذا الإعلان.
              </p>
            ) : null}
          </FormField>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>{mode === 'create' ? 'إنشاء الإعلان' : 'حفظ التعديلات'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
