import { Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared';
import { Badge, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import type { Category } from '@/features/categories/types/category-types';
import { resolveMediaPath } from '@/lib/utils';

interface CategoriesTableProps {
  categories: Category[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export function CategoriesTable({
  categories,
  isLoading = false,
  isMutating = false,
  onEditCategory,
  onDeleteCategory,
}: CategoriesTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: t('common.name'),
        renderCell: (category: Category) => (
          <div className="flex items-center gap-3">
            {category.imagePath ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="h-10 w-10 cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <img
                      src={resolveMediaPath(category.imagePath)}
                      alt={category.name}
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
                    src={resolveMediaPath(category.imagePath)}
                    alt={category.name}
                    className="h-40 w-full rounded-lg object-cover"
                    loading="lazy"
                  />
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted" />
            )}
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">{category.description || t('categories.noDescription')}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'productsCount',
        header: t('categories.table.productsCount'),
        renderCell: (category: Category) => (
          <Badge variant="secondary">{category.products.length}</Badge>
        ),
      },
      {
        key: 'sampleProducts',
        header: t('categories.table.sampleProducts'),
        renderCell: (category: Category) => (
          <span className="text-sm text-muted-foreground">
            {category.products.slice(0, 3).map((product) => product.name).join(', ') || t('categories.noProducts')}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (category: Category) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditCategory(category)}
              disabled={isMutating}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteCategory(category)}
              disabled={isMutating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [isMutating, onDeleteCategory, onEditCategory, t]
  );

  return (
    <DataTable
      data={categories}
      columns={columns}
      getRowKey={(category) => category.id}
      isLoading={isLoading}
      emptyTitleKey="categories.empty.title"
      emptyDescriptionKey="categories.empty.description"
    />
  );
}
