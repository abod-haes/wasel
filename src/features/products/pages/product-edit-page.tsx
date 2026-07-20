import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ErrorState, LoadingScreen, PageContainer, SectionHeader } from '@/components/shared';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { ProductDetailsForm } from '@/features/products/components/product-details-form';
import { ProductVariantsManager } from '@/features/products/components/product-variants-manager';
import { useProductQuery, useUpdateProductMutation } from '@/features/products/hooks/use-products-query';
import { buildProductsListRoute } from '@/features/products/lib/product-list-url';
import type { CreateProductInput } from '@/features/products/types/product-types';

export default function ProductEditPage(): React.JSX.Element {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productsListRoute = buildProductsListRoute(searchParams);
  const productQuery = useProductQuery(productId);
  const categoriesQuery = useCategoryOptionsQuery();
  const updateProductMutation = useUpdateProductMutation();

  if (!productId) {
    return <Navigate to={productsListRoute} replace />;
  }

  if (productQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (productQuery.isError) {
    return <ErrorState onRetry={() => void productQuery.refetch()} />;
  }

  if (categoriesQuery.isError) {
    return <ErrorState onRetry={() => void categoriesQuery.refetch()} />;
  }

  const product = productQuery.data;

  if (!product) {
    return <Navigate to={productsListRoute} replace />;
  }

  const submitProduct = (payload: CreateProductInput): void => {
    updateProductMutation.mutate(
      {
        id: productId,
        ...payload,
      },
      {
        onSuccess: () => {
          navigate(productsListRoute, { replace: true });
        },
      }
    );
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="تعديل المنتج"
        descriptionKey="صفحة مستقلة لتعديل بيانات المنتج وإدارة النكهات بشكل واضح."
      />

      <ProductDetailsForm
        mode="edit"
        product={product}
        categories={categoriesQuery.data ?? []}
        onSubmit={submitProduct}
        onBack={() => navigate(productsListRoute, { replace: true })}
        isSubmitting={updateProductMutation.isPending}
      />

      <ProductVariantsManager productId={productId} />
    </PageContainer>
  );
}
