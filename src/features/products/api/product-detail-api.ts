import { env } from '@/env';
import type { Product } from '@/features/products/types/product-types';
import { productsApi } from '@/features/products/api/products-api';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

interface ProductImageApiResponse {
  Id?: string;
  id?: string;
  ImagePath?: string;
  imagePath?: string;
  IsMain?: boolean;
  isMain?: boolean;
}

interface ProductVariantApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  ImagePath?: string | null;
  imagePath?: string | null;
  SortOrder?: number;
  sortOrder?: number;
  IsDefault?: boolean;
  isDefault?: boolean;
}

interface ProductCategoryApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
}

interface ProductApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Code?: string;
  code?: string;
  Brand?: string;
  brand?: string;
  Type?: string;
  type?: string;
  Weight?: number;
  weight?: number;
  Description?: string;
  description?: string;
  Price?: number;
  price?: number;
  Images?: ProductImageApiResponse[];
  images?: ProductImageApiResponse[];
  Variants?: ProductVariantApiResponse[];
  variants?: ProductVariantApiResponse[];
  Categories?: ProductCategoryApiResponse[];
  categories?: ProductCategoryApiResponse[];
  IsFavourite?: boolean;
  isFavourite?: boolean;
  IsInCart?: boolean;
  isInCart?: boolean;
  CartQuantity?: number;
  cartQuantity?: number;
}

const normalizeOptionalText = (value?: string | null): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

const mapProductResponse = (product: ProductApiResponse): Product => {
  const images = product.Images ?? product.images ?? [];
  const variants = product.Variants ?? product.variants ?? [];
  const categories = product.Categories ?? product.categories ?? [];

  return {
    id: product.Id ?? product.id ?? '',
    name: product.Name ?? product.name ?? '',
    code: product.Code ?? product.code ?? '',
    brand: normalizeOptionalText(product.Brand ?? product.brand),
    type: normalizeOptionalText(product.Type ?? product.type),
    weight: product.Weight ?? product.weight,
    description: product.Description ?? product.description,
    price: product.Price ?? product.price ?? 0,
    images: images.map((image) => ({
      id: image.Id ?? image.id ?? '',
      imagePath: image.ImagePath ?? image.imagePath ?? '',
      isMain: image.IsMain ?? image.isMain ?? false,
    })),
    variants: variants
      .map((variant, index) => ({
        id: variant.Id ?? variant.id ?? '',
        name: variant.Name ?? variant.name ?? '',
        imagePath: variant.ImagePath ?? variant.imagePath ?? null,
        sortOrder: variant.SortOrder ?? variant.sortOrder ?? index,
        isDefault: variant.IsDefault ?? variant.isDefault ?? false,
      }))
      .sort((firstVariant, secondVariant) => firstVariant.sortOrder - secondVariant.sortOrder),
    categories: categories.map((category) => ({
      id: category.Id ?? category.id ?? '',
      name: category.Name ?? category.name ?? '',
    })),
    isFavourite: product.IsFavourite ?? product.isFavourite ?? false,
    isInCart: product.IsInCart ?? product.isInCart ?? false,
    cartQuantity: product.CartQuantity ?? product.cartQuantity ?? 0,
  };
};

export const productDetailApi = {
  async getProduct(productId: string): Promise<Product> {
    if (env.enableMockApi) {
      await delay(300);
      const products = await productsApi.getProducts(
        {
          search: '',
          categoryId: 'all',
        },
        {
          page: 1,
          pageSize: 100,
        }
      );
      const product = products.items.find((item) => item.id === productId);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    const { data } = await apiClient.get<ProductApiResponse>(`/api/Products/${productId}`, {
      params: {
        includeCategories: true,
      },
    });

    return mapProductResponse(data);
  },
};
