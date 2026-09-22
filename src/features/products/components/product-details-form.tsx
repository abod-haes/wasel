import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, Save } from 'lucide-react';
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
import type { Brand } from '@/features/brands/types/brand-types';
import type { CategoryOption } from '@/features/categories/types/category-types';
import type { MarketOption } from '@/features/markets/types/market-types';
import { createProductSchema } from '@/features/products/schemas/product-form-schema';
import type {
  CreateProductInput,
  Product,
  ProductVariantInput,
  ProductWeightUnit,
} from '@/features/products/types/product-types';

interface ProductDetailsFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  categories: CategoryOption[];
  brands: Brand[];
  markets: MarketOption[];
  variants?: ProductVariantInput[];
  isSubmitting?: boolean;
  onSubmit: (payload: CreateProductInput) => void;
  onBack?: () => void;
}

interface ProductDetailsValues {
  name: string;
  code: string;
  brandId: string;
  marketUserId: string;
  type: string;
  weight: string;
  weightUnit: ProductWeightUnit | 'none';
  description: string;
  price: string;
  imageFile?: File;
  categoryIds: string[];
}

const NONE_VALUE = 'none';

const defaultValues: ProductDetailsValues = {
  name: '',
  code: '',
  brandId: NONE_VALUE,
  marketUserId: NONE_VALUE,
  type: '',
  weight: '',
  weightUnit: 'none',
  description: '',
  price: '',
  imageFile: undefined,
  categoryIds: [],
};

const parseOptionalNumber = (value: string): number | undefined => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return undefined;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const generateSixDigitCode = (): string => String(Math.floor(100000 + Math.random() * 900000));

