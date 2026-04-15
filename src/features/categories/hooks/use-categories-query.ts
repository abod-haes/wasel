import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { categoriesApi } from '@/features/categories/api/categories-api';
import type {
  CategoriesFilter,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/features/categories/types/category-types';

export const useCategoriesQuery = (filters: CategoriesFilter) => {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: () => categoriesApi.getCategories(filters),
  });
};

export const useCategoryOptionsQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.options(),
    queryFn: () => categoriesApi.getCategoryOptions(),
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => categoriesApi.createCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('categories.messages.created'));
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateCategoryInput) => categoriesApi.updateCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('categories.messages.updated'));
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.deleteCategory(categoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.root });
      toast.success(t('categories.messages.deleted'));
    },
  });
};
