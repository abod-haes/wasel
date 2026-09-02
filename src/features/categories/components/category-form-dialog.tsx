import { useEffect, useMemo, useState } from 'react';
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
import { createCategorySchema } from '@/features/categories/schemas/category-form-schema';
import type {
  Category,
  CategoryOption,
  CreateCategoryInput,
  ProductBriefOption,
} from '@/features/categories/types/category-types';

interface CategoryFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  defaultCategory?: Category;
  parentOptions: CategoryOption[];
  products: ProductBriefOption[];
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateCategoryInput) => void;
}

interface FormValues {
  name: string;
  description: string;
  imageFile?: File;
  parentCategoryId: string;
  productIds: string[];
  removeImage: boolean;
}

const defaultFormValues: FormValues = {
  name: '',
  description: '',
  imageFile: undefined,
  parentCategoryId: 'root',
  productIds: [],
  removeImage: false,
};

export function CategoryFormDialog({
  open,
  mode,
  defaultCategory,
  parentOptions,
  products,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setProductSearch('');

    if (mode === 'edit' && defaultCategory) {
      setFormValues({
        name: defaultCategory.name,
        description: defaultCategory.description ?? '',
        imageFile: undefined,
        parentCategoryId: defaultCategory.parentCategoryId ?? 'root',
        productIds: defaultCategory.products.map((product) => product.id),
        removeImage: false,
      });
      return;
    }

    setFormValues(defaultFormValues);
  }, [defaultCategory, mode, open]);

  const dialogTitleKey = mode === 'create' ? 'categories.createCategory' : 'categories.editCategory';
  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      `${product.name} ${product.parCode ?? ''}`.toLowerCase().includes(search)
    );
  }, [productSearch, products]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const valuesToParse = {
      name: formValues.name,
      description: formValues.description,
      imageFile: formValues.imageFile,
      parentCategoryId: formValues.parentCategoryId === 'root' ? undefined : formValues.parentCategoryId,
      productIds: formValues.productIds,
      removeImage: formValues.removeImage,
    };
    const parsed = createCategorySchema.safeParse(valuesToParse);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        description: fieldErrors.description?.[0],
        imageFile: fieldErrors.imageFile?.[0],
        parentCategoryId: fieldErrors.parentCategoryId?.[0],
        productIds: fieldErrors.productIds?.[0],
      });
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  const toggleProduct = (productId: string): void => {
    setFormValues((previous) => ({
      ...previous,
      productIds: previous.productIds.includes(productId)
        ? previous.productIds.filter((id) => id !== productId)
        : [...previous.productIds, productId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{t(dialogTitleKey)}</DialogTitle></DialogHeader>
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField labelKey="common.name" htmlFor="category-name" required error={errors.name}>
              <Input id="category-name" value={formValues.name} placeholder={t('categories.form.namePlaceholder')} onChange={(event) => setFormValues((previous) => ({ ...previous, name: event.target.value }))} />
            </FormField>
            <FormField labelKey="التصنيف الأب" error={errors.parentCategoryId}>
              <Select value={formValues.parentCategoryId} onValueChange={(parentCategoryId) => setFormValues((previous) => ({ ...previous, parentCategoryId }))}>
                <SelectTrigger><SelectValue placeholder="اختر التصنيف الأب" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">تصنيف رئيسي</SelectItem>
                  {parentOptions.map((category) => <SelectItem key={category.id} value={category.id}>{'— '.repeat(category.level ?? 0)}{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField labelKey="categories.form.description" htmlFor="category-description" error={errors.description}>
            <Textarea id="category-description" rows={3} value={formValues.description} placeholder={t('categories.form.descriptionPlaceholder')} onChange={(event) => setFormValues((previous) => ({ ...previous, description: event.target.value }))} />
          </FormField>
          <FormField labelKey="categories.form.imagePath" htmlFor="category-image" error={errors.imageFile}>
            <ImageUploader id="category-image" value={formValues.imageFile} currentImagePath={mode === 'edit' && !formValues.removeImage ? defaultCategory?.imagePath : undefined} disabled={isSubmitting} onChange={(imageFile) => setFormValues((previous) => ({ ...previous, imageFile, removeImage: imageFile ? false : previous.removeImage }))} />
          </FormField>
          {mode === 'edit' && defaultCategory?.imagePath ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
              <input type="checkbox" checked={formValues.removeImage} disabled={Boolean(formValues.imageFile) || isSubmitting} onChange={(event) => setFormValues((previous) => ({ ...previous, removeImage: event.target.checked }))} />
              حذف صورة التصنيف الحالية
            </label>
          ) : null}
          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold">المنتجات المرتبطة</p><p className="text-xs text-muted-foreground">القائمة المحددة هنا تستبدل ربط المنتجات الحالي عند الحفظ.</p></div>
              <span className="text-xs text-muted-foreground">محدد: {formValues.productIds.length}</span>
            </div>
            <Input value={productSearch} placeholder="ابحث باسم المنتج أو الكود" onChange={(event) => setProductSearch(event.target.value)} />
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2">
              {filteredProducts.length === 0 ? <p className="p-3 text-center text-sm text-muted-foreground">لا توجد منتجات مطابقة</p> : filteredProducts.map((product) => (
                <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                  <input type="checkbox" checked={formValues.productIds.includes(product.id)} disabled={isSubmitting} onChange={() => toggleProduct(product.id)} />
                  <span className="min-w-0 flex-1 text-sm">{product.name}</span>
                  {product.parCode ? <span className="text-xs text-muted-foreground">{product.parCode}</span> : null}
                </label>
              ))}
            </div>
            {errors.productIds ? <p className="text-xs text-destructive">{errors.productIds}</p> : null}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{mode === 'create' ? t('common.create') : t('common.update')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
