import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared';
import { Badge, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import type { Product } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const formatPrice = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function ProductsTable({
  products,
  isLoading = false,
  isMutating = false,
  onEditProduct,
  onDeleteProduct,
}: ProductsTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: t('common.name'),
        renderCell: (product: Product) => {
          const mainImage = product.images.find((image) => image.isMain) ?? product.images[0];

          return (
            <div className="flex items-center gap-3">
              {mainImage ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="h-10 w-10 cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <img
                        src={resolveMediaPath(mainImage.imagePath)}
                        alt={product.name}
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
                      src={resolveMediaPath(mainImage.imagePath)}
                      alt={product.name}
                      className="h-40 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted" />
              )}
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.code}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'categories',
        header: t('products.table.categories'),
        renderCell: (product: Product) => (
          <span className="text-sm text-muted-foreground">
            {product.categories.map((category) => category.name).join(', ') || t('products.noCategory')}
          </span>
        ),
      },
      {
        key: 'price',
        header: t('products.table.price'),
        renderCell: (product: Product) => <span className="font-medium">{formatPrice(product.price)}</span>,
      },
      {
        key: 'inCart',
        header: t('products.table.inCart'),
        renderCell: (product: Product) =>
          product.isInCart ? (
            <Badge variant="success">{t('products.table.cartQty', { count: product.cartQuantity })}</Badge>
          ) : (
            <Badge variant="outline">{t('products.notInCart')}</Badge>
          ),
      },
      {
        key: 'favourite',
        header: t('products.table.favourite'),
        renderCell: (product: Product) =>
          product.isFavourite ? <Badge variant="warning">{t('products.favourite')}</Badge> : <span>-</span>,
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
    />
  );
}
