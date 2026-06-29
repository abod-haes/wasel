import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDialog, ImageUploader } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { ProductVariant, ProductVariantInput } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';

export interface PendingProductVariant extends ProductVariantInput {
  localId: string;
}

interface ProductVariantsManagerProps {
  productId?: string;
  variants?: PendingProductVariant[];
  onVariantsChange?: (variants: PendingProductVariant[]) => void;
}

interface VariantFormValues {
  localId?: string;
  id?: string;
  name: string;
  imagePath: string;
  imageFile?: File;
  sortOrder: string;
  isDefault: boolean;
}

interface DisplayVariant {
  localId?: string;
  id?: string;
  name: string;
  imagePath?: string | null;
  imageFile?: File;
  sortOrder: number;
  isDefault: boolean;
}

const defaultVariantValues: VariantFormValues = {
  localId: undefined,
  id: undefined,
  name: '',
  imagePath: '',
  imageFile: undefined,
  sortOrder: '0',
  isDefault: false,
};

const buildLocalVariantId = (): string => {
  return `local-variant-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeLocalVariants = (variants: PendingProductVariant[]): PendingProductVariant[] => {
  const sortedVariants = [...variants].sort(
    (firstVariant, secondVariant) => (firstVariant.sortOrder ?? 0) - (secondVariant.sortOrder ?? 0)
  );

  if (sortedVariants.length === 0) {
    return [];
  }

  const defaultIndex = sortedVariants.findIndex((variant) => variant.isDefault);

  return sortedVariants.map((variant, index) => ({
    ...variant,
    sortOrder: variant.sortOrder ?? index,
    isDefault: defaultIndex >= 0 ? index === defaultIndex : index === 0,
  }));
};

const buildInitialValues = (variant?: DisplayVariant, nextSortOrder = 0): VariantFormValues => {
  if (!variant) {
    return {
      ...defaultVariantValues,
      sortOrder: String(nextSortOrder),
    };
  }

  return {
    localId: variant.localId,
    id: variant.id,
    name: variant.name,
    imagePath: variant.imagePath ?? '',
    imageFile: variant.imageFile,
    sortOrder: String(variant.sortOrder),
    isDefault: variant.isDefault,
  };
};

const parseSortOrder = (value: string, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getVariantKey = (variant: DisplayVariant, index: number): string => {
  return variant.id ?? variant.localId ?? `${variant.name}-${index}`;
};

const getVariantImagePreview = (variant: DisplayVariant): string | undefined => {
  if (variant.imageFile) {
    return URL.createObjectURL(variant.imageFile);
  }

  return variant.imagePath ? resolveMediaPath(variant.imagePath) : undefined;
};

export function ProductVariantsManager({
  productId,
  variants: localVariants,
  onVariantsChange,
}: ProductVariantsManagerProps): React.JSX.Element {
  const isLocalMode = !productId;
  const variantsQuery = useProductVariantsQuery(productId);
  const createVariantMutation = useCreateProductVariantMutation();
  const updateVariantMutation = useUpdateProductVariantMutation();
  const deleteVariantMutation = useDeleteProductVariantMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<VariantFormValues>(defaultVariantValues);
  const [nameError, setNameError] = useState('');
  const [variantToDelete, setVariantToDelete] = useState<DisplayVariant | null>(null);

  const apiVariants = variantsQuery.data ?? [];
  const displayedVariants = useMemo<DisplayVariant[]>(() => {
    if (isLocalMode) {
      return normalizeLocalVariants(localVariants ?? []).map((variant) => ({
        localId: variant.localId,
        id: variant.id,
        name: variant.name,
        imagePath: variant.imagePath,
        imageFile: variant.imageFile,
        sortOrder: variant.sortOrder ?? 0,
        isDefault: Boolean(variant.isDefault),
      }));
    }

    return apiVariants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      imagePath: variant.imagePath,
      sortOrder: variant.sortOrder,
      isDefault: variant.isDefault,
    }));
  }, [apiVariants, isLocalMode, localVariants]);

  const isEditing = Boolean(formValues.id || formValues.localId);
  const isSaving = createVariantMutation.isPending || updateVariantMutation.isPending;
  const isDeleting = deleteVariantMutation.isPending;

  useEffect(() => {
    if (!isDialogOpen) {
      setNameError('');
    }
  }, [isDialogOpen]);

  const openCreateDialog = (): void => {
    setFormValues(buildInitialValues(undefined, displayedVariants.length));
    setIsDialogOpen(true);
  };

  const openEditDialog = (variant: DisplayVariant): void => {
    setFormValues(buildInitialValues(variant));
    setIsDialogOpen(true);
  };

  const closeDialog = (): void => {
    setFormValues(defaultVariantValues);
    setIsDialogOpen(false);
    setNameError('');
  };

  const upsertLocalVariant = (variantValues: VariantFormValues): void => {
    const currentVariants = localVariants ?? [];
    const normalizedName = variantValues.name.trim();
    const nextVariant: PendingProductVariant = {
      localId: variantValues.localId ?? buildLocalVariantId(),
      id: variantValues.id,
      name: normalizedName,
      imagePath: variantValues.imagePath.trim() || undefined,
      imageFile: variantValues.imageFile,
      sortOrder: parseSortOrder(variantValues.sortOrder, currentVariants.length),
      isDefault: variantValues.isDefault,
    };

    const nextVariants = variantValues.localId
      ? currentVariants.map((variant) => (variant.localId === variantValues.localId ? nextVariant : variant))
      : [...currentVariants, nextVariant];

    onVariantsChange?.(normalizeLocalVariants(nextVariants));
    closeDialog();
  };

  const submitVariant = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedName = formValues.name.trim();

    if (!normalizedName) {
      setNameError('اسم النكهة مطلوب');
      return;
    }

    if (isLocalMode) {
      upsertLocalVariant(formValues);
      return;
    }

    if (!productId) {
      return;
    }

    const payload = {
      productId,
      variantId: formValues.id,
      name: normalizedName,
      imagePath: formValues.imagePath.trim() || undefined,
      imageFile: formValues.imageFile,
      sortOrder: parseSortOrder(formValues.sortOrder, displayedVariants.length),
      isDefault: formValues.isDefault,
    };

    if (formValues.id) {
      updateVariantMutation.mutate(payload, {
        onSuccess: closeDialog,
      });
      return;
    }

    createVariantMutation.mutate(payload, {
      onSuccess: closeDialog,
    });
  };

  const confirmDelete = (): void => {
    if (!variantToDelete) {
      return;
    }

    if (isLocalMode) {
      const nextVariants = (localVariants ?? []).filter(
        (variant) => variant.localId !== variantToDelete.localId
      );
      onVariantsChange?.(normalizeLocalVariants(nextVariants));
      setVariantToDelete(null);
      return;
    }

    if (!productId || !variantToDelete.id) {
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
            {isLocalMode
              ? 'أضف النكهات قبل حفظ المنتج. سيتم إرسالها مع المنتج الجديد.'
              : 'عرض النكهات الموجودة وإضافة أو تعديل كل نكهة من ديالوغ واضح.'}
          </CardDescription>
        </div>
        <Button type="button" onClick={openCreateDialog} disabled={isSaving}>
          <Plus className="h-4 w-4" />
          إضافة نكهة
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isLocalMode && variantsQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : displayedVariants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
            <p className="font-medium text-foreground">لا توجد نكهات لهذا المنتج بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">اضغط إضافة نكهة وابدأ بإضافة الاسم والصورة والترتيب.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {displayedVariants.map((variant, index) => {
              const imagePreview = getVariantImagePreview(variant);

              return (
                <div
                  key={getVariantKey(variant, index)}
                  className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {imagePreview ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="h-14 w-14 overflow-hidden rounded-lg border bg-muted">
                            <img
                              src={imagePreview}
                              alt={variant.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="w-56 rounded-xl border-border/70 bg-card p-2 shadow-lg">
                          <img
                            src={imagePreview}
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
                    <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(variant)} disabled={isSaving}>
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setVariantToDelete(variant)} disabled={isSaving || isDeleting}>
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'تعديل نكهة' : 'إضافة نكهة جديدة'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitVariant} className="space-y-4">
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

            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
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

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isEditing ? 'حفظ تعديل النكهة' : 'حفظ النكهة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
        isLoading={isDeleting}
      />
    </Card>
  );
}
