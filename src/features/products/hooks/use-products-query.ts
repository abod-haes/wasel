import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { productImagesApi } from '@/features/products/api/product-images-api';
import { productVariantsApi, type ProductVariantMutationPayload } from '@/features/products/api/product-variants-api';
import { productsDashboardApi } from '@/features/products/api/products-dashboard-api';
import type { CreateProductInput, ProductsFilter, UpdateProductInput } from '@/features/products/types/product-types';
import type { PaginationParams } from '@/types/api';

export const useProductsQuery = (filters: ProductsFilter, pagination: PaginationParams) => useQuery({
  queryKey: queryKeys.products.list({ filters, pagination }),
  queryFn: () => productsDashboardApi.getProducts(filters, pagination),
  placeholderData: keepPreviousData,
});

export const useProductQuery = (productId: string | undefined) => useQuery({
  queryKey: queryKeys.products.detail(productId ?? ''),
  queryFn: () => productsDashboardApi.getProduct(productId ?? ''),
  enabled: Boolean(productId),
});

export const useProductsBriefQuery = () => useQuery({
  queryKey: queryKeys.products.brief(),
  queryFn: () => productsDashboardApi.getProductsBrief(),
});

export const useProductVariantsQuery = (productId: string | undefined) => useQuery({
  queryKey: queryKeys.products.variants(productId ?? ''),
  queryFn: () => productVariantsApi.getProductVariants(productId ?? ''),
  enabled: Boolean(productId),
});

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsDashboardApi.createProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('products.messages.created'));
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (payload: UpdateProductInput) => productsDashboardApi.updateProduct(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('products.messages.updated'));
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (productId: string) => productsDashboardApi.deleteProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('products.messages.deleted'));
    },
  });
};

export const useImportProductsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => productsDashboardApi.importProducts(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success('تم استيراد ملف المنتجات بنجاح');
    },
  });
};

const invalidateProductImages = (queryClient: QueryClient, productId: string): void => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
};

export const useAddProductImagesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) => productImagesApi.addImages(productId, files),
    onSuccess: (_, payload) => {
      invalidateProductImages(queryClient, payload.productId);
      toast.success('تمت إضافة الصور بنجاح');
    },
  });
};

export const useReplaceMainProductImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => productImagesApi.replaceMainImage(productId, file),
    onSuccess: (_, payload) => {
      invalidateProductImages(queryClient, payload.productId);
      toast.success('تم استبدال الصورة الرئيسية');
    },
  });
};

export const useDeleteProductImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) => productImagesApi.deleteImage(productId, imageId),
    onSuccess: (_, payload) => {
      invalidateProductImages(queryClient, payload.productId);
      toast.success('تم حذف الصورة');
    },
  });
};

export const useSetMainProductImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) => productImagesApi.setMainImage(productId, imageId),
    onSuccess: (_, payload) => {
      invalidateProductImages(queryClient, payload.productId);
      toast.success('تم تعيين الصورة الرئيسية');
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
    mutationFn: ({ productId, variantId }: { productId: string; variantId: string }) => productVariantsApi.deleteProductVariant(productId, variantId),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.variants(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(payload.productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success('تم حذف النكهة بنجاح');
    },
  });
};
