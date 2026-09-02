import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { categoriesDashboardApi } from '@/features/categories/api/categories-dashboard-api';
import type {
  CategoriesFilter,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/types/category-types';
import type { PaginationParams } from '@/types/api';

export const useCategoriesQuery = (filters: CategoriesFilter, pagination: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.categories.list({ filters, pagination }),
    queryFn: () => categoriesDashboardApi.getCategories(filters, pagination),
    placeholderData: keepPreviousData,
  });
};

export const useCategoryTreeQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: () => categoriesDashboardApi.getCategoryTree(),
  });
};

export const useCategoryOptionsQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.options(),
    queryFn: () => categoriesDashboardApi.getCategoryOptions(),
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => categoriesDashboardApi.createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('categories.messages.created'));
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateCategoryInput) => categoriesDashboardApi.updateCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('categories.messages.updated'));
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesDashboardApi.deleteCategory(categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('categories.messages.deleted'));
    },
  });
};
