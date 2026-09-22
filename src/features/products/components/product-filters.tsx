import { useTranslation } from 'react-i18next';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import type { Brand } from '@/features/brands/types/brand-types';
import type { CategoryOption } from '@/features/categories/types/category-types';
import type { MarketOption } from '@/features/markets/types/market-types';
import type { ProductsFilter } from '@/features/products/types/product-types';

interface ProductFiltersProps {
  filters: ProductsFilter;
  categories: CategoryOption[];
  brands: Brand[];
  markets: MarketOption[];
  onChange: (filters: ProductsFilter) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  categories,
  brands,
  markets,
  onChange,
  onReset,
}: ProductFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 xl:grid-cols-[1fr_200px_200px_200px_200px_auto] xl:items-end">
      <Input
        value={filters.search}
        placeholder={t('products.searchPlaceholder')}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />

      <Select
        value={filters.categoryId}
        onValueChange={(value) => onChange({ ...filters, categoryId: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('products.filters.category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {'— '.repeat(category.level ?? 0)}{category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.brandId ?? 'all'}
        onValueChange={(brandId) => onChange({ ...filters, brandId })}
      >
        <SelectTrigger>
          <SelectValue placeholder="البراند" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل البراندات</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={filters.marketName ?? ''}
        placeholder="اسم السوق"
        onChange={(event) => onChange({ ...filters, marketName: event.target.value })}
      />

      <Select
        value={filters.marketUserId ?? 'all'}
        onValueChange={(marketUserId) => onChange({ ...filters, marketUserId })}
      >
        <SelectTrigger>
          <SelectValue placeholder="السوق" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأسواق</SelectItem>
          {markets.map((market) => (
            <SelectItem key={market.id} value={market.id}>
              {market.name}
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
