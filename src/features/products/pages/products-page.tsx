import { Plus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { ProductFilters } from '@/features/products/components/product-filters';
import { ProductsTable } from '@/features/products/components/products-table';
import { useDeleteProductMutation, useImportProductsMutation, useProductsQuery } from '@/features/products/hooks/use-products-query';
import {
  appendProductListSearchParams,
  createProductListSearchParams,
  defaultProductFilters,
  defaultProductPagination,
  readProductListUrlState,
} from '@/features/products/lib/product-list-url';
import type { Product, ProductsFilter } from '@/features/products/types/product-types';
import type { PaginationParams } from '@/types/api';

const buildProductEditRoute = (productId: string): string => ROUTES.productEdit.replace(':productId', productId);

export default function ProductsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const importInputRef = useRef<HTMLInputElement>(null);
  const { filters, pagination } = readProductListUrlState(searchParams);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const categoriesQuery = useCategoryOptionsQuery();
  const selectedCategory = filters.categoryId === 'all' ? undefined : categoriesQuery.data?.find((category) => category.id === filters.categoryId);
  const effectiveFilters: ProductsFilter = {
    ...filters,
    categoryIds: selectedCategory ? [selectedCategory.id, ...(selectedCategory.descendantIds ?? [])] : undefined,
  };

  const productsQuery = useProductsQuery(effectiveFilters, pagination);
  const deleteProductMutation = useDeleteProductMutation();
  const importProductsMutation = useImportProductsMutation();

  const updateListUrl = (nextFilters: ProductsFilter, nextPagination: PaginationParams): void => {
    setSearchParams(createProductListSearchParams(nextFilters, nextPagination), { replace: true });
  };

  if (productsQuery.isError) return <ErrorState onRetry={() => void productsQuery.refetch()} />;

  const confirmDelete = (): void => {
    if (!deleteProduct) return;
    deleteProductMutation.mutate(deleteProduct.id, { onSuccess: () => setDeleteProduct(null) });
  };

  const handleImport = (files: FileList | null): void => {
    const file = files?.[0];
    if (!file) return;
    importProductsMutation.mutate(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="products.title"
        descriptionKey="products.description"
        actions={
          <div className="flex flex-wrap gap-2">
            <input ref={importInputRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={(event) => handleImport(event.target.files)} />
            <Button type="button" variant="outline" disabled={importProductsMutation.isPending} onClick={() => importInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />{importProductsMutation.isPending ? 'جاري الاستيراد...' : 'استيراد Excel'}
            </Button>
            <Button onClick={() => navigate(ROUTES.productCreate)} className="gap-2"><Plus className="h-4 w-4" />{t('products.createProduct')}</Button>
          </div>
        }
      />
      <ProductFilters
        filters={filters}
        categories={categoriesQuery.data ?? []}
        onChange={(nextFilters) => updateListUrl(nextFilters, { ...pagination, page: defaultProductPagination.page })}
        onReset={() => updateListUrl(defaultProductFilters, defaultProductPagination)}
      />
      <ProductsTable
        products={productsQuery.data?.items ?? []}
        isLoading={productsQuery.isLoading || productsQuery.isFetching}
        isMutating={deleteProductMutation.isPending}
        onEditProduct={(product) => navigate(appendProductListSearchParams(buildProductEditRoute(product.id), searchParams))}
        onDeleteProduct={setDeleteProduct}
        pagination={productsQuery.data}
        onPageChange={(page) => updateListUrl(filters, { ...pagination, page })}
        onPageSizeChange={(pageSize) => updateListUrl(filters, { page: defaultProductPagination.page, pageSize })}
      />
      <ConfirmDialog
        open={Boolean(deleteProduct)}
        onOpenChange={(open) => { if (!open) setDeleteProduct(null); }}
        onConfirm={confirmDelete}
        titleKey="products.confirmDelete.title"
        descriptionKey="products.confirmDelete.description"
        confirmLabelKey="products.deleteProduct"
        isLoading={deleteProductMutation.isPending}
      />
    </PageContainer>
  );
}
