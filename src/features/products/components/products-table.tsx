import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared';
import { Badge, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import type { Product, ProductVariant } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';
import type { PaginatedData } from '@/types/api';

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  pagination?: Pick<PaginatedData<Product>, 'page' | 'pageSize' | 'totalCount' | 'totalPages'>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatWeight = (value?: number): string => {
  if (value == null) {
    return '-';
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
};

const renderVariantBadge = (variant: ProductVariant): React.JSX.Element => {
  const variantImage = variant.imagePath ? resolveMediaPath(variant.imagePath) : undefined;

  return (
    <Tooltip key={variant.id || variant.name}>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-default items-center gap-1 rounded-full border bg-background px-2 py-1 text-xs text-foreground">
          {variantImage ? (
            <img src={variantImage} alt={variant.name} className="h-4 w-4 rounded-full object-cover" loading="lazy" />
          ) : null}
          <span>{variant.name}</span>
          {variant.isDefault ? <span className="text-[10px] text-primary">افتراضي</span> : null}
        </span>
      </TooltipTrigger>
      <TooltipContent className="rounded-xl border-border/70 bg-card p-2 shadow-lg">
        <div className="space-y-2 text-sm">
          {variantImage ? (
            <img src={variantImage} alt={variant.name} className="h-28 w-40 rounded-lg object-cover" loading="lazy" />
          ) : null}
          <div>
            <p className="font-medium">{variant.name}</p>
            <p className="text-xs text-muted-foreground">الترتيب: {variant.sortOrder}</p>
            {variant.isDefault ? <p className="text-xs text-primary">النكهة الافتراضية</p> : null}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export function ProductsTable({
  products,
  isLoading = false,
  isMutating = false,
  onEditProduct,
  onDeleteProduct,
  pagination,
  onPageChange,
  onPageSizeChange,
}: ProductsTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'product',
        header: 'المنتج',
        renderCell: (product: Product) => {
          const mainImage = product.images.find((image) => image.isMain) ?? product.images[0];
          const productImage = mainImage?.imagePath ? resolveMediaPath(mainImage.imagePath) : undefined;

          return (
            <div className="flex min-w-72 items-center gap-3">
              {productImage ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="h-14 w-14 cursor-zoom-in overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <img
                        src={productImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-200 hover:scale-110"
                        loading="lazy"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="w-60 rounded-xl border-border/70 bg-card p-2 shadow-lg">
                    <img src={productImage} alt={product.name} className="h-44 w-full rounded-lg object-cover" loading="lazy" />
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="h-14 w-14 rounded-xl border border-dashed bg-muted" />
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{product.name}</p>
                  {product.isFavourite ? <Badge variant="warning">مفضل</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <span>الكود: {product.code || '-'}</span>
                  {product.type ? <span>• النوع: {product.type}</span> : null}
                </div>
                {product.description ? (
                  <p className="line-clamp-1 max-w-sm text-xs text-muted-foreground">{product.description}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        key: 'brand',
        header: 'البراند',
        renderCell: (product: Product) =>
          product.brand ? (
            <span className="font-medium text-foreground">{product.brand}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          ),
      },
      {
        key: 'categories',
        header: 'التصنيفات',
        renderCell: (product: Product) =>
          product.categories.length > 0 ? (
            <div className="flex max-w-56 flex-wrap gap-1">
              {product.categories.map((category) => (
                <Badge key={category.id || category.name} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">{t('products.noCategory')}</span>
          ),
      },
      {
        key: 'variants',
        header: 'النكهات',
        renderCell: (product: Product) => {
          if (product.variants.length === 0) {
            return <span className="text-sm text-muted-foreground">لا يوجد</span>;
          }

          const visibleVariants = product.variants.slice(0, 4);
          const hiddenVariantsCount = product.variants.length - visibleVariants.length;

          return (
            <div className="flex max-w-72 flex-wrap gap-1">
              {visibleVariants.map(renderVariantBadge)}
              {hiddenVariantsCount > 0 ? <Badge variant="outline">+{hiddenVariantsCount}</Badge> : null}
            </div>
          );
        },
      },
      {
        key: 'weight',
        header: 'الوزن',
        renderCell: (product: Product) => <span className="font-medium">{formatWeight(product.weight)}</span>,
      },
      {
        key: 'price',
        header: t('products.table.price'),
        renderCell: (product: Product) => <span className="font-medium">{formatPrice(product.price)}</span>,
      },
      {
        key: 'cart',
        header: 'السلة',
        renderCell: (product: Product) =>
          product.isInCart ? (
            <Badge variant="success">بالسلة: {product.cartQuantity}</Badge>
          ) : (
            <Badge variant="outline">خارج السلة</Badge>
          ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (product: Product) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditProduct(product)}
              disabled={isMutating}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteProduct(product)}
              disabled={isMutating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [isMutating, onDeleteProduct, onEditProduct, t]
  );

  return (
    <DataTable
      data={products}
      columns={columns}
      getRowKey={(product) => product.id}
      isLoading={isLoading}
      emptyTitleKey="products.empty.title"
      emptyDescriptionKey="products.empty.description"
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
