import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormField, ImageUploader } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
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
import type { CategoryOption } from '@/features/categories/types/category-types';
import { createProductSchema } from '@/features/products/schemas/product-form-schema';
import type { CreateProductInput, Product } from '@/features/products/types/product-types';

interface ProductFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  defaultProduct?: Product;
  isSubmitting?: boolean;
  categories: CategoryOption[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateProductInput) => void;
}

interface VariantFormValues {
  localId: string;
  id?: string;
  name: string;
  imageFile?: File;
  imagePath: string;
  sortOrder: string;
  isDefault: boolean;
}

interface FormValues {
  name: string;
  code: string;
  brand: string;
  type: string;
  weight: string;
  description: string;
  price: string;
  imageFile?: File;
  categoryId: string;
  variants: VariantFormValues[];
}

type ProductFormTab = 'details' | 'variants';

const buildVariantLocalId = (): string => {
  return `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const buildEmptyVariantRow = (sortOrder: number, isDefault = false): VariantFormValues => ({
  localId: buildVariantLocalId(),
  name: '',
  imageFile: undefined,
  imagePath: '',
  sortOrder: String(sortOrder),
  isDefault,
});

const ensureDefaultVariant = (variants: VariantFormValues[]): VariantFormValues[] => {
  if (variants.length === 0 || variants.some((variant) => variant.isDefault)) {
    return variants;
  }

  return variants.map((variant, index) => ({
    ...variant,
    isDefault: index === 0,
  }));
};

const mapProductVariantsToRows = (product?: Product): VariantFormValues[] => {
  const variants = product?.variants ?? [];

  return ensureDefaultVariant(
    [...variants]
      .sort((firstVariant, secondVariant) => firstVariant.sortOrder - secondVariant.sortOrder)
      .map((variant, index) => ({
        localId: buildVariantLocalId(),
        id: variant.id,
        name: variant.name,
        imageFile: undefined,
        imagePath: variant.imagePath ?? '',
        sortOrder: String(variant.sortOrder ?? index),
        isDefault: variant.isDefault,
      }))
  );
};

const parseOptionalNumber = (value: string): number | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const defaultFormValues: FormValues = {
  name: '',
  code: '',
  brand: '',
  type: '',
  weight: '',
  description: '',
  price: '',
  imageFile: undefined,
  categoryId: 'none',
  variants: [],
};

export function ProductFormDialog({
  open,
  mode,
  defaultProduct,
  isSubmitting = false,
  categories,
  onOpenChange,
  onSubmit,
}: ProductFormDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<ProductFormTab>('details');
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab('details');
    setErrors({});

    if (mode === 'edit' && defaultProduct) {
      setFormValues({
        name: defaultProduct.name,
        code: defaultProduct.code,
        brand: defaultProduct.brand ?? '',
        type: defaultProduct.type ?? '',
        weight: defaultProduct.weight != null ? String(defaultProduct.weight) : '',
        description: defaultProduct.description ?? '',
        price: String(defaultProduct.price),
        imageFile: undefined,
        categoryId: defaultProduct.categories[0]?.id ?? 'none',
        variants: mapProductVariantsToRows(defaultProduct),
      });
      return;
    }

    setFormValues({ ...defaultFormValues, variants: [] });
  }, [defaultProduct, mode, open]);

  const dialogTitleKey = mode === 'create' ? 'products.createProduct' : 'products.editProduct';
  const hasVariantsError = Boolean(errors.variants);

  function updateVariantRow<Key extends keyof VariantFormValues>(
    localId: string,
    key: Key,
    value: VariantFormValues[Key]
  ): void {
    setFormValues((previous) => ({
      ...previous,
      variants: previous.variants.map((variant) =>
        variant.localId === localId
          ? {
              ...variant,
              [key]: value,
            }
          : variant
      ),
    }));
  }

  const addVariantRow = (): void => {
    setFormValues((previous) => ({
      ...previous,
      variants: [
        ...previous.variants,
        buildEmptyVariantRow(previous.variants.length, previous.variants.length === 0),
      ],
    }));
  };

  const addVariantRowAndOpenTab = (): void => {
    addVariantRow();
    setActiveTab('variants');
  };

  const removeVariantRow = (localId: string): void => {
    setFormValues((previous) => ({
      ...previous,
      variants: ensureDefaultVariant(previous.variants.filter((variant) => variant.localId !== localId)),
    }));
  };

  const setDefaultVariant = (localId: string, checked: boolean): void => {
    setFormValues((previous) => ({
      ...previous,
      variants: previous.variants.map((variant) => ({
        ...variant,
        isDefault: checked ? variant.localId === localId : variant.localId === localId ? false : variant.isDefault,
      })),
    }));
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedCategoryId = formValues.categoryId === 'none' ? undefined : formValues.categoryId;
    const selectedCategory = categories.find((category) => category.id === normalizedCategoryId);
    const preparedVariants = formValues.variants
      .map((variant, index) => ({
        id: variant.id,
        name: variant.name.trim(),
        imageFile: variant.imageFile,
        imagePath: variant.imagePath.trim() || undefined,
        sortOrder: Number.isFinite(Number(variant.sortOrder)) ? Number(variant.sortOrder) : index,
        isDefault: variant.isDefault,
      }))
      .filter((variant) => Boolean(variant.name || variant.imageFile || variant.imagePath));

    const parsed = createProductSchema.safeParse({
      name: formValues.name,
      code: formValues.code,
      brand: formValues.brand,
      type: formValues.type,
      weight: parseOptionalNumber(formValues.weight),
      description: formValues.description,
      price: Number(formValues.price),
      imageFile: formValues.imageFile,
      categoryId: normalizedCategoryId,
      categoryName: selectedCategory?.name,
      variants: preparedVariants,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const nextErrors: Partial<Record<keyof FormValues, string>> = {
        name: fieldErrors.name?.[0],
        code: fieldErrors.code?.[0],
        brand: fieldErrors.brand?.[0],
        type: fieldErrors.type?.[0],
        weight: fieldErrors.weight?.[0],
        description: fieldErrors.description?.[0],
        price: fieldErrors.price?.[0],
        imageFile: fieldErrors.imageFile?.[0],
        categoryId: fieldErrors.categoryId?.[0],
        variants: fieldErrors.variants?.[0],
      };

      setErrors(nextErrors);
      setActiveTab(nextErrors.variants ? 'variants' : 'details');
      return;
    }

    setErrors({});
    onSubmit({
      ...parsed.data,
      variants: parsed.data.variants ?? [],
    });
  };

  const renderTabButton = (tab: ProductFormTab, label: string, count?: number): React.JSX.Element => {
    const isActive = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
        }`}
      >
        <span>{label}</span>
        {count != null ? (
          <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
        ) : null}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-5">
          <div className="inline-flex rounded-xl border border-border/70 bg-muted/40 p-1">
            {renderTabButton('details', 'بيانات المنتج')}
            {renderTabButton('variants', 'النكهات', formValues.variants.length)}
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField labelKey="common.name" htmlFor="product-name" required error={errors.name}>
                  <Input
                    id="product-name"
                    value={formValues.name}
                    placeholder={t('products.form.namePlaceholder')}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="products.form.code" htmlFor="product-code" required error={errors.code}>
                  <Input
                    id="product-code"
                    value={formValues.code}
                    placeholder={t('products.form.codePlaceholder')}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        code: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="العلامة التجارية" htmlFor="product-brand" error={errors.brand}>
                  <Input
                    id="product-brand"
                    value={formValues.brand}
                    placeholder="مثال: Arabica"
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        brand: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="نوع المنتج" htmlFor="product-type" error={errors.type}>
                  <Input
                    id="product-type"
                    value={formValues.type}
                    placeholder="مثال: Chips"
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        type: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="الوزن" htmlFor="product-weight" error={errors.weight}>
                  <Input
                    id="product-weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.weight}
                    placeholder="مثال: 50"
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        weight: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="products.table.price" htmlFor="product-price" required error={errors.price}>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.price}
                    placeholder={t('products.form.pricePlaceholder')}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        price: event.target.value,
                      }))
                    }
                  />
                </FormField>

                <FormField labelKey="products.filters.category" error={errors.categoryId}>
                  <Select
                    value={formValues.categoryId}
                    onValueChange={(value) =>
                      setFormValues((previous) => ({
                        ...previous,
                        categoryId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.form.categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('products.noCategory')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField labelKey="products.form.description" htmlFor="product-description" error={errors.description}>
                <Textarea
                  id="product-description"
                  rows={3}
                  value={formValues.description}
                  placeholder={t('products.form.descriptionPlaceholder')}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField labelKey="products.form.imagePath" htmlFor="product-image" error={errors.imageFile}>
                <ImageUploader
                  id="product-image"
                  value={formValues.imageFile}
                  currentImagePath={mode === 'edit' ? defaultProduct?.images[0]?.imagePath : undefined}
                  disabled={isSubmitting}
                  onChange={(imageFile) =>
                    setFormValues((previous) => ({
                      ...previous,
                      imageFile,
                    }))
                  }
                />
              </FormField>

              <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">نكهات المنتج</h3>
                  <p className="text-xs text-muted-foreground">
                    إذا كان للمنتج أكثر من طعم أو نكهة، أضفها قبل حفظ المنتج من هنا.
                  </p>
                  {formValues.variants.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">تمت إضافة {formValues.variants.length} نكهة لهذا المنتج.</p>
                  ) : null}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addVariantRowAndOpenTab} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                  إضافة نكهة لهذا المنتج
                </Button>
              </div>
            </div>
          ) : (
            <section className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">نكهات / متغيرات المنتج</h3>
                  <p className="text-xs text-muted-foreground">
                    أضف صورة خاصة لكل نكهة. عند اختيار النكهة في التطبيق تظهر صورة النكهة بدل صورة المنتج.
                  </p>
                  {hasVariantsError ? <p className="mt-1 text-xs text-destructive">{errors.variants}</p> : null}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addVariantRow} disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                  إضافة نكهة
                </Button>
              </div>

              {formValues.variants.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                  لا توجد نكهات بعد. المنتج سيستخدم صورته الأساسية فقط.
                </div>
              ) : (
                <div className="space-y-3">
                  {formValues.variants.map((variant, index) => (
                    <div key={variant.localId} className="rounded-lg border border-border/70 bg-background p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">النكهة #{index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariantRow(variant.localId)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-[1fr_140px_150px]">
                        <label className="space-y-1 text-sm">
                          <span className="font-medium text-foreground">اسم النكهة</span>
                          <Input
                            value={variant.name}
                            placeholder="مثال: حار، جبنة، كتشب"
                            disabled={isSubmitting}
                            onChange={(event) => updateVariantRow(variant.localId, 'name', event.target.value)}
                          />
                        </label>

                        <label className="space-y-1 text-sm">
                          <span className="font-medium text-foreground">الترتيب</span>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={variant.sortOrder}
                            disabled={isSubmitting}
                            onChange={(event) => updateVariantRow(variant.localId, 'sortOrder', event.target.value)}
                          />
                        </label>

                        <label className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.isDefault}
                            disabled={isSubmitting}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            onChange={(event) => setDefaultVariant(variant.localId, event.target.checked)}
                          />
                          <span className="font-medium text-foreground">النكهة الافتراضية</span>
                        </label>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                        <label className="space-y-1 text-sm">
                          <span className="font-medium text-foreground">رابط / مسار صورة النكهة</span>
                          <Input
                            value={variant.imagePath}
                            placeholder="/storage/products/hot.png"
                            disabled={isSubmitting}
                            onChange={(event) => updateVariantRow(variant.localId, 'imagePath', event.target.value)}
                          />
                        </label>

                        <div className="space-y-1 text-sm">
                          <span className="font-medium text-foreground">رفع صورة النكهة</span>
                          <ImageUploader
                            id={`product-variant-image-${variant.localId}`}
                            value={variant.imageFile}
                            currentImagePath={variant.imagePath || undefined}
                            disabled={isSubmitting}
                            onChange={(imageFile) => updateVariantRow(variant.localId, 'imageFile', imageFile)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
