import { env } from '@/env';
import { productDetailApi as legacyProductDetailApi } from '@/features/products/api/product-detail-api';
import { productsApi as legacyProductsApi } from '@/features/products/api/products-api';
import { createProductSchema, updateProductSchema } from '@/features/products/schemas/product-form-schema';
import type {
  CreateProductInput,
  Product,
  ProductBrief,
  ProductVariantInput,
  ProductWeightUnit,
  ProductsFilter,
  UpdateProductInput,
} from '@/features/products/types/product-types';
import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { ApiPaginatedResult, PaginatedData, PaginationParams } from '@/types/api';

interface ProductImageApiResponse {
  id?: string;
  Id?: string;
  imagePath?: string;
  ImagePath?: string;
  isMain?: boolean;
  IsMain?: boolean;
}

interface ProductVariantApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  imagePath?: string | null;
  ImagePath?: string | null;
  sortOrder?: number;
  SortOrder?: number;
  isDefault?: boolean;
  IsDefault?: boolean;
}

interface ProductCategoryApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
}

interface ProductApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  brand?: string;
  Brand?: string;
  type?: string;
  Type?: string;
  weight?: number;
  Weight?: number;
  weightUnit?: ProductWeightUnit;
  WeightUnit?: ProductWeightUnit;
  description?: string;
  Description?: string;
  price?: number;
  Price?: number;
  images?: ProductImageApiResponse[];
  Images?: ProductImageApiResponse[];
  variants?: ProductVariantApiResponse[];
  Variants?: ProductVariantApiResponse[];
  categories?: ProductCategoryApiResponse[];
  Categories?: ProductCategoryApiResponse[];
  isFavourite?: boolean;
  IsFavourite?: boolean;
  isInCart?: boolean;
  IsInCart?: boolean;
  cartQuantity?: number;
  CartQuantity?: number;
}

interface ProductBriefApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  parCode?: string;
  ParCode?: string;
  brand?: string;
  Brand?: string;
  type?: string;
  Type?: string;
  weight?: number;
  Weight?: number;
  weightUnit?: ProductWeightUnit;
  WeightUnit?: ProductWeightUnit;
}

type ProductPaginatedResponse = Partial<ApiPaginatedResult<ProductApiResponse>> & {
  items?: ProductApiResponse[];
};

const normalizeOptionalText = (value?: string | null): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const mapProduct = (product: ProductApiResponse): Product => {
  const images = product.images ?? product.Images ?? [];
  const variants = product.variants ?? product.Variants ?? [];
  const categories = product.categories ?? product.Categories ?? [];

  return {
    id: product.id ?? product.Id ?? '',
    name: product.name ?? product.Name ?? '',
    code: product.code ?? product.Code ?? '',
    brand: normalizeOptionalText(product.brand ?? product.Brand),
    type: normalizeOptionalText(product.type ?? product.Type),
    weight: product.weight ?? product.Weight,
    weightUnit: product.weightUnit ?? product.WeightUnit,
    description: normalizeOptionalText(product.description ?? product.Description),
    price: product.price ?? product.Price ?? 0,
    images: images.map((image) => ({
      id: image.id ?? image.Id ?? '',
      imagePath: image.imagePath ?? image.ImagePath ?? '',
      isMain: image.isMain ?? image.IsMain ?? false,
    })),
    variants: variants
      .map((variant, index) => ({
        id: variant.id ?? variant.Id ?? '',
        name: variant.name ?? variant.Name ?? '',
        imagePath: variant.imagePath ?? variant.ImagePath ?? null,
        sortOrder: variant.sortOrder ?? variant.SortOrder ?? index,
        isDefault: variant.isDefault ?? variant.IsDefault ?? false,
      }))
      .sort((first, second) => first.sortOrder - second.sortOrder),
    categories: categories.map((category) => ({
      id: category.id ?? category.Id ?? '',
      name: category.name ?? category.Name ?? '',
    })),
    isFavourite: product.isFavourite ?? product.IsFavourite ?? false,
    isInCart: product.isInCart ?? product.IsInCart ?? false,
    cartQuantity: product.cartQuantity ?? product.CartQuantity ?? 0,
  };
};

