import { useTranslation } from 'react-i18next';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { USER_ROLES, USER_STATUSES, type UsersFilter } from '@/features/users/types/user-types';

interface UserFiltersProps {
  filters: UsersFilter;
  onChange: (filters: UsersFilter) => void;
  onReset: () => void;
}

export function UserFilters({ filters, onChange, onReset }: UserFiltersProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end">
      <div>
        <Input
          value={filters.search}
          placeholder={t('users.searchPlaceholder')}
          onChange={(event) =>
            onChange({
              ...filters,
              search: event.target.value,
            })
          }
        />
      </div>

      <div>
        <Select
          value={filters.role}
          onValueChange={(value) =>
            onChange({
              ...filters,
              role: value as UsersFilter['role'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('common.role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {USER_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`users.role.${role}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value as UsersFilter['status'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            {USER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`users.status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onReset}>
        {t('common.reset')}
      </Button>
    </div>
  );
}
