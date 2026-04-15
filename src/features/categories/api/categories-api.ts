import { env } from '@/env';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/features/categories/schemas/category-form-schema';
import type {
  Category,
  CategoryOption,
  CategoriesFilter,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/types/category-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { ApiPaginatedResult } from '@/types/api';

interface CategoryProductSummaryApi {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Price?: number;
  price?: number;
  MainImagePath?: string;
  mainImagePath?: string;
}

interface CategoryApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  ImagePath?: string;
  imagePath?: string;
  Products?: CategoryProductSummaryApi[];
  products?: CategoryProductSummaryApi[];
}

interface CategoryOptionApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
}

type CategoryPaginatedResponse = Partial<ApiPaginatedResult<CategoryApiResponse>> & {
  items?: CategoryApiResponse[];
};

type CategoryOptionPaginatedResponse = Partial<ApiPaginatedResult<CategoryOptionApiResponse>> & {
  items?: CategoryOptionApiResponse[];
};

let categoriesDb: Category[] = [
  {
    id: 'cat-1',
    name: 'المشروبات',
    description: 'مشروبات باردة وساخنة',
    imagePath: 'storage/categories/beverages.jpg',
    products: [
      {
        id: 'prd-1',
        name: 'عصير تفاح',
        price: 12.5,
        mainImagePath: 'storage/products/apple-juice.jpg',
      },
      {
        id: 'prd-2',
        name: 'عصير برتقال',
        price: 13,
        mainImagePath: 'storage/products/orange-juice.jpg',
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'الوجبات الخفيفة',
    description: 'مأكولات خفيفة وسناكات',
    imagePath: 'storage/categories/snacks.jpg',
    products: [
      {
        id: 'prd-3',
        name: 'شيبس بطاطا',
        price: 8,
        mainImagePath: 'storage/products/chips.jpg',
      },
      {
        id: 'prd-4',
        name: 'مكسرات مملحة',
        price: 17,
        mainImagePath: 'storage/products/nuts.jpg',
      },
    ],
  },
  {
    id: 'cat-3',
    name: 'الألبان',
    description: 'حليب وأجبان وألبان',
    imagePath: 'storage/categories/dairy.jpg',
    products: [
      {
        id: 'prd-5',
        name: 'حليب طازج',
        price: 9.75,
        mainImagePath: 'storage/products/milk.jpg',
      },
    ],
  },
];

const mapCategoryResponse = (category: CategoryApiResponse): Category => {
  const products = category.Products ?? category.products ?? [];

  return {
    id: category.Id ?? category.id ?? '',
    name: category.Name ?? category.name ?? '',
    description: category.Description ?? category.description,
    imagePath: category.ImagePath ?? category.imagePath,
    products: products.map((product) => ({
      id: product.Id ?? product.id ?? '',
      name: product.Name ?? product.name ?? '',
      price: product.Price ?? product.price ?? 0,
      mainImagePath: product.MainImagePath ?? product.mainImagePath,
    })),
  };
};

const getPaginatedItems = <T>(
  data: Partial<ApiPaginatedResult<T>> & { items?: T[] }
): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const cloneCategory = (category: Category): Category => {
  return {
    ...category,
    products: category.products.map((product) => ({ ...product })),
  };
};

const buildCategoryId = (): string => {
  return `cat-${Math.floor(Math.random() * 9000) + 1000}`;
};

const normalizeOptionalText = (value?: string): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

const applySearchFilter = (categories: Category[], search: string): Category[] => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return categories;
  }

  return categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(normalizedSearch) ||
      (category.description ?? '').toLowerCase().includes(normalizedSearch)
    );
  });
};

export const categoriesApi = {
  async getCategories(filters: CategoriesFilter): Promise<Category[]> {
    if (env.enableMockApi) {
      await delay(350);
      return applySearchFilter(categoriesDb.map(cloneCategory), filters.search);
    }

    const { data } = await apiClient.get<CategoryPaginatedResponse>('/api/Categories', {
      params: {
        page: 1,
        pageSize: 100,
        includeProducts: true,
      },
    });

    const mappedCategories = getPaginatedItems(data).map(mapCategoryResponse);
    return applySearchFilter(mappedCategories, filters.search);
  },

  async createCategory(payload: CreateCategoryInput): Promise<void> {
    const parsed = createCategorySchema.parse(payload);
    const normalizedDescription = normalizeOptionalText(parsed.description);

    if (env.enableMockApi) {
      await delay(450);

      const createdCategory: Category = {
        id: buildCategoryId(),
        name: parsed.name.trim(),
        description: normalizedDescription,
        imagePath: parsed.imageFile ? URL.createObjectURL(parsed.imageFile) : undefined,
        products: [],
      };

      categoriesDb = [createdCategory, ...categoriesDb];
      return;
    }

    const formData = new FormData();
    formData.append('Name', parsed.name.trim());

    if (parsed.description != null) {
      formData.append('Description', parsed.description.trim());
    }

    if (parsed.imageFile) {
      formData.append('Image', parsed.imageFile);
    }

    await apiClient.post('/api/Categories', formData);
  },

  async updateCategory(payload: UpdateCategoryInput): Promise<void> {
    const parsed = updateCategorySchema.parse(payload);
    const hasDescription = Object.prototype.hasOwnProperty.call(parsed, 'description');

    if (env.enableMockApi) {
      await delay(450);

      let isUpdated = false;

      categoriesDb = categoriesDb.map((category) => {
        if (category.id !== parsed.id) {
          return category;
        }

        isUpdated = true;

        const nextCategory: Category = {
          ...category,
        };

        if (parsed.name != null) {
          nextCategory.name = parsed.name.trim();
        }

        if (hasDescription) {
          nextCategory.description = normalizeOptionalText(parsed.description);
        }

        if (parsed.imageFile) {
          nextCategory.imagePath = URL.createObjectURL(parsed.imageFile);
        }

        return nextCategory;
      });

      if (!isUpdated) {
        throw new Error('Category not found');
      }

      return;
    }

    const formData = new FormData();

    if (parsed.name != null) {
      formData.append('Name', parsed.name.trim());
    }

    if (hasDescription) {
      formData.append('Description', parsed.description?.trim() ?? '');
    }

    if (parsed.imageFile) {
      formData.append('Image', parsed.imageFile);
    }

    await apiClient.put(`/api/Categories/${parsed.id}`, formData);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(350);

      const previousLength = categoriesDb.length;
      categoriesDb = categoriesDb.filter((category) => category.id !== categoryId);

      if (categoriesDb.length === previousLength) {
        throw new Error('Category not found');
      }

      return;
    }

    await apiClient.delete(`/api/Categories/${categoryId}`);
  },

  async getCategoryOptions(): Promise<CategoryOption[]> {
    if (env.enableMockApi) {
      await delay(250);
      return categoriesDb.map((category) => ({
        id: category.id,
        name: category.name,
      }));
    }

    const { data } = await apiClient.get<CategoryOptionPaginatedResponse>('/api/Categories', {
      params: {
        page: 1,
        pageSize: 100,
        includeProducts: false,
      },
    });

    return getPaginatedItems(data).map((category) => ({
      id: category.Id ?? category.id ?? '',
      name: category.Name ?? category.name ?? '',
    }));
  },
};
