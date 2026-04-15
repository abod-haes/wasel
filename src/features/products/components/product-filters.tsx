import { useTranslation } from 'react-i18next';

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import type { CategoryOption } from '@/features/categories/types/category-types';
import type { ProductsFilter } from '@/features/products/types/product-types';

interface ProductFiltersProps {
  filters: ProductsFilter;
  categories: CategoryOption[];
  onChange: (filters: ProductsFilter) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  categories,
  onChange,
  onReset,
}: ProductFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px_auto] md:items-end">
      <Input
        value={filters.search}
        placeholder={t('products.searchPlaceholder')}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      <Select
        value={filters.categoryId}
        onValueChange={(value) =>
          onChange({
            ...filters,
            categoryId: value,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={t('products.filters.category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>
        {t('common.reset')}
      </Button>
    </div>
  );
}