const formatPricePreview = (value: number): string =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function ProductDetailsForm({
  mode,
  product,
  categories,
  brands,
  markets,
  variants,
  isSubmitting = false,
  onSubmit,
  onBack,
}: ProductDetailsFormProps): React.JSX.Element {
  const navigate = useNavigate();
  const [values, setValues] = useState<ProductDetailsValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductDetailsValues, string>>>({});
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (mode === 'edit' && product) {
      setValues({
        name: product.name,
        code: product.code,
        brandId: product.brandId ?? NONE_VALUE,
        marketUserId: product.marketUserId ?? NONE_VALUE,
        type: product.type ?? '',
        weight: product.weight != null ? String(product.weight) : '',
        weightUnit: product.weightUnit ?? 'none',
        description: product.description ?? '',
        price: String(product.basePrice ?? product.prices?.basePrice ?? product.price),
        imageFile: undefined,
        categoryIds: product.categories.map((category) => category.id),
      });
      setErrors({});
      setCategorySearch('');
      return;
    }

    if (mode === 'create') {
      setValues(defaultValues);
      setErrors({});
      setCategorySearch('');
    }
  }, [mode, product]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const selectedMarket = markets.find((market) => market.id === values.marketUserId);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const parsed = createProductSchema.safeParse({
      name: values.name,
      code: values.code,
      brandId: values.brandId === NONE_VALUE ? undefined : values.brandId,
      marketUserId: values.marketUserId === NONE_VALUE ? '' : values.marketUserId,
      type: values.type,
      weight: parseOptionalNumber(values.weight),
      weightUnit: values.weightUnit === 'none' ? undefined : values.weightUnit,
      description: values.description,
      price: values.price.trim() === '' ? Number.NaN : Number(values.price),
      imageFile: values.imageFile,
      categoryIds: values.categoryIds,
      ...(variants != null ? { variants } : {}),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        code: fieldErrors.code?.[0],
        brandId: fieldErrors.brandId?.[0],
        marketUserId: fieldErrors.marketUserId?.[0],
        type: fieldErrors.type?.[0],
        weight: fieldErrors.weight?.[0],
        weightUnit: fieldErrors.weightUnit?.[0],
        description: fieldErrors.description?.[0],
        price: fieldErrors.price?.[0],
        imageFile: fieldErrors.imageFile?.[0],
        categoryIds: fieldErrors.categoryIds?.[0],
      });
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  const toggleCategory = (categoryId: string): void => {
    setValues((previous) => ({
      ...previous,
      categoryIds: previous.categoryIds.includes(categoryId)
        ? previous.categoryIds.filter((id) => id !== categoryId)
        : [...previous.categoryIds, categoryId],
    }));
  };

  const mainImage = product?.images.find((image) => image.isMain) ?? product?.images[0];

  return (
    <form id="product-details-form" onSubmit={submitHandler}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'بيانات المنتج الجديد' : 'بيانات المنتج'}</CardTitle>
          <CardDescription>
            المنتج مرتبط بسوق واحد إلزاميًا، والبراند يُختار من قائمة البراندات الموحّدة.
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
              <div className="flex gap-2">
                <Input
                  id="product-code"
                  value={values.code}
                  placeholder="أدخل كود المنتج"
                  onChange={(event) => setValues((previous) => ({ ...previous, code: event.target.value }))}
                />
                {mode === 'create' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-2"
                    disabled={isSubmitting}
                    onClick={() => {
                      setValues((previous) => ({ ...previous, code: generateSixDigitCode() }));
                      setErrors((previous) => ({ ...previous, code: undefined }));
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    توليد كود
                  </Button>
                ) : null}
              </div>
            </FormField>

            <FormField labelKey="العلامة التجارية" error={errors.brandId}>
              <Select
                value={values.brandId}
                onValueChange={(brandId) => setValues((previous) => ({ ...previous, brandId }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر البراند" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>بدون براند</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField labelKey="السوق" required error={errors.marketUserId}>
              <Select
                value={values.marketUserId}
                onValueChange={(marketUserId) =>
                  setValues((previous) => ({ ...previous, marketUserId }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السوق المسؤول عن المنتج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>اختر السوق</SelectItem>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMarket ? (
                <p className="mt-1 text-xs text-muted-foreground">{selectedMarket.location}</p>
              ) : null}
            </FormField>

            <FormField labelKey="نوع المنتج" htmlFor="product-type" error={errors.type}>
              <Input
                id="product-type"
                value={values.type}
                placeholder="مثال: Chips"
                onChange={(event) => setValues((previous) => ({ ...previous, type: event.target.value }))}
              />
            </FormField>

            <div className="grid grid-cols-[1fr_120px] gap-2">
              <FormField labelKey="الوزن" htmlFor="product-weight" error={errors.weight}>
                <Input
                  id="product-weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.weight}
                  onChange={(event) => setValues((previous) => ({ ...previous, weight: event.target.value }))}
                />
              </FormField>
              <FormField labelKey="الوحدة" error={errors.weightUnit}>
                <Select
                  value={values.weightUnit}
                  onValueChange={(weightUnit) =>
                    setValues((previous) => ({
                      ...previous,
                      weightUnit: weightUnit as ProductDetailsValues['weightUnit'],
                    }))
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField labelKey="السعر الأساسي (USD)" htmlFor="product-price" required error={errors.price}>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => setValues((previous) => ({ ...previous, price: event.target.value }))}
              />
            </FormField>
          </div>

          {mode === 'edit' && product?.prices ? (
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-semibold">الأسعار المحسوبة من آخر قراءة</p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <span>{formatPricePreview(product.prices.priceUsd)} USD</span>
                <span>{formatPricePreview(product.prices.priceSyp)} SYP</span>
                <span>{formatPricePreview(product.prices.priceTry)} TRY</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                عملة العرض الحالية: {product.prices.displayCurrency} — {formatPricePreview(product.prices.displayPrice)} {product.prices.displayCurrency}
              </p>
            </div>
          ) : null}

          <div className="space-y-3 rounded-xl border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">تصنيفات المنتج</p>
                <p className="text-xs text-muted-foreground">يمكن ربط المنتج بأكثر من تصنيف.</p>
              </div>
              <span className="text-xs text-muted-foreground">محدد: {values.categoryIds.length}</span>
            </div>
            <Input value={categorySearch} placeholder="ابحث عن تصنيف" onChange={(event) => setCategorySearch(event.target.value)} />
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border p-2">
              {filteredCategories.length === 0 ? (
                <p className="p-3 text-center text-sm text-muted-foreground">لا توجد تصنيفات</p>
              ) : (
                filteredCategories.map((category) => (
                  <label key={category.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                    <input
                      type="checkbox"
                      checked={values.categoryIds.includes(category.id)}
                      disabled={isSubmitting}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span className="text-sm">{'— '.repeat(category.level ?? 0)}{category.name}</span>
                  </label>
                ))
              )}
            </div>
            {errors.categoryIds ? <p className="text-xs text-destructive">{errors.categoryIds}</p> : null}
          </div>

          <FormField labelKey="products.form.description" htmlFor="product-description" error={errors.description}>
            <Textarea
              id="product-description"
              rows={4}
              value={values.description}
              onChange={(event) => setValues((previous) => ({ ...previous, description: event.target.value }))}
            />
          </FormField>

          <FormField labelKey="products.form.imagePath" htmlFor="product-image" error={errors.imageFile}>
            <ImageUploader
              id="product-image"
              value={values.imageFile}
              currentImagePath={mode === 'edit' ? mainImage?.imagePath : undefined}
              disabled={isSubmitting}
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              onChange={(imageFile) => setValues((previous) => ({ ...previous, imageFile }))}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => (onBack ? onBack() : navigate(ROUTES.products))}
            disabled={isSubmitting}
          >
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
