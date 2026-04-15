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

interface FormValues {
  name: string;
  code: string;
  description: string;
  price: string;
  imageFile?: File;
  categoryId: string;
}

const defaultFormValues: FormValues = {
  name: '',
  code: '',
  description: '',
  price: '',
  imageFile: undefined,
  categoryId: 'none',
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

  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});

    if (mode === 'edit' && defaultProduct) {
      setFormValues({
        name: defaultProduct.name,
        code: defaultProduct.code,
        description: defaultProduct.description ?? '',
        price: String(defaultProduct.price),
        imageFile: undefined,
        categoryId: defaultProduct.categories[0]?.id ?? 'none',
      });
      return;
    }

    setFormValues(defaultFormValues);
  }, [defaultProduct, mode, open]);

  const dialogTitleKey = mode === 'create' ? 'products.createProduct' : 'products.editProduct';

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedCategoryId = formValues.categoryId === 'none' ? undefined : formValues.categoryId;
    const selectedCategory = categories.find((category) => category.id === normalizedCategoryId);

    const parsed = createProductSchema.safeParse({
      name: formValues.name,
      code: formValues.code,
      description: formValues.description,
      price: Number(formValues.price),
      imageFile: formValues.imageFile,
      categoryId: normalizedCategoryId,
      categoryName: selectedCategory?.name,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        code: fieldErrors.code?.[0],
        description: fieldErrors.description?.[0],
        price: fieldErrors.price?.[0],
        imageFile: fieldErrors.imageFile?.[0],
        categoryId: fieldErrors.categoryId?.[0],
      });
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
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
