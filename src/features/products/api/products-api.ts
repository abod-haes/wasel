import { env } from '@/env';
import { createProductSchema, updateProductSchema } from '@/features/products/schemas/product-form-schema';
import type {
  CreateProductInput,
  Product,
  ProductsFilter,
  UpdateProductInput,
} from '@/features/products/types/product-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { ApiPaginatedResult } from '@/types/api';

interface ProductImageApiResponse {
  Id?: string;
  id?: string;
  ImagePath?: string;
  imagePath?: string;
  IsMain?: boolean;
  isMain?: boolean;
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
  Description?: string;
  description?: string;
  Price?: number;
  price?: number;
  Images?: ProductImageApiResponse[];
  images?: ProductImageApiResponse[];
  Categories?: ProductCategoryApiResponse[];
  categories?: ProductCategoryApiResponse[];
  IsFavourite?: boolean;
  isFavourite?: boolean;
  IsInCart?: boolean;
  isInCart?: boolean;
  CartQuantity?: number;
  cartQuantity?: number;
}

type ProductPaginatedResponse = Partial<ApiPaginatedResult<ProductApiResponse>> & {
  items?: ProductApiResponse[];
};

let productsDb: Product[] = [
  {
    id: 'prd-1',
    name: 'عصير تفاح',
    code: 'AJ-001',
    description: 'عصير تفاح طبيعي',
    price: 12.5,
    images: [
      {
        id: 'img-1',
        imagePath: 'storage/products/apple-juice.jpg',
        isMain: true,
      },
    ],
    categories: [
      {
        id: 'cat-1',
        name: 'المشروبات',
      },
    ],
    isFavourite: false,
    isInCart: true,
    cartQuantity: 2,
  },
  {
    id: 'prd-2',
    name: 'عصير برتقال',
    code: 'OJ-002',
    description: 'عصير برتقال طازج',
    price: 13,
    images: [
      {
        id: 'img-2',
        imagePath: 'storage/products/orange-juice.jpg',
        isMain: true,
      },
    ],
    categories: [
      {
        id: 'cat-1',
        name: 'المشروبات',
      },
    ],
    isFavourite: true,
    isInCart: false,
    cartQuantity: 0,
  },
  {
    id: 'prd-3',
    name: 'شيبس بطاطا',
    code: 'PC-003',
    description: 'شيبس بطاطا مقرمش',
    price: 8,
    images: [
      {
        id: 'img-3',
        imagePath: 'storage/products/chips.jpg',
        isMain: true,
      },
    ],
    categories: [
      {
        id: 'cat-2',
        name: 'الوجبات الخفيفة',
      },
    ],
    isFavourite: false,
    isInCart: false,
    cartQuantity: 0,
  },
  {
    id: 'prd-4',
    name: 'حليب طازج',
    code: 'FM-004',
    description: 'حليب طازج عالي الجودة',
    price: 9.75,
    images: [
      {
        id: 'img-4',
        imagePath: 'storage/products/milk.jpg',
        isMain: true,
      },
    ],
    categories: [
      {
        id: 'cat-3',
        name: 'الألبان',
      },
    ],
    isFavourite: false,
    isInCart: true,
    cartQuantity: 1,
  },
];

const mapProductResponse = (product: ProductApiResponse): Product => {
  const images = product.Images ?? product.images ?? [];
  const categories = product.Categories ?? product.categories ?? [];

  return {
    id: product.Id ?? product.id ?? '',
    name: product.Name ?? product.name ?? '',
    code: product.Code ?? product.code ?? '',
    description: product.Description ?? product.description,
    price: product.Price ?? product.price ?? 0,
    images: images.map((image) => ({
      id: image.Id ?? image.id ?? '',
      imagePath: image.ImagePath ?? image.imagePath ?? '',
      isMain: image.IsMain ?? image.isMain ?? false,
    })),
    categories: categories.map((category) => ({
      id: category.Id ?? category.id ?? '',
      name: category.Name ?? category.name ?? '',
    })),
    isFavourite: product.IsFavourite ?? product.isFavourite ?? false,
    isInCart: product.IsInCart ?? product.isInCart ?? false,
    cartQuantity: product.CartQuantity ?? product.cartQuantity ?? 0,
  };
};

