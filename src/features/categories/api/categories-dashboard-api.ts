import { env } from '@/env';
import { categoriesApi as legacyCategoriesApi } from '@/features/categories/api/categories-api';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/features/categories/schemas/category-form-schema';
import type {
  CategoriesFilter,
  Category,
  CategoryOption,
  CategoryTreeNode,
  CreateCategoryInput,
  ProductWeightUnit,
  UpdateCategoryInput,
} from '@/features/categories/types/category-types';
import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { ApiPaginatedResult, PaginatedData, PaginationParams } from '@/types/api';

interface CategoryProductSummaryApi {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  price?: number;
  Price?: number;
  mainImagePath?: string;
  MainImagePath?: string;
  brand?: string;
  Brand?: string;
  type?: string;
  Type?: string;
  weight?: number;
  Weight?: number;
  weightUnit?: ProductWeightUnit;
  WeightUnit?: ProductWeightUnit;
}

interface CategorySummaryApi {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
}

interface CategoryApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  imagePath?: string;
  ImagePath?: string;
  parentCategoryId?: string;
  ParentCategoryId?: string;
  parentCategory?: CategorySummaryApi;
  ParentCategory?: CategorySummaryApi;
  children?: CategorySummaryApi[];
  Children?: CategorySummaryApi[];
  products?: CategoryProductSummaryApi[];
  Products?: CategoryProductSummaryApi[];
}

interface CategoryTreeApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  imagePath?: string;
  ImagePath?: string;
  parentCategoryId?: string;
  ParentCategoryId?: string;
  children?: CategoryTreeApiResponse[];
  Children?: CategoryTreeApiResponse[];
}

type CategoryPaginatedResponse = Partial<ApiPaginatedResult<CategoryApiResponse>> & {
  items?: CategoryApiResponse[];
};

const normalizeOptionalText = (value?: string | null): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const mapSummary = (summary?: CategorySummaryApi) => {
  if (!summary) {
    return undefined;
  }

  return {
    id: summary.id ?? summary.Id ?? '',
    name: summary.name ?? summary.Name ?? '',
  };
};

const mapCategory = (category: CategoryApiResponse): Category => {
  const products = category.products ?? category.Products ?? [];
  const children = category.children ?? category.Children ?? [];

  return {
    id: category.id ?? category.Id ?? '',
    name: category.name ?? category.Name ?? '',
    description: normalizeOptionalText(category.description ?? category.Description),
    imagePath: normalizeOptionalText(category.imagePath ?? category.ImagePath),
    parentCategoryId: normalizeOptionalText(category.parentCategoryId ?? category.ParentCategoryId),
    parentCategory: mapSummary(category.parentCategory ?? category.ParentCategory),
    children: children.map((child) => ({
      id: child.id ?? child.Id ?? '',
      name: child.name ?? child.Name ?? '',
    })),
    products: products.map((product) => ({
      id: product.id ?? product.Id ?? '',
      name: product.name ?? product.Name ?? '',
      price: product.price ?? product.Price ?? 0,
      mainImagePath: normalizeOptionalText(product.mainImagePath ?? product.MainImagePath),
      brand: normalizeOptionalText(product.brand ?? product.Brand),
      type: normalizeOptionalText(product.type ?? product.Type),
      weight: product.weight ?? product.Weight,
      weightUnit: product.weightUnit ?? product.WeightUnit,
    })),
  };
};

const mapTreeNode = (node: CategoryTreeApiResponse): CategoryTreeNode => {
  const children = node.children ?? node.Children ?? [];

  return {
    id: node.id ?? node.Id ?? '',
    name: node.name ?? node.Name ?? '',
    description: normalizeOptionalText(node.description ?? node.Description),
    imagePath: normalizeOptionalText(node.imagePath ?? node.ImagePath),
    parentCategoryId: normalizeOptionalText(node.parentCategoryId ?? node.ParentCategoryId),
    children: children.map(mapTreeNode),
  };
};

