import { useTranslation } from 'react-i18next';

import { Button, Input } from '@/components/ui';
import type { CategoriesFilter } from '@/features/categories/types/category-types';

interface CategoryFiltersProps {
  filters: CategoriesFilter;
  onChange: (filters: CategoriesFilter) => void;
  onReset: () => void;
}

export function CategoryFilters({ filters, onChange, onReset }: CategoryFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto] md:items-end">
      <Input
        value={filters.search}
        placeholder={t('categories.searchPlaceholder')}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      <Button variant="outline" onClick={onReset}>
        {t('common.reset')}
      </Button>
    </div>
  );
}
