import { Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/DataTable';
import { Badge, Button } from '@/components/ui';
import type { User } from '@/features/users/types/user-types';

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
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
}: UsersTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: t('common.name'),
        renderCell: (user: User) => (
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        ),
      },
      {
        key: 'role',
        header: t('common.role'),
        renderCell: (user: User) => t(`users.role.${user.role}`),
      },
      {
        key: 'status',
        header: t('common.status'),
        renderCell: (user: User) => (
          <Badge variant={statusVariantMap[user.status]}>{t(`users.status.${user.status}`)}</Badge>
        ),
      },
      {
        key: 'lastLogin',
        header: t('users.table.lastLogin'),
        renderCell: (user: User) => (
          <span className="text-sm text-muted-foreground">{new Date(user.lastLogin).toLocaleDateString()}</span>
        ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (user: User) => (
          <div className="flex justify-end gap-1">
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

  return <DataTable data={users} columns={columns} getRowKey={(user) => user.id} isLoading={isLoading} />;
}
