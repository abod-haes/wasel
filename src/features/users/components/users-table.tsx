import { Ban, KeyRound, LockOpen, Pencil, Trash2 } from 'lucide-react';
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
  onBlockUser: (user: User) => void;
  onUnblockUser: (user: User) => void;
  onResetPassword: (user: User) => void;
  currentUserId?: string;
  currentIsSuperAdmin?: boolean;
  canManageAccountControls?: boolean;
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
  onBlockUser,
  onUnblockUser,
  onResetPassword,
  currentUserId,
  currentIsSuperAdmin = false,
  canManageAccountControls = false,
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
          <div className="flex max-w-[220px] flex-col items-start gap-1">
            <Badge variant={user.isBlocked ? 'danger' : statusVariantMap[user.status]}>
              {user.isBlocked ? t('users.status.blocked') : t(`users.status.${user.status}`)}
            </Badge>
            {user.isBlocked && user.blockReason ? (
              <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                {user.blockReason}
              </span>
            ) : null}
          </div>
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
        className: 'min-w-[220px] text-end',
        headerClassName: 'min-w-[220px] text-end',
        renderCell: (user: User) => {
          const isSelf = Boolean(currentUserId && user.id === currentUserId);
          const isTargetSuperAdmin = user.roles.some(
            (role) => role.name.toLowerCase() === 'superadmin',
          );
          const canManageAccountState =
            !isSelf && (currentIsSuperAdmin || !isTargetSuperAdmin);

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditUser(user)}
                disabled={isMutating}
                title={t('users.actions.edit')}
                aria-label={t('users.actions.edit')}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {canManageAccountControls ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onResetPassword(user)}
                    disabled={isMutating || !canManageAccountState}
                    title={
                      isSelf
                        ? t('users.actions.useOwnPasswordChange')
                        : isTargetSuperAdmin && !currentIsSuperAdmin
                          ? t('users.actions.superAdminProtected')
                          : t('users.actions.resetPassword')
                    }
                    aria-label={t('users.actions.resetPassword')}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  {user.isBlocked ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onUnblockUser(user)}
                      disabled={isMutating || !canManageAccountState}
                      title={
                        isSelf
                          ? t('users.actions.selfProtection')
                          : isTargetSuperAdmin && !currentIsSuperAdmin
                            ? t('users.actions.superAdminProtected')
                            : t('users.actions.unblock')
                      }
                      aria-label={t('users.actions.unblock')}
                    >
                      <LockOpen className="h-4 w-4 text-emerald-600" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onBlockUser(user)}
                      disabled={isMutating || !canManageAccountState}
                      title={
                        isSelf
                          ? t('users.actions.selfProtection')
                          : isTargetSuperAdmin && !currentIsSuperAdmin
                            ? t('users.actions.superAdminProtected')
                            : t('users.actions.block')
                      }
                      aria-label={t('users.actions.block')}
                    >
                      <Ban className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteUser(user)}
                    disabled={isMutating}
                    title={t('users.actions.delete')}
                    aria-label={t('users.actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      canManageAccountControls,
      currentIsSuperAdmin,
      currentUserId,
      isMutating,
      onBlockUser,
      onDeleteUser,
      onEditUser,
      onResetPassword,
      onUnblockUser,
      t,
    ]
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
