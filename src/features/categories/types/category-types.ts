export type ProductWeightUnit = 'g' | 'Kg' | 'L';

export interface CategoryProductSummary {
  id: string;
  name: string;
  price: number;
  mainImagePath?: string;
  brand?: string;
  type?: string;
  weight?: number;
  weightUnit?: ProductWeightUnit;
}

export interface CategorySummary {
  id: string;
  name: string;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  description?: string;
  imagePath?: string;
  parentCategoryId?: string;
  children: CategoryTreeNode[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imagePath?: string;
  parentCategoryId?: string;
  parentCategory?: CategorySummary;
  children?: CategorySummary[];
  products: CategoryProductSummary[];
}

export interface CategoriesFilter {
  search: string;
  byParentId?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  level?: number;
  parentCategoryId?: string;
  descendantIds?: string[];
}

export interface ProductBriefOption {
  id: string;
  name: string;
  parCode?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  imageFile?: File;
  parentCategoryId?: string;
  productIds?: string[];
  removeImage?: boolean;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: string;
}
