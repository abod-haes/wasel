export type ProductWeightUnit = 'g' | 'Kg' | 'L';
export type ProductCurrency = 'USD' | 'SYP' | 'TRY';

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

export interface ProductPriceInfo {
  basePrice: number;
  baseCurrency: 'USD';
  priceUsd: number;
  priceSyp: number;
  priceTry: number;
  displayCurrency: ProductCurrency;
  displayPrice: number;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  brandId?: string;
  brand?: string;
  marketUserId?: string;
  marketName?: string;
  type?: string;
  weight?: number;
  weightUnit?: ProductWeightUnit;
  description?: string;
  price: number;
  basePrice?: number;
  baseCurrency?: 'USD';
  priceCurrency?: ProductCurrency;
  prices?: ProductPriceInfo;
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
  categoryIds?: string[];
  code?: string;
  brandId?: string | 'all';
  marketUserId?: string | 'all';
  marketName?: string;
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

export interface ProductBrief {
  id: string;
  name: string;
  parCode?: string;
  brandId?: string;
  brand?: string;
  marketUserId?: string;
  marketName?: string;
  type?: string;
  weight?: number;
  weightUnit?: ProductWeightUnit;
}

export interface CreateProductInput {
  name: string;
  code: string;
  brandId?: string;
  brand?: string;
  marketUserId: string;
  type?: string;
  weight?: number;
  weightUnit?: ProductWeightUnit;
  description?: string;
  price: number;
  imageFile?: File;
  categoryIds?: string[];
  categoryId?: string;
  categoryName?: string;
  variants?: ProductVariantInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  clearBrand?: boolean;
  clearCategories?: boolean;
  clearVariants?: boolean;
}
