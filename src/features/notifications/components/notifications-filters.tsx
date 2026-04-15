import { useTranslation } from 'react-i18next';

import { Button, Input } from '@/components/ui';
import type { NotificationsFilter } from '@/features/notifications/types/notification-types';

interface NotificationsFiltersProps {
  filters: NotificationsFilter;
  onChange: (filters: NotificationsFilter) => void;
  onReset: () => void;
}

export function NotificationsFilters({
  filters,
  onChange,
  onReset,
}: NotificationsFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto] md:items-end">
      <Input
        value={filters.search}
        placeholder={t('notifications.searchPlaceholder')}
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
