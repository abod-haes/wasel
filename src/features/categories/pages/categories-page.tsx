import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { CategoryFormDialog } from '@/features/categories/components/category-form-dialog';
import { CategoriesTable } from '@/features/categories/components/categories-table';
import { CategoryFilters } from '@/features/categories/components/category-filters';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/features/categories/hooks/use-categories-query';
import type {
  CategoriesFilter,
  Category,
  CreateCategoryInput,
} from '@/features/categories/types/category-types';

const defaultFilters: CategoriesFilter = {
  search: '',
};

export default function CategoriesPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<CategoriesFilter>(defaultFilters);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const categoriesQuery = useCategoriesQuery(filters);
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  if (categoriesQuery.isError) {
    return <ErrorState onRetry={() => void categoriesQuery.refetch()} />;
  }

  const openCreateDialog = (): void => {
    setDialogMode('create');
    setSelectedCategory(undefined);
    setIsFormOpen(true);
  };

  const openEditDialog = (category: Category): void => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const submitCategory = (payload: CreateCategoryInput): void => {
    if (dialogMode === 'create') {
      createCategoryMutation.mutate(payload, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
      return;
    }

    if (!selectedCategory) {
      return;
    }

    updateCategoryMutation.mutate(
      {
        id: selectedCategory.id,
        ...payload,
      },
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const confirmDelete = (): void => {
    if (!deleteCategory) {
      return;
    }

    deleteCategoryMutation.mutate(deleteCategory.id, {
      onSuccess: () => {
        setDeleteCategory(null);
      },
    });
  };

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isMutating = isSubmitting || deleteCategoryMutation.isPending;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="categories.title"
        descriptionKey="categories.description"
        actions={
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('categories.createCategory')}
          </Button>
        }
      />

      <CategoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <CategoriesTable
        categories={categoriesQuery.data ?? []}
        isLoading={categoriesQuery.isLoading || categoriesQuery.isFetching}
        isMutating={isMutating}
        onEditCategory={openEditDialog}
        onDeleteCategory={setDeleteCategory}
      />

      <CategoryFormDialog
        open={isFormOpen}
        mode={dialogMode}
        defaultCategory={selectedCategory}
        onOpenChange={setIsFormOpen}
        onSubmit={submitCategory}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={Boolean(deleteCategory)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCategory(null);
          }
        }}
        onConfirm={confirmDelete}
        titleKey="categories.confirmDelete.title"
        descriptionKey="categories.confirmDelete.description"
        confirmLabelKey="categories.deleteCategory"
        isLoading={deleteCategoryMutation.isPending}
      />
    </PageContainer>
  );
}