const normalizeCategoryIds = (payload: { categoryId?: string; categoryIds?: string[] }): string[] => {
  const values = [...(payload.categoryIds ?? []), ...(payload.categoryId ? [payload.categoryId] : [])];
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
};

const normalizeVariants = (variants?: ProductVariantInput[]): ProductVariantInput[] => {
  const normalized = (variants ?? [])
    .map((variant, index) => ({
      ...variant,
      name: variant.name.trim(),
      sortOrder: variant.sortOrder ?? index,
      isDefault: Boolean(variant.isDefault),
    }))
    .filter((variant) => variant.name.length > 0);

  if (normalized.length === 0) {
    return [];
  }

  const defaultIndex = normalized.findIndex((variant) => variant.isDefault);
  return normalized.map((variant, index) => ({
    ...variant,
    isDefault: defaultIndex >= 0 ? index === defaultIndex : index === 0,
  }));
};

const appendVariantsToFormData = (formData: FormData, variants?: ProductVariantInput[]): void => {
  if (variants == null) {
    return;
  }

  const variantImages: File[] = [];
  const variantsJson = normalizeVariants(variants).map((variant, index) => {
    const item: Record<string, unknown> = {
      name: variant.name,
      sortOrder: variant.sortOrder ?? index,
      isDefault: Boolean(variant.isDefault),
    };

    if (variant.id) {
      item.id = variant.id;
    }

    if (variant.imageFile) {
      item.imageIndex = variantImages.length;
      variantImages.push(variant.imageFile);
    } else if (variant.imageId) {
      item.imageId = variant.imageId;
    } else if (variant.imagePath) {
      item.imagePath = variant.imagePath;
    }

    return item;
  });

  formData.append('VariantsJson', JSON.stringify(variantsJson));
  variantImages.forEach((file) => formData.append('VariantImages', file));
};

const appendCreateFields = (formData: FormData, payload: CreateProductInput): void => {
  formData.append('Name', payload.name.trim());
  formData.append('Code', payload.code.trim());
  formData.append('Price', String(payload.price));

  if (payload.brand?.trim()) formData.append('Brand', payload.brand.trim());
  if (payload.type?.trim()) formData.append('Type', payload.type.trim());
  if (payload.weight != null) formData.append('Weight', String(payload.weight));
  if (payload.weightUnit) formData.append('WeightUnit', payload.weightUnit);
  if (payload.description != null) formData.append('Description', payload.description.trim());

  normalizeCategoryIds(payload).forEach((categoryId) => formData.append('CategoryIds', categoryId));

  if (payload.imageFile) {
    formData.append('Image', payload.imageFile);
  }

  appendVariantsToFormData(formData, payload.variants);
};