const collectDescendantIds = (node: CategoryTreeNode): string[] => {
  return node.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
};

const flattenTree = (nodes: CategoryTreeNode[], level = 0): CategoryOption[] => {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      level,
      parentCategoryId: node.parentCategoryId,
      descendantIds: collectDescendantIds(node),
    },
    ...flattenTree(node.children, level + 1),
  ]);
};

const appendCategoryFormData = (
  formData: FormData,
  payload: CreateCategoryInput,
  options: { includeRemoveImage?: boolean } = {}
): void => {
  formData.append('Name', payload.name.trim());
  formData.append('Description', payload.description?.trim() ?? '');

  if (payload.parentCategoryId) {
    formData.append('ParentCategoryId', payload.parentCategoryId);
  }

  (payload.productIds ?? []).forEach((productId) => {
    formData.append('ProductIds', productId);
  });

  if (payload.imageFile) {
    formData.append('Image', payload.imageFile);
  }

  if (options.includeRemoveImage && payload.removeImage && !payload.imageFile) {
    formData.append('RemoveImage', 'true');
  }
};

const filterCurrentPage = (categories: Category[], search: string): Category[] => {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return categories;
  }

  return categories.filter((category) =>
    [category.name, category.description, category.parentCategory?.name]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedSearch))
  );
};

const getCategoryTreeData = async (): Promise<CategoryTreeNode[]> => {
  if (env.enableMockApi) {
    const options = await legacyCategoriesApi.getCategoryOptions();
    return options.map((option) => ({
      id: option.id,
      name: option.name,
      children: [],
    }));
  }

  const { data } = await apiClient.get<CategoryTreeApiResponse[]>('/api/Categories/tree');
  return (data ?? []).map(mapTreeNode);
};

export const categoriesDashboardApi = {
  async getCategories(filters: CategoriesFilter, pagination: PaginationParams): Promise<PaginatedData<Category>> {
    if (env.enableMockApi) {
      const legacy = await legacyCategoriesApi.getCategories(filters, pagination);
      return {
        ...legacy,
        items: legacy.items.map((category) => ({
          ...category,
          parentCategoryId: undefined,
          parentCategory: undefined,
          children: [],
        })),
      };
    }

    const { data } = await apiClient.get<CategoryPaginatedResponse>('/api/Categories', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        includeProducts: true,
        byParentId: filters.byParentId || undefined,
      },
    });

    const paginated = toPaginatedData(data, pagination);
    const mappedItems = paginated.items.map(mapCategory);

    return {
      ...paginated,
      items: filterCurrentPage(mappedItems, filters.search),
    };
  },

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    return getCategoryTreeData();
  },

  async getCategoryOptions(): Promise<CategoryOption[]> {
    const tree = await getCategoryTreeData();
    return flattenTree(tree);
  },

  async createCategory(payload: CreateCategoryInput): Promise<void> {
    const parsed = createCategorySchema.parse(payload);

    if (env.enableMockApi) {
      await legacyCategoriesApi.createCategory(parsed);
      return;
    }

    const formData = new FormData();
    appendCategoryFormData(formData, parsed);
    await apiClient.post('/api/Categories', formData);
  },

  async updateCategory(payload: UpdateCategoryInput): Promise<void> {
    const parsed = updateCategorySchema.parse(payload);

    if (env.enableMockApi) {
      await legacyCategoriesApi.updateCategory({
        id: parsed.id,
        name: parsed.name,
        description: parsed.description,
        imageFile: parsed.imageFile,
      });
      return;
    }

    const formData = new FormData();
    appendCategoryFormData(formData, parsed, { includeRemoveImage: true });
    await apiClient.put(`/api/Categories/${parsed.id}`, formData);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    if (env.enableMockApi) {
      await legacyCategoriesApi.deleteCategory(categoryId);
      return;
    }

    await apiClient.delete(`/api/Categories/${categoryId}`);
  },
};
