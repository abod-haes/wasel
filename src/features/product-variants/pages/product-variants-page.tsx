import { useMemo, useState } from 'react';

import { DataTable, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Badge, Input, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import type { Product } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';

interface ProductVariantRow {
  id: string;
  name: string;
  imagePath?: string | null;
  sortOrder: number;
  isDefault: boolean;
  productId: string;
  productName: string;
  productCode: string;
}

const buildVariantRows = (products: Product[]): ProductVariantRow[] => {
  return products.flatMap((product) =>
    product.variants.map((variant, index) => ({
      id: variant.id || `${product.id}-${variant.name}-${index}`,
      name: variant.name,
      imagePath: variant.imagePath,
      sortOrder: variant.sortOrder,
      isDefault: variant.isDefault,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
    }))
  );
};

export default function ProductVariantsPage(): React.JSX.Element {
  const [search, setSearch] = useState('');
  const productsQuery = useProductsQuery(
    {
      search: '',
      categoryId: 'all',
    },
    {
      page: 1,
      pageSize: 200,
    }
  );

  const variants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rows = buildVariantRows(productsQuery.data?.items ?? []);

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((variant) => {
      return (
        variant.name.toLowerCase().includes(normalizedSearch) ||
        variant.productName.toLowerCase().includes(normalizedSearch) ||
        variant.productCode.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [productsQuery.data?.items, search]);

  const columns = useMemo(
    () => [
      {
        key: 'variant',
        header: 'النكهة',
        renderCell: (variant: ProductVariantRow) => (
          <div className="flex items-center gap-3">
            {variant.imagePath ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="h-10 w-10 cursor-zoom-in overflow-hidden rounded-lg border border-border/70 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <img
                      src={resolveMediaPath(variant.imagePath)}
                      alt={variant.name}
                      className="h-full w-full object-cover transition-transform duration-200 hover:scale-110"
                      loading="lazy"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="w-52 rounded-xl border-border/70 bg-card p-2 shadow-lg"
                >
                  <img
                    src={resolveMediaPath(variant.imagePath)}
                    alt={variant.name}
                    className="h-40 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-10 w-10 rounded-lg border border-dashed border-border/70 bg-muted" />
            )}
            <div>
              <p className="font-medium text-foreground">{variant.name}</p>
              {variant.isDefault ? <p className="text-xs text-muted-foreground">النكهة الافتراضية</p> : null}
            </div>
          </div>
        ),
      },
      {
        key: 'product',
        header: 'المنتج',
        renderCell: (variant: ProductVariantRow) => (
          <div>
            <p className="font-medium text-foreground">{variant.productName}</p>
            <p className="text-xs text-muted-foreground">{variant.productCode}</p>
          </div>
        ),
      },
      {
        key: 'sortOrder',
        header: 'الترتيب',
        renderCell: (variant: ProductVariantRow) => <span className="font-medium">{variant.sortOrder}</span>,
      },
      {
        key: 'default',
        header: 'افتراضية',
        renderCell: (variant: ProductVariantRow) =>
          variant.isDefault ? <Badge variant="default">نعم</Badge> : <Badge variant="outline">لا</Badge>,
      },
    ],
    []
  );

  if (productsQuery.isError) {
    return <ErrorState onRetry={() => void productsQuery.refetch()} />;
  }

  return (
    <PageContainer>
      <SectionHeader
        titleKey="النكهات"
        descriptionKey="إدارة وعرض نكهات المنتجات وصورها من صفحة مستقلة"
      />

      <div className="rounded-xl border bg-card p-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث باسم النكهة أو المنتج أو كود المنتج"
          className="max-w-md"
        />
      </div>

      <DataTable
        data={variants}
        columns={columns}
        getRowKey={(variant) => `${variant.productId}-${variant.id}`}
        isLoading={productsQuery.isLoading || productsQuery.isFetching}
        emptyTitleKey="لا توجد نكهات"
        emptyDescriptionKey="أضف نكهات من داخل نموذج المنتج لتظهر هنا"
      />
    </PageContainer>
  );
}
