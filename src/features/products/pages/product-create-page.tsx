import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { useBrandOptionsQuery } from '@/features/brands/hooks/use-brands-query';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
import { useMarketOptionsQuery } from '@/features/markets/hooks/use-markets-query';
import { ProductDetailsForm } from '@/features/products/components/product-details-form';
import {
  ProductVariantsManager,
  type PendingProductVariant,
} from '@/features/products/components/product-variants-manager';
import { useCreateProductMutation } from '@/features/products/hooks/use-products-query';
import type { CreateProductInput } from '@/features/products/types/product-types';

export default function ProductCreatePage(): React.JSX.Element {
  const navigate = useNavigate();
  const categoriesQuery = useCategoryOptionsQuery();
  const brandsQuery = useBrandOptionsQuery();
  const marketsQuery = useMarketOptionsQuery();
  const createProductMutation = useCreateProductMutation();
  const [variants, setVariants] = useState<PendingProductVariant[]>([]);

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

  const submitProduct = (payload: CreateProductInput): void => {
    createProductMutation.mutate(
      {
        ...payload,
        variants,
      },
      {
        onSuccess: () => {
          navigate(ROUTES.products);
        },
      }
    );
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="إضافة منتج"
        descriptionKey="صفحة مستقلة لإضافة المنتج مع إمكانية إضافة النكهات قبل الحفظ."
      />

      <ProductDetailsForm
        mode="create"
        categories={categoriesQuery.data ?? []}
        brands={brandsQuery.data ?? []}
        markets={marketsQuery.data ?? []}
        variants={variants}
        onSubmit={submitProduct}
        isSubmitting={
          createProductMutation.isPending ||
          categoriesQuery.isLoading ||
          brandsQuery.isLoading ||
          marketsQuery.isLoading
        }
      />

      <ProductVariantsManager variants={variants} onVariantsChange={setVariants} />
    </PageContainer>
  );
}
