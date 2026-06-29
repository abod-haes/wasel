import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { useCategoryOptionsQuery } from '@/features/categories/hooks/use-categories-query';
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
  const createProductMutation = useCreateProductMutation();
  const [variants, setVariants] = useState<PendingProductVariant[]>([]);

  if (categoriesQuery.isError) {
    return <ErrorState onRetry={() => void categoriesQuery.refetch()} />;
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
        variants={variants}
        onSubmit={submitProduct}
        isSubmitting={createProductMutation.isPending}
      />

      <ProductVariantsManager variants={variants} onVariantsChange={setVariants} />
    </PageContainer>
  );
}
