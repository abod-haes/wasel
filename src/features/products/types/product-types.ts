export interface ProductImage {
  id: string;
  imagePath: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  imagePath?: string | null;
  sortOrder: number;
  isDefault: boolean;
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
  variants: ProductVariant[];
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

export interface ProductVariantInput {
  id?: string;
  name: string;
  imageFile?: File;
  imagePath?: string | null;
  imageId?: string;
  sortOrder?: number;
  isDefault?: boolean;
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
  variants?: ProductVariantInput[];
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
  variants?: ProductVariantInput[];
  clearVariants?: boolean;
}
