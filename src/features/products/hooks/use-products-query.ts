import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { productsApi } from '@/features/products/api/products-api';
import type {
  CreateProductInput,
  ProductsFilter,
  UpdateProductInput,
} from '@/features/products/types/product-types';

export const useProductsQuery = (filters: ProductsFilter) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsApi.getProducts(filters),
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
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