const getPaginatedItems = <T>(
  data: Partial<ApiPaginatedResult<T>> & { items?: T[] }
): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const cloneProduct = (product: Product): Product => {
  return {
    ...product,
    images: product.images.map((image) => ({ ...image })),
    categories: product.categories.map((category) => ({ ...category })),
  };
};

const buildProductId = (): string => {
  return `prd-${Math.floor(Math.random() * 9000) + 1000}`;
};

const buildProductImageId = (): string => {
  return `img-${Math.floor(Math.random() * 9000) + 1000}`;
};

const normalizeOptionalText = (value?: string): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

const normalizeCategoryIds = (payload: {
  categoryId?: string;
  categoryIds?: string[];
}): string[] => {
  const categoryIds = payload.categoryIds ?? [];
  const normalizedCategoryIds = categoryIds
    .map((categoryId) => categoryId.trim())
    .filter((categoryId) => categoryId.length > 0);
  const normalizedCategoryId = normalizeOptionalText(payload.categoryId);

  if (!normalizedCategoryId) {
    return Array.from(new Set(normalizedCategoryIds));
  }

  return Array.from(new Set([...normalizedCategoryIds, normalizedCategoryId]));
};

const buildCategoryLookup = (): Map<string, string> => {
  const categoryMap = new Map<string, string>();

  productsDb.forEach((product) => {
    product.categories.forEach((category) => {
      categoryMap.set(category.id, category.name);
    });
  });

  return categoryMap;
};

const resolveCategoryName = (
  categoryLookup: Map<string, string>,
  categoryId?: string,
  categoryName?: string
): string | undefined => {
  return categoryName || (categoryId ? categoryLookup.get(categoryId) : undefined);
};

const applyFilters = (products: Product[], filters: ProductsFilter): Product[] => {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const normalizedCode = filters.code?.trim().toLowerCase() ?? '';

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch) ||
      (product.description ?? '').toLowerCase().includes(normalizedSearch);
    const matchesCode = !normalizedCode || product.code.toLowerCase().includes(normalizedCode);

    const matchesCategory =
      filters.categoryId === 'all' ||
      product.categories.some((category) => category.id === filters.categoryId);

    return matchesSearch && matchesCode && matchesCategory;
  });
};

