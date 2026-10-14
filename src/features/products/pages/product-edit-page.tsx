import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ErrorState, LoadingScreen, PageContainer, SectionHeader } from '@/components/shared';
import { useBrandOptionsQuery } from '@/features/brands/hooks/use-brands-query';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { useMarketOptionsQuery } from '@/features/markets/hooks/use-markets-query';
import { ProductDetailsForm } from '@/features/products/components/product-details-form';
import { ProductImagesManager } from '@/features/products/components/product-images-manager';
import { ProductOffersManager } from '@/features/products/components/product-offers-manager';
import { ProductVariantsManager } from '@/features/products/components/product-variants-manager';
import { useDebouncedSelectSearch } from '@/features/products/hooks/use-debounced-select-search';
import { useProductQuery, useUpdateProductMutation } from '@/features/products/hooks/use-products-query';
import { buildProductsListRoute } from '@/features/products/lib/product-list-url';
import type { CreateProductInput } from '@/features/products/types/product-types';
import { ROUTES } from '@/constants/routes';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

export default function ProductEditPage(): React.JSX.Element {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productsListRoute = buildProductsListRoute(searchParams);
  const currentUser = useAuthStore((state) => state.user);
  const isMarket = isMarketRole(currentUser?.roles ?? []) && !isAdminRole(currentUser?.roles ?? []);
  const [brandSearch, setBrandSearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const debouncedBrandSearch = useDebouncedSelectSearch(brandSearch);
  const debouncedMarketSearch = useDebouncedSelectSearch(marketSearch);
  const productQuery = useProductQuery(productId);
  const categoriesQuery = useCategoryOptionsQuery();
  const brandsQuery = useBrandOptionsQuery(debouncedBrandSearch);
  const marketsQuery = useMarketOptionsQuery(!isMarket, debouncedMarketSearch);
  const updateProductMutation = useUpdateProductMutation();

  if (!productId) return <Navigate to={productsListRoute} replace />;
  if (
    productQuery.isLoading ||
    categoriesQuery.isLoading
  ) return <LoadingScreen />;
  if (productQuery.isError) return <ErrorState onRetry={() => void productQuery.refetch()} />;
  if (categoriesQuery.isError) {
    return <ErrorState onRetry={() => void categoriesQuery.refetch()} />;
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
        ...(isMarket && currentUser
          ? { marketUserId: currentUser.id }
          : payload.marketUserId
            ? { marketUserId: payload.marketUserId }
            : {}),
        clearBrand: !payload.brandId && Boolean(product.brandId),
      },
      { onSuccess: () => navigate(productsListRoute, { replace: true }) }
    );
  };

  return (
    <PageContainer>
      <SectionHeader titleKey="تعديل المنتج" descriptionKey="تعديل بيانات المنتج والتصنيفات والصور والنكهات من مكان واحد." />
      <ProductDetailsForm
        key={product.id}
        mode="edit"
        product={product}
        categories={categoriesQuery.data ?? []}
        brands={brandsQuery.data ?? []}
        markets={marketsQuery.data ?? []}
        brandSearch={brandSearch}
        marketSearch={marketSearch}
        onBrandSearchChange={setBrandSearch}
        onMarketSearchChange={setMarketSearch}
        brandsLoading={brandsQuery.isFetching}
        marketsLoading={marketsQuery.isFetching}
        brandsError={brandsQuery.isError}
        marketsError={marketsQuery.isError}
        fixedMarketUserId={isMarket ? currentUser?.id : undefined}
        fixedMarketName={isMarket ? currentUser?.name : undefined}
        onSubmit={submitProduct}
        onBack={() => navigate(productsListRoute, { replace: true })}
        isSubmitting={updateProductMutation.isPending}
      />
      <ProductImagesManager product={product} />
      {!isMarket ? <ProductOffersManager product={product} /> : null}
      <ProductVariantsManager productId={productId} />
    </PageContainer>
  );
}
