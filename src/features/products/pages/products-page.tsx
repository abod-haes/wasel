import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { ProductFilters } from '@/features/products/components/product-filters';
import { ProductFormDialog } from '@/features/products/components/product-form-dialog';
import { ProductsTable } from '@/features/products/components/products-table';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from '@/features/products/hooks/use-products-query';
import type {
  CreateProductInput,
  Product,
  ProductsFilter,
} from '@/features/products/types/product-types';

const defaultFilters: ProductsFilter = {
  search: '',
  categoryId: 'all',
};

export default function ProductsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<ProductsFilter>(defaultFilters);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const productsQuery = useProductsQuery(filters);
  const categoriesQuery = useCategoryOptionsQuery();
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();

  if (productsQuery.isError) {
    return <ErrorState onRetry={() => void productsQuery.refetch()} />;
  }

  const openCreateDialog = (): void => {
    setDialogMode('create');
    setSelectedProduct(undefined);
    setIsFormOpen(true);
  };

  const openEditDialog = (product: Product): void => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const submitProduct = (payload: CreateProductInput): void => {
    if (dialogMode === 'create') {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
      return;
    }

    if (!selectedProduct) {
      return;
    }

    updateProductMutation.mutate(
      {
        id: selectedProduct.id,
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
    if (!deleteProduct) {
      return;
    }

    deleteProductMutation.mutate(deleteProduct.id, {
      onSuccess: () => {
        setDeleteProduct(null);
      },
    });
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const isMutating = isSubmitting || deleteProductMutation.isPending;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="products.title"
        descriptionKey="products.description"
        actions={
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('products.createProduct')}
          </Button>
        }
      />

      <ProductFilters
        filters={filters}
        categories={categoriesQuery.data ?? []}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <ProductsTable
        products={productsQuery.data ?? []}
        isLoading={productsQuery.isLoading || productsQuery.isFetching}
        isMutating={isMutating}
        onEditProduct={openEditDialog}
        onDeleteProduct={setDeleteProduct}
      />

      <ProductFormDialog
        open={isFormOpen}
        mode={dialogMode}
        defaultProduct={selectedProduct}
        categories={categoriesQuery.data ?? []}
        onOpenChange={setIsFormOpen}
        onSubmit={submitProduct}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={Boolean(deleteProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteProduct(null);
          }
        }}
        onConfirm={confirmDelete}
        titleKey="products.confirmDelete.title"
        descriptionKey="products.confirmDelete.description"
        confirmLabelKey="products.deleteProduct"
        isLoading={deleteProductMutation.isPending}
      />
    </PageContainer>
  );
}
