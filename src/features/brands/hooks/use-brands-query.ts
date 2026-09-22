import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { brandsApi } from '@/features/brands/api/brands-api';
import type { BrandInput, BrandsFilter } from '@/features/brands/types/brand-types';
import type { PaginationParams } from '@/types/api';

export const useBrandsQuery = (filters: BrandsFilter, pagination: PaginationParams) =>
  useQuery({
    queryKey: queryKeys.brands.list({ filters, pagination }),
    queryFn: () => brandsApi.getBrands(filters, pagination),
    placeholderData: keepPreviousData,
  });

export const useBrandOptionsQuery = () =>
  useQuery({
    queryKey: queryKeys.brands.options(),
    queryFn: brandsApi.getOptions,
  });

export const useCreateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BrandInput) => brandsApi.createBrand(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.root });
      toast.success('تمت إضافة العلامة التجارية');
    },
  });
};

export const useUpdateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BrandInput }) => brandsApi.updateBrand(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success('تم تحديث العلامة التجارية');
    },
  });
};

export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandsApi.deleteBrand,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.brands.root });
      toast.success('تم حذف العلامة التجارية');
    },
  });
};
