import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

import { ConfirmDialog, ImageUploader } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useProductVariantsQuery,
  useUpdateProductVariantMutation,
} from '@/features/products/hooks/use-products-query';
import type { ProductVariant } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';

interface ProductVariantsManagerProps {
  productId: string;
}

interface VariantFormValues {
  id?: string;
  name: string;
  imagePath: string;
  imageFile?: File;
  sortOrder: string;
  isDefault: boolean;
}

const defaultVariantValues: VariantFormValues = {
  id: undefined,
  name: '',
  imagePath: '',
  imageFile: undefined,
  sortOrder: '0',
  isDefault: false,
};

const buildInitialValues = (variant?: ProductVariant, nextSortOrder = 0): VariantFormValues => {
  if (!variant) {
    return {
      ...defaultVariantValues,
      sortOrder: String(nextSortOrder),
    };
  }

  return {
    id: variant.id,
    name: variant.name,
    imagePath: variant.imagePath ?? '',
    imageFile: undefined,
    sortOrder: String(variant.sortOrder),
    isDefault: variant.isDefault,
  };
};

const parseSortOrder = (value: string, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export function ProductVariantsManager({ productId }: ProductVariantsManagerProps): React.JSX.Element {
  const variantsQuery = useProductVariantsQuery(productId);
  const createVariantMutation = useCreateProductVariantMutation();
  const updateVariantMutation = useUpdateProductVariantMutation();
  const deleteVariantMutation = useDeleteProductVariantMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<VariantFormValues>(defaultVariantValues);
  const [nameError, setNameError] = useState('');
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);

  const variants = variantsQuery.data ?? [];
  const isEditing = Boolean(formValues.id);
  const isSaving = createVariantMutation.isPending || updateVariantMutation.isPending;

  useEffect(() => {
    if (!isFormOpen) {
      setNameError('');
    }
  }, [isFormOpen]);

  const openCreateForm = (): void => {
    setFormValues(buildInitialValues(undefined, variants.length));
    setIsFormOpen(true);
  };

  const openEditForm = (variant: ProductVariant): void => {
    setFormValues(buildInitialValues(variant));
    setIsFormOpen(true);
  };

  const closeForm = (): void => {
    setFormValues(defaultVariantValues);
    setIsFormOpen(false);
    setNameError('');
  };

  const submitVariant = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedName = formValues.name.trim();

    if (!normalizedName) {
      setNameError('اسم النكهة مطلوب');
      return;
    }

    const payload = {
      productId,
      variantId: formValues.id,
      name: normalizedName,
      imagePath: formValues.imagePath.trim() || undefined,
      imageFile: formValues.imageFile,
      sortOrder: parseSortOrder(formValues.sortOrder, variants.length),
      isDefault: formValues.isDefault,
    };

    if (isEditing) {
      updateVariantMutation.mutate(payload, {
        onSuccess: closeForm,
      });
      return;
    }

    createVariantMutation.mutate(payload, {
      onSuccess: closeForm,
    });
  };

  const confirmDelete = (): void => {
    if (!variantToDelete) {
      return;
    }

    deleteVariantMutation.mutate(
      {
        productId,
        variantId: variantToDelete.id,
      },
      {
        onSuccess: () => setVariantToDelete(null),
      }
    );
  };

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>نكهات المنتج</CardTitle>
          <CardDescription>
            أضف كل نكهة بشكل مستقل، وحدد صورتها وترتيبها والنكهة الافتراضية. هذا القسم يستخدم API النكهات الخاصة بالمنتج.
          </CardDescription>
        </div>
        <Button type="button" onClick={openCreateForm} disabled={isSaving}>
          <Plus className="h-4 w-4" />
          إضافة نكهة
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFormOpen ? (
          <form onSubmit={submitVariant} className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {isEditing ? 'تعديل نكهة' : 'إضافة نكهة جديدة'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  عبّئ اسم النكهة والصورة، ثم احفظها مباشرة على المنتج الحالي.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeForm} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_160px_180px]">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">اسم النكهة *</span>
                <Input
                  value={formValues.name}
                  placeholder="مثال: حار، جبنة، كتشب"
                  disabled={isSaving}
                  onChange={(event) => {
                    setFormValues((previous) => ({ ...previous, name: event.target.value }));
                    setNameError('');
                  }}
                />
                {nameError ? <span className="text-xs text-destructive">{nameError}</span> : null}
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">الترتيب</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formValues.sortOrder}
                  disabled={isSaving}
                  onChange={(event) => setFormValues((previous) => ({ ...previous, sortOrder: event.target.value }))}
                />
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={formValues.isDefault}
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  onChange={(event) => setFormValues((previous) => ({ ...previous, isDefault: event.target.checked }))}
                />
                <span className="font-medium text-foreground">النكهة الافتراضية</span>
              </label>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">مسار / رابط صورة النكهة</span>
                <Input
                  value={formValues.imagePath}
                  placeholder="/storage/products/hot.png"
                  disabled={isSaving}
                  onChange={(event) => setFormValues((previous) => ({ ...previous, imagePath: event.target.value }))}
                />
              </label>

              <div className="space-y-1 text-sm">
                <span className="font-medium text-foreground">رفع صورة النكهة</span>
                <ImageUploader
                  id="product-variant-image"
                  value={formValues.imageFile}
                  currentImagePath={formValues.imagePath || undefined}
                  disabled={isSaving}
                  onChange={(imageFile) => setFormValues((previous) => ({ ...previous, imageFile }))}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeForm} disabled={isSaving}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isEditing ? 'حفظ تعديل النكهة' : 'حفظ النكهة'}
              </Button>
            </div>
          </form>
        ) : null}

        {variantsQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : variants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
            <p className="font-medium text-foreground">لا توجد نكهات لهذا المنتج بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">اضغط إضافة نكهة وابدأ بإضافة الصور والترتيب.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {variants.map((variant) => (
              <div key={variant.id} className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {variant.imagePath ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="h-14 w-14 overflow-hidden rounded-lg border bg-muted">
                          <img
                            src={resolveMediaPath(variant.imagePath)}
                            alt={variant.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="w-56 rounded-xl border-border/70 bg-card p-2 shadow-lg">
                        <img
                          src={resolveMediaPath(variant.imagePath)}
                          alt={variant.name}
                          className="h-44 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="h-14 w-14 rounded-lg border border-dashed bg-muted" />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{variant.name}</p>
                      {variant.isDefault ? <Badge variant="default">افتراضية</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">الترتيب: {variant.sortOrder}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEditForm(variant)} disabled={isSaving}>
                    <Pencil className="h-4 w-4" />
                    تعديل
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setVariantToDelete(variant)} disabled={isSaving}>
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={Boolean(variantToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setVariantToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        titleKey="حذف النكهة؟"
        descriptionKey="سيتم حذف هذه النكهة من المنتج."
        confirmLabelKey="حذف"
        isLoading={deleteVariantMutation.isPending}
      />
    </Card>
  );
}
