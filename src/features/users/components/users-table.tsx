import { Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/DataTable';
import { formatFullPhoneNumber } from '@/constants/phone';
import { Badge, Button } from '@/components/ui';
import type { User } from '@/features/users/types/user-types';
import type { PaginatedData } from '@/types/api';

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  pagination?: Pick<PaginatedData<User>, 'page' | 'pageSize' | 'totalCount' | 'totalPages'>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const statusVariantMap: Record<User['status'], 'success' | 'warning' | 'danger'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
};

export function UsersTable({
  users,
  isLoading = false,
  isMutating = false,
  onEditUser,
  onDeleteUser,
  pagination,
  onPageChange,
  onPageSizeChange,
}: UsersTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: t('common.name'),
        headerClassName: 'min-w-[220px]',
        className: 'min-w-[220px]',
        renderCell: (user: User) => (
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className="max-w-[220px] truncate font-semibold text-foreground">{user.name}</p>
            <span
              dir="ltr"
              className="inline-flex w-fit max-w-full items-center whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground"
            >
              {formatFullPhoneNumber(user.countryCallingCode, user.phoneNumber)}
            </span>
          </div>
        ),
      },
      {
        key: 'role',
        header: t('common.role'),
        headerClassName: 'min-w-[150px]',
        className: 'min-w-[150px]',
        renderCell: (user: User) => (
          <Badge variant="secondary" className="whitespace-nowrap">
            {t(`users.role.${user.role}`)}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: t('common.status'),
        headerClassName: 'min-w-[120px]',
        className: 'min-w-[120px]',
        renderCell: (user: User) => (
          <Badge variant={statusVariantMap[user.status]}>{t(`users.status.${user.status}`)}</Badge>
        ),
      },
      {
        key: 'lastLogin',
        header: t('users.table.lastLogin'),
        headerClassName: 'min-w-[150px]',
        className: 'min-w-[150px]',
        renderCell: (user: User) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
            {new Date(user.lastLogin).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'min-w-[120px] text-end',
        headerClassName: 'min-w-[120px] text-end',
        renderCell: (user: User) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEditUser(user)} disabled={isMutating}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteUser(user)} disabled={isMutating}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [isMutating, onDeleteUser, onEditUser, t]
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      isLoading={isLoading}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
