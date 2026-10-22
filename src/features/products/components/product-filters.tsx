import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import type { Brand } from '@/features/brands/types/brand-types';
import type { CategoryOption } from '@/features/categories/types/category-types';
import type { MarketOption } from '@/features/markets/types/market-types';
import type { ProductsFilter } from '@/features/products/types/product-types';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  filters: ProductsFilter;
  categories: CategoryOption[];
  brands: Brand[];
  markets: MarketOption[];
  showMarketFilters?: boolean;
  brandSearch?: string;
  marketSearch?: string;
  onBrandSearchChange?: (search: string) => void;
  onMarketSearchChange?: (search: string) => void;
  onBrandSelected?: (brand: Brand | null) => void;
  onMarketSelected?: (market: MarketOption | null) => void;
  brandsLoading?: boolean;
  marketsLoading?: boolean;
  brandsError?: boolean;
  marketsError?: boolean;
  onChange: (filters: ProductsFilter) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  categories,
  brands,
  markets,
  showMarketFilters = true,
  brandSearch = '',
  marketSearch = '',
  onBrandSearchChange,
  onMarketSearchChange,
  onBrandSelected,
  onMarketSelected,
  brandsLoading = false,
  marketsLoading = false,
  brandsError = false,
  marketsError = false,
  onChange,
  onReset,
}: ProductFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'grid gap-3 rounded-xl border bg-card p-4 xl:items-end',
        showMarketFilters
          ? 'xl:grid-cols-[1fr_200px_200px_200px_auto]'
          : 'xl:grid-cols-[1fr_220px_220px_auto]'
      )}
    >
      <div className="relative min-w-0">
        <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" aria-label={t('products.searchPlaceholder')} className="ps-10" value={filters.search}
          placeholder={t('products.searchPlaceholder')}
          onChange={(event) => onChange({ ...filters, search: event.target.value })} />
      </div>

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
              {'— '.repeat(category.level ?? 0)}
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.brandId ?? 'all'}
        onOpenChange={(open) => { if (!open) onBrandSearchChange?.(''); }}
        onValueChange={(brandId) => {
          onBrandSelected?.(brands.find((brand) => brand.id === brandId) ?? null);
          onChange({ ...filters, brandId });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="البراند">
            {filters.brandId && filters.brandId !== 'all'
              ? brands.find((brand) => brand.id === filters.brandId)?.name ?? 'البراند المحدد'
              : 'كل البراندات'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          searchMode={onBrandSearchChange ? 'remote' : 'local'}
          searchValue={onBrandSearchChange ? brandSearch : undefined}
          onSearchChange={onBrandSearchChange}
          searchPlaceholder="ابحث عن علامة تجارية..."
          isLoading={brandsLoading}
          isError={brandsError}
        >
          <SelectItem value="all">كل البراندات</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showMarketFilters ? (
        <>
          <Select
            value={filters.marketUserId ?? 'all'}
            onOpenChange={(open) => { if (!open) onMarketSearchChange?.(''); }}
            onValueChange={(marketUserId) => {
              onMarketSelected?.(markets.find((market) => market.id === marketUserId) ?? null);
              onChange({ ...filters, marketUserId, marketName: '' });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="السوق">
                {filters.marketUserId && filters.marketUserId !== 'all'
                  ? markets.find((market) => market.id === filters.marketUserId)?.name ?? 'السوق المحدد'
                  : 'كل الأسواق'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              searchMode={onMarketSearchChange ? 'remote' : 'local'}
              searchValue={onMarketSearchChange ? marketSearch : undefined}
              onSearchChange={onMarketSearchChange}
              searchPlaceholder="ابحث عن سوق..."
              isLoading={marketsLoading}
              isError={marketsError}
            >
              <SelectItem value="all">كل الأسواق</SelectItem>
              {markets.map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  {market.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      ) : null}

      <Button variant="outline" onClick={onReset}>
        {t('common.reset')}
      </Button>
    </div>
  );
}
