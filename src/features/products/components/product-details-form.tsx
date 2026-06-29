import { useEffect, useState } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FormField, ImageUploader } from '@/components/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import type { CategoryOption } from '@/features/categories/types/category-types';
import { createProductSchema } from '@/features/products/schemas/product-form-schema';
import type { CreateProductInput, Product, ProductVariantInput } from '@/features/products/types/product-types';

interface ProductDetailsFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  categories: CategoryOption[];
  variants?: ProductVariantInput[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateProductInput) => void;
}

interface ProductDetailsValues {
  name: string;
  code: string;
  brand: string;
  type: string;
  weight: string;
  description: string;
  price: string;
  imageFile?: File;
  categoryId: string;
}

const defaultValues: ProductDetailsValues = {
  name: '',
  code: '',
  brand: '',
  type: '',
  weight: '',
  description: '',
  price: '',
  imageFile: undefined,
  categoryId: 'none',
};

const parseOptionalNumber = (value: string): number | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export function ProductDetailsForm({
  mode,
  product,
  categories,
  variants,
  isSubmitting = false,
  onSubmit,
}: ProductDetailsFormProps): React.JSX.Element {
  const navigate = useNavigate();
  const [values, setValues] = useState<ProductDetailsValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductDetailsValues, string>>>({});

  useEffect(() => {
    if (mode === 'edit' && product) {
      setValues({
        name: product.name,
        code: product.code,
        brand: product.brand ?? '',
        type: product.type ?? '',
        weight: product.weight != null ? String(product.weight) : '',
        description: product.description ?? '',
        price: String(product.price),
        imageFile: undefined,
        categoryId: product.categories[0]?.id ?? 'none',
      });
      setErrors({});
      return;
    }

    if (mode === 'create') {
      setValues(defaultValues);
      setErrors({});
    }
  }, [mode, product]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedCategoryId = values.categoryId === 'none' ? undefined : values.categoryId;
    const selectedCategory = categories.find((category) => category.id === normalizedCategoryId);
    const valuesToParse = {
      name: values.name,
      code: values.code,
      brand: values.brand,
      type: values.type,
      weight: parseOptionalNumber(values.weight),
      description: values.description,
      price: Number(values.price),
      imageFile: values.imageFile,
      categoryId: normalizedCategoryId,
      categoryName: selectedCategory?.name,
      ...(variants != null ? { variants } : {}),
    };

    const parsed = createProductSchema.safeParse(valuesToParse);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        code: fieldErrors.code?.[0],
        brand: fieldErrors.brand?.[0],
        type: fieldErrors.type?.[0],
        weight: fieldErrors.weight?.[0],
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
    <form id="product-details-form" onSubmit={submitHandler}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'بيانات المنتج الجديد' : 'بيانات المنتج'}</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'أدخل معلومات المنتج الأساسية وأضف النكهات من القسم التالي قبل الحفظ.'
              : 'عدّل معلومات المنتج الأساسية من هنا، وأدر النكهات من القسم التالي.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField labelKey="common.name" htmlFor="product-name" required error={errors.name}>
              <Input
                id="product-name"
                value={values.name}
                placeholder="أدخل اسم المنتج"
                onChange={(event) => setValues((previous) => ({ ...previous, name: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="products.form.code" htmlFor="product-code" required error={errors.code}>
              <Input
                id="product-code"
                value={values.code}
                placeholder="أدخل كود المنتج"
                onChange={(event) => setValues((previous) => ({ ...previous, code: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="العلامة التجارية" htmlFor="product-brand" error={errors.brand}>
              <Input
                id="product-brand"
                value={values.brand}
                placeholder="مثال: Arabica"
                onChange={(event) => setValues((previous) => ({ ...previous, brand: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="نوع المنتج" htmlFor="product-type" error={errors.type}>
              <Input
                id="product-type"
                value={values.type}
                placeholder="مثال: Chips"
                onChange={(event) => setValues((previous) => ({ ...previous, type: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="الوزن" htmlFor="product-weight" error={errors.weight}>
              <Input
                id="product-weight"
                type="number"
                min="0"
                step="0.01"
                value={values.weight}
                placeholder="مثال: 50"
                onChange={(event) => setValues((previous) => ({ ...previous, weight: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="products.table.price" htmlFor="product-price" required error={errors.price}>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                placeholder="أدخل سعر المنتج"
                onChange={(event) => setValues((previous) => ({ ...previous, price: event.target.value }))}
              />
            </FormField>

            <FormField labelKey="products.filters.category" error={errors.categoryId}>
              <Select
                value={values.categoryId}
                onValueChange={(value) => setValues((previous) => ({ ...previous, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر تصنيفاً" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تصنيف</SelectItem>
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
              rows={4}
              value={values.description}
              placeholder="اكتب وصفاً مختصراً للمنتج"
              onChange={(event) => setValues((previous) => ({ ...previous, description: event.target.value }))}
            />
          </FormField>

          <FormField labelKey="products.form.imagePath" htmlFor="product-image" error={errors.imageFile}>
            <ImageUploader
              id="product-image"
              value={values.imageFile}
              currentImagePath={mode === 'edit' ? product?.images[0]?.imagePath : undefined}
              disabled={isSubmitting}
              onChange={(imageFile) => setValues((previous) => ({ ...previous, imageFile }))}
            />
          </FormField>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.products)} disabled={isSubmitting}>
            <ArrowRight className="h-4 w-4" />
            رجوع للمنتجات
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {mode === 'create' ? 'حفظ المنتج' : 'حفظ التعديلات'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
