import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { ProductFilters } from '@/features/products/components/product-filters';
import { ProductsTable } from '@/features/products/components/products-table';
import {
  useDeleteProductMutation,
  useProductsQuery,
} from '@/features/products/hooks/use-products-query';
import type {
  Product,
  ProductsFilter,
} from '@/features/products/types/product-types';
import type { PaginationParams } from '@/types/api';

const defaultFilters: ProductsFilter = {
  search: '',
  categoryId: 'all',
};

const buildProductEditRoute = (productId: string): string => {
  return ROUTES.productEdit.replace(':productId', productId);
};

export default function ProductsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ProductsFilter>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const productsQuery = useProductsQuery(filters, pagination);
  const categoriesQuery = useCategoryOptionsQuery();
  const deleteProductMutation = useDeleteProductMutation();

  if (productsQuery.isError) {
    return <ErrorState onRetry={() => void productsQuery.refetch()} />;
  }

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

  return (
    <PageContainer>
      <SectionHeader
        titleKey="products.title"
        descriptionKey="products.description"
        actions={
          <Button onClick={() => navigate(ROUTES.productCreate)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('products.createProduct')}
          </Button>
        }
      />

      <ProductFilters
        filters={filters}
        categories={categoriesQuery.data ?? []}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onReset={() => {
          setFilters(defaultFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
      />

      <ProductsTable
        products={productsQuery.data?.items ?? []}
        isLoading={productsQuery.isLoading || productsQuery.isFetching}
        isMutating={deleteProductMutation.isPending}
        onEditProduct={(product) => navigate(buildProductEditRoute(product.id))}
        onDeleteProduct={setDeleteProduct}
        pagination={productsQuery.data}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
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
