export interface ProductImage {
  id: string;
  imagePath: string;
  isMain: boolean;
}

export interface ProductCategorySummary {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  images: ProductImage[];
  categories: ProductCategorySummary[];
  isFavourite: boolean;
  isInCart: boolean;
  cartQuantity: number;
}

export interface ProductsFilter {
  search: string;
  categoryId: string | 'all';
  code?: string;
}

export interface CreateProductInput {
  name: string;
  code: string;
  description?: string;
  price: number;
  imageFile?: File;
  categoryIds?: string[];
  categoryId?: string;
  categoryName?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  imageFile?: File;
  categoryIds?: string[];
  categoryId?: string;
  categoryName?: string;
}
