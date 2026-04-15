export interface CategoryProductSummary {
  id: string;
  name: string;
  price: number;
  mainImagePath?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imagePath?: string;
  products: CategoryProductSummary[];
}

export interface CategoriesFilter {
  search: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  imageFile?: File;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  description?: string;
  imageFile?: File;
}