export const productsApi = {
  async getProducts(filters: ProductsFilter): Promise<Product[]> {
    if (env.enableMockApi) {
      await delay(420);
      return applyFilters(productsDb.map(cloneProduct), filters);
    }

    const { data } = await apiClient.get<ProductPaginatedResponse>('/api/Products', {
      params: {
        page: 1,
        pageSize: 100,
        includeCategories: true,
        search: filters.search || undefined,
        code: filters.code?.trim() || undefined,
        categoryIds: filters.categoryId === 'all' ? undefined : [filters.categoryId],
      },
    });

    const mappedProducts = getPaginatedItems(data).map(mapProductResponse);
    return applyFilters(mappedProducts, filters);
  },

  async createProduct(payload: CreateProductInput): Promise<void> {
    const parsed = createProductSchema.parse(payload);
    const normalizedDescription = normalizeOptionalText(parsed.description);
    const normalizedCategoryIds = normalizeCategoryIds(parsed);
    const normalizedCategoryId = normalizedCategoryIds[0];
    const normalizedCategoryName = normalizeOptionalText(parsed.categoryName);

    if (env.enableMockApi) {
      await delay(450);

      const categoryLookup = buildCategoryLookup();
      const nextCategoryName = resolveCategoryName(
        categoryLookup,
        normalizedCategoryId,
        normalizedCategoryName
      );

      const createdProduct: Product = {
        id: buildProductId(),
        name: parsed.name.trim(),
        code: parsed.code.trim(),
        description: normalizedDescription,
        price: parsed.price,
        images: parsed.imageFile
          ? [
              {
                id: buildProductImageId(),
                imagePath: URL.createObjectURL(parsed.imageFile),
                isMain: true,
              },
            ]
          : [],
        categories:
          normalizedCategoryId && nextCategoryName
            ? [
                {
                  id: normalizedCategoryId,
                  name: nextCategoryName,
                },
              ]
            : [],
        isFavourite: false,
        isInCart: false,
        cartQuantity: 0,
      };

      productsDb = [createdProduct, ...productsDb];
      return;
    }

    const formData = new FormData();
    formData.append('Name', parsed.name.trim());
    formData.append('Code', parsed.code.trim());
    formData.append('Price', String(parsed.price));

    if (parsed.description != null) {
      formData.append('Description', parsed.description.trim());
    }

    normalizedCategoryIds.forEach((categoryId) => {
      formData.append('CategoryIds', categoryId);
    });

    if (parsed.imageFile) {
      formData.append('Image', parsed.imageFile);
    }

    await apiClient.post('/api/Products', formData);
  },

  async updateProduct(payload: UpdateProductInput): Promise<void> {
    const parsed = updateProductSchema.parse(payload);
    const hasDescription = Object.prototype.hasOwnProperty.call(parsed, 'description');
    const hasCategoryId = Object.prototype.hasOwnProperty.call(parsed, 'categoryId');
    const hasCategoryIds = Object.prototype.hasOwnProperty.call(parsed, 'categoryIds');
    const shouldUpdateCategories = hasCategoryId || hasCategoryIds;
    const normalizedDescription = normalizeOptionalText(parsed.description);
    const normalizedCategoryIds = normalizeCategoryIds(parsed);
    const normalizedCategoryId = normalizedCategoryIds[0];
    const normalizedCategoryName = normalizeOptionalText(parsed.categoryName);

    if (env.enableMockApi) {
      await delay(450);

      let isUpdated = false;
      const categoryLookup = buildCategoryLookup();
      const nextCategoryName = resolveCategoryName(
        categoryLookup,
        normalizedCategoryId,
        normalizedCategoryName
      );

      productsDb = productsDb.map((product) => {
        if (product.id !== parsed.id) {
          return product;
        }

        isUpdated = true;

        const nextProduct: Product = {
          ...product,
          images: product.images.map((image) => ({ ...image })),
          categories: product.categories.map((category) => ({ ...category })),
        };

        if (parsed.name != null) {
          nextProduct.name = parsed.name.trim();
        }

        if (parsed.code != null) {
          nextProduct.code = parsed.code.trim();
        }

        if (parsed.price != null) {
          nextProduct.price = parsed.price;
        }

        if (hasDescription) {
          nextProduct.description = normalizedDescription;
        }

        if (parsed.imageFile) {
          nextProduct.images = [
            {
              id: buildProductImageId(),
              imagePath: URL.createObjectURL(parsed.imageFile),
              isMain: true,
            },
          ];
        }

        if (shouldUpdateCategories) {
          nextProduct.categories =
            normalizedCategoryId && nextCategoryName
              ? [
                  {
                    id: normalizedCategoryId,
                    name: nextCategoryName,
                  },
                ]
              : [];
        }

        return nextProduct;
      });

      if (!isUpdated) {
        throw new Error('Product not found');
      }

      return;
    }

    if (parsed.imageFile) {
      const formData = new FormData();

      if (parsed.name != null) {
        formData.append('Name', parsed.name.trim());
      }

      if (parsed.code != null) {
        formData.append('Code', parsed.code.trim());
      }

      if (parsed.price != null) {
        formData.append('Price', String(parsed.price));
      }

      if (hasDescription) {
        formData.append('Description', parsed.description?.trim() ?? '');
      }

      if (shouldUpdateCategories) {
        normalizedCategoryIds.forEach((categoryId) => {
          formData.append('CategoryIds', categoryId);
        });
      }

      formData.append('Image', parsed.imageFile);

      await apiClient.put(`/api/Products/${parsed.id}/with-image`, formData);
      return;
    }

    const requestPayload: Record<string, unknown> = {};

    if (parsed.name != null) {
      requestPayload.name = parsed.name.trim();
    }

    if (parsed.code != null) {
      requestPayload.code = parsed.code.trim();
    }

    if (parsed.price != null) {
      requestPayload.price = parsed.price;
    }

    if (hasDescription) {
      requestPayload.description = parsed.description?.trim() ?? '';
    }

    if (shouldUpdateCategories) {
      requestPayload.categoryIds = normalizedCategoryIds;
    }

    await apiClient.put(`/api/Products/${parsed.id}`, requestPayload);
  },

  async deleteProduct(productId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(350);

      const previousLength = productsDb.length;
      productsDb = productsDb.filter((product) => product.id !== productId);

      if (productsDb.length === previousLength) {
        throw new Error('Product not found');
      }

      return;
    }

    await apiClient.delete(`/api/Products/${productId}`);
  },
};
