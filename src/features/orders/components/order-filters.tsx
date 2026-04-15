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
import { ORDER_STATUSES, type OrderStatus, type OrdersFilter } from '@/features/orders/types/order-types';

interface OrderFiltersProps {
  filters: OrdersFilter;
  onChange: (filters: OrdersFilter) => void;
  onReset: () => void;
}

export function OrderFilters({ filters, onChange, onReset }: OrderFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px_auto] md:items-end">
      <Input
        value={filters.search}
        placeholder={t('orders.searchPlaceholder')}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      <Select
        value={String(filters.status)}
        onValueChange={(value) =>
          onChange({
            ...filters,
            status: value === 'all' ? 'all' : (Number(value) as OrderStatus),
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={t('common.status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={String(status)}>
              {t(`orders.status.${status}`)}
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
