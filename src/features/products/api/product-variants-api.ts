import { env } from '@/env';
import type { ProductVariant, ProductVariantInput } from '@/features/products/types/product-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

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

export interface ProductVariantMutationPayload extends ProductVariantInput {
  productId: string;
  variantId?: string;
}

const mockVariantsDb = new Map<string, ProductVariant[]>();

const buildVariantId = (): string => {
  return `vrn-${Math.floor(Math.random() * 9000) + 1000}`;
};

const normalizeOptionalText = (value?: string | null): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : undefined;
};

const mapProductVariantResponse = (variant: ProductVariantApiResponse, index = 0): ProductVariant => {
  return {
    id: variant.Id ?? variant.id ?? '',
    name: variant.Name ?? variant.name ?? '',
    imagePath: variant.ImagePath ?? variant.imagePath ?? null,
    sortOrder: variant.SortOrder ?? variant.sortOrder ?? index,
    isDefault: variant.IsDefault ?? variant.isDefault ?? false,
  };
};

const normalizeVariantList = (variants: ProductVariant[]): ProductVariant[] => {
  const sortedVariants = [...variants].sort((firstVariant, secondVariant) => firstVariant.sortOrder - secondVariant.sortOrder);

  if (sortedVariants.length === 0) {
    return [];
  }

  if (sortedVariants.some((variant) => variant.isDefault)) {
    const firstDefaultIndex = sortedVariants.findIndex((variant) => variant.isDefault);
    return sortedVariants.map((variant, index) => ({
      ...variant,
      isDefault: index === firstDefaultIndex,
    }));
  }

  return sortedVariants.map((variant, index) => ({
    ...variant,
    isDefault: index === 0,
  }));
};

const buildVariantFormData = (payload: ProductVariantInput): FormData => {
  const formData = new FormData();
  formData.append('Name', payload.name.trim());

  const imagePath = normalizeOptionalText(payload.imagePath);
  const imageId = normalizeOptionalText(payload.imageId);

  if (imagePath) {
    formData.append('ImagePath', imagePath);
  }

  if (imageId) {
    formData.append('ImageId', imageId);
  }

  if (payload.sortOrder != null) {
    formData.append('SortOrder', String(payload.sortOrder));
  }

  formData.append('IsDefault', String(Boolean(payload.isDefault)));

  if (payload.imageFile) {
    formData.append('Image', payload.imageFile);
  }

  return formData;
};

export const productVariantsApi = {
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    if (env.enableMockApi) {
      await delay(280);
      return normalizeVariantList(mockVariantsDb.get(productId) ?? []);
    }

    const { data } = await apiClient.get<ProductVariantApiResponse[]>(`/api/Products/${productId}/variants`);
    return (data ?? []).map(mapProductVariantResponse).sort((firstVariant, secondVariant) => firstVariant.sortOrder - secondVariant.sortOrder);
  },

  async createProductVariant(payload: ProductVariantMutationPayload): Promise<ProductVariant> {
    const normalizedName = payload.name.trim();

    if (!normalizedName) {
      throw new Error('Variant name is required.');
    }

    if (env.enableMockApi) {
      await delay(320);
      const currentVariants = mockVariantsDb.get(payload.productId) ?? [];
      const createdVariant: ProductVariant = {
        id: buildVariantId(),
        name: normalizedName,
        imagePath: payload.imageFile ? URL.createObjectURL(payload.imageFile) : normalizeOptionalText(payload.imagePath) ?? null,
        sortOrder: payload.sortOrder ?? currentVariants.length,
        isDefault: Boolean(payload.isDefault) || currentVariants.length === 0,
      };
      const nextVariants = normalizeVariantList([...currentVariants, createdVariant]);
      mockVariantsDb.set(payload.productId, nextVariants);
      return createdVariant;
    }

    const { data } = await apiClient.post<ProductVariantApiResponse>(
      `/api/Products/${payload.productId}/variants`,
      buildVariantFormData(payload)
    );

    return mapProductVariantResponse(data);
  },

  async updateProductVariant(payload: ProductVariantMutationPayload): Promise<ProductVariant> {
    if (!payload.variantId) {
      throw new Error('Variant id is required.');
    }

    const normalizedName = payload.name.trim();

    if (!normalizedName) {
      throw new Error('Variant name is required.');
    }

    if (env.enableMockApi) {
      await delay(320);
      const currentVariants = mockVariantsDb.get(payload.productId) ?? [];
      const updatedVariants = currentVariants.map((variant) =>
        variant.id === payload.variantId
          ? {
              ...variant,
              name: normalizedName,
              imagePath: payload.imageFile
                ? URL.createObjectURL(payload.imageFile)
                : normalizeOptionalText(payload.imagePath) ?? variant.imagePath ?? null,
              sortOrder: payload.sortOrder ?? variant.sortOrder,
              isDefault: Boolean(payload.isDefault),
            }
          : variant
      );
      const nextVariants = normalizeVariantList(updatedVariants);
      mockVariantsDb.set(payload.productId, nextVariants);
      return nextVariants.find((variant) => variant.id === payload.variantId) ?? updatedVariants[0];
    }

    const { data } = await apiClient.put<ProductVariantApiResponse>(
      `/api/Products/${payload.productId}/variants/${payload.variantId}`,
      buildVariantFormData(payload)
    );

    return mapProductVariantResponse(data);
  },

  async deleteProductVariant(productId: string, variantId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(250);
      const currentVariants = mockVariantsDb.get(productId) ?? [];
      mockVariantsDb.set(
        productId,
        normalizeVariantList(currentVariants.filter((variant) => variant.id !== variantId))
      );
      return;
    }

    await apiClient.delete(`/api/Products/${productId}/variants/${variantId}`);
  },
};
