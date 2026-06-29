import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { productDetailApi } from '@/features/products/api/product-detail-api';
import { productVariantsApi, type ProductVariantMutationPayload } from '@/features/products/api/product-variants-api';
import { productsApi } from '@/features/products/api/products-api';
import type {
  CreateProductInput,
  ProductsFilter,
  UpdateProductInput,
} from '@/features/products/types/product-types';
import type { PaginationParams } from '@/types/api';

export const useProductsQuery = (filters: ProductsFilter, pagination: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.products.list({ filters, pagination }),
    queryFn: () => productsApi.getProducts(filters, pagination),
    placeholderData: keepPreviousData,
  });
};

export const useProductQuery = (productId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.products.detail(productId ?? ''),
    queryFn: () => productDetailApi.getProduct(productId ?? ''),
    enabled: Boolean(productId),
  });
};

export const useProductVariantsQuery = (productId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.products.variants(productId ?? ''),
    queryFn: () => productVariantsApi.getProductVariants(productId ?? ''),
    enabled: Boolean(productId),
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsApi.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('products.messages.created'));
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateProductInput) => productsApi.updateProduct(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.id) });
      toast.success(t('products.messages.updated'));
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('products.messages.deleted'));
    },
  });
};

export const useCreateProductVariantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductVariantMutationPayload) => productVariantsApi.createProductVariant(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.variants(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success('تمت إضافة النكهة بنجاح');
    },
  });
};

export const useUpdateProductVariantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductVariantMutationPayload) => productVariantsApi.updateProductVariant(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.variants(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success('تم تحديث النكهة بنجاح');
    },
  });
};

export const useDeleteProductVariantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) =>
      productVariantsApi.deleteProductVariant(productId, variantId),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.variants(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success('تم حذف النكهة بنجاح');
    },
  });
};