export const productsDashboardApi = {
  async getProducts(filters: ProductsFilter, pagination: PaginationParams): Promise<PaginatedData<Product>> {
    if (env.enableMockApi) {
      return legacyProductsApi.getProducts(
        {
          ...filters,
          categoryId:
            filters.categoryId !== 'all'
              ? filters.categoryId
              : filters.categoryIds?.[0] ?? 'all',
        },
        pagination
      );
    }

    const categoryIds =
      filters.categoryIds?.length
        ? filters.categoryIds
        : filters.categoryId === 'all'
          ? undefined
          : [filters.categoryId];

    const { data } = await apiClient.get<ProductPaginatedResponse>('/api/Products', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        includeCategories: true,
        search: filters.search.trim() || undefined,
        code: filters.code?.trim() || undefined,
        categoryIds,
      },
    });

    const paginated = toPaginatedData(data, pagination);
    return {
      ...paginated,
      items: paginated.items.map(mapProduct),
    };
  },

  async getProduct(productId: string): Promise<Product> {
    if (env.enableMockApi) {
      return legacyProductDetailApi.getProduct(productId);
    }

    const { data } = await apiClient.get<ProductApiResponse>(`/api/Products/${productId}`);
    return mapProduct(data);
  },

  async getProductsBrief(): Promise<ProductBrief[]> {
    if (env.enableMockApi) {
      const page = await legacyProductsApi.getProducts(
        { search: '', categoryId: 'all' },
        { page: 1, pageSize: 100 }
      );
      return page.items.map((product) => ({
        id: product.id,
        name: product.name,
        parCode: product.code,
        brand: product.brand,
        type: product.type,
        weight: product.weight,
        weightUnit: product.weightUnit,
      }));
    }

    const { data } = await apiClient.get<ProductBriefApiResponse[]>('/api/Products/brief');
    return (data ?? []).map((product) => ({
      id: product.id ?? product.Id ?? '',
      name: product.name ?? product.Name ?? '',
      parCode: normalizeOptionalText(product.parCode ?? product.ParCode),
      brand: normalizeOptionalText(product.brand ?? product.Brand),
      type: normalizeOptionalText(product.type ?? product.Type),
      weight: product.weight ?? product.Weight,
      weightUnit: product.weightUnit ?? product.WeightUnit,
    }));
  },

  async createProduct(payload: CreateProductInput): Promise<void> {
    const parsed = createProductSchema.parse(payload);

    if (env.enableMockApi) {
      await legacyProductsApi.createProduct(parsed);
      return;
    }

    const formData = new FormData();
    appendCreateFields(formData, parsed);
    await apiClient.post('/api/Products', formData);
  },

  async updateProduct(payload: UpdateProductInput): Promise<void> {
    const parsed = updateProductSchema.parse(payload);

    if (env.enableMockApi) {
      await legacyProductsApi.updateProduct(parsed);
      return;
    }

    const categoryIdsProvided = Object.prototype.hasOwnProperty.call(parsed, 'categoryIds');
    const normalizedCategoryIds = normalizeCategoryIds(parsed);
    const shouldUseMultipart = Boolean(parsed.imageFile || parsed.variants != null);

    if (shouldUseMultipart) {
      const formData = new FormData();

      if (parsed.name != null) formData.append('Name', parsed.name.trim());
      if (parsed.code != null) formData.append('Code', parsed.code.trim());
      if (parsed.price != null) formData.append('Price', String(parsed.price));
      if (parsed.brand != null) formData.append('Brand', parsed.brand.trim());
      if (parsed.type != null) formData.append('Type', parsed.type.trim());
      if (parsed.weight != null) formData.append('Weight', String(parsed.weight));
      if (parsed.weightUnit) formData.append('WeightUnit', parsed.weightUnit);
      if (parsed.description != null) formData.append('Description', parsed.description.trim());

      if (categoryIdsProvided) {
        if (normalizedCategoryIds.length > 0) {
          normalizedCategoryIds.forEach((categoryId) => formData.append('CategoryIds', categoryId));
        } else {
          formData.append('ClearCategories', 'true');
        }
      }

      if (parsed.clearVariants) formData.append('ClearVariants', 'true');
      if (parsed.imageFile) formData.append('Image', parsed.imageFile);
      appendVariantsToFormData(formData, parsed.variants);

      await apiClient.put(`/api/Products/${parsed.id}/with-image`, formData);
      return;
    }

    const body: Record<string, unknown> = {};
    if (parsed.name != null) body.name = parsed.name.trim();
    if (parsed.code != null) body.code = parsed.code.trim();
    if (parsed.price != null) body.price = parsed.price;
    if (parsed.brand != null) body.brand = parsed.brand.trim();
    if (parsed.type != null) body.type = parsed.type.trim();
    if (Object.prototype.hasOwnProperty.call(parsed, 'weight')) body.weight = parsed.weight;
    if (Object.prototype.hasOwnProperty.call(parsed, 'weightUnit')) body.weightUnit = parsed.weightUnit;
    if (parsed.description != null) body.description = parsed.description.trim();

    if (categoryIdsProvided) {
      if (normalizedCategoryIds.length > 0) {
        body.categoryIds = normalizedCategoryIds;
      } else {
        body.clearCategories = true;
      }
    }

    if (parsed.clearVariants) body.clearVariants = true;

    await apiClient.put(`/api/Products/${parsed.id}`, body);
  },

  async deleteProduct(productId: string): Promise<void> {
    if (env.enableMockApi) {
      await legacyProductsApi.deleteProduct(productId);
      return;
    }

    await apiClient.delete(`/api/Products/${productId}`);
  },

  async importProducts(file: File): Promise<unknown> {
    if (env.enableMockApi) {
      return { imported: 0, mock: true };
    }

    const formData = new FormData();
    formData.append('File', file);
    const { data } = await apiClient.post('/api/Products/import', formData);
    return data;
  },
};
