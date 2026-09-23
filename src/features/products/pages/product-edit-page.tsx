import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ErrorState, LoadingScreen, PageContainer, SectionHeader } from '@/components/shared';
import { useBrandOptionsQuery } from '@/features/brands/hooks/use-brands-query';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { useMarketOptionsQuery } from '@/features/markets/hooks/use-markets-query';
import { ProductDetailsForm } from '@/features/products/components/product-details-form';
import { ProductImagesManager } from '@/features/products/components/product-images-manager';
import { ProductVariantsManager } from '@/features/products/components/product-variants-manager';
import { useProductQuery, useUpdateProductMutation } from '@/features/products/hooks/use-products-query';
import { buildProductsListRoute } from '@/features/products/lib/product-list-url';
import type { CreateProductInput } from '@/features/products/types/product-types';
import { ROUTES } from '@/constants/routes';
import { isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

export default function ProductEditPage(): React.JSX.Element {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productsListRoute = buildProductsListRoute(searchParams);
  const currentUser = useAuthStore((state) => state.user);
  const isMarket = isMarketRole(currentUser?.roles ?? []);
  const productQuery = useProductQuery(productId);
  const categoriesQuery = useCategoryOptionsQuery();
  const brandsQuery = useBrandOptionsQuery();
  const marketsQuery = useMarketOptionsQuery(!isMarket);
  const updateProductMutation = useUpdateProductMutation();

  if (!productId) return <Navigate to={productsListRoute} replace />;
  if (
    productQuery.isLoading ||
    categoriesQuery.isLoading ||
    brandsQuery.isLoading ||
    marketsQuery.isLoading
  ) return <LoadingScreen />;
  if (productQuery.isError) return <ErrorState onRetry={() => void productQuery.refetch()} />;
  if (categoriesQuery.isError || brandsQuery.isError || marketsQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void categoriesQuery.refetch();
          void brandsQuery.refetch();
          void marketsQuery.refetch();
        }}
      />
    );
  }

  const product = productQuery.data;
  if (!product) return <Navigate to={productsListRoute} replace />;
  if (isMarket && (!currentUser || product.marketUserId !== currentUser.id)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  const submitProduct = (payload: CreateProductInput): void => {
    updateProductMutation.mutate(
      {
        id: productId,
        ...payload,
        marketUserId: isMarket && currentUser ? currentUser.id : payload.marketUserId,
      },
      { onSuccess: () => navigate(productsListRoute, { replace: true }) }
    );
  };

  return (
    <PageContainer>
      <SectionHeader titleKey="تعديل المنتج" descriptionKey="تعديل بيانات المنتج والتصنيفات والصور والنكهات من مكان واحد." />
      <ProductDetailsForm
        mode="edit"
        product={product}
        categories={categoriesQuery.data ?? []}
        brands={brandsQuery.data ?? []}
        markets={marketsQuery.data ?? []}
        fixedMarketUserId={isMarket ? currentUser?.id : undefined}
        fixedMarketName={isMarket ? currentUser?.name : undefined}
        onSubmit={submitProduct}
        onBack={() => navigate(productsListRoute, { replace: true })}
        isSubmitting={updateProductMutation.isPending}
      />
      <ProductImagesManager product={product} />
      <ProductVariantsManager productId={productId} />
    </PageContainer>
  );
}
