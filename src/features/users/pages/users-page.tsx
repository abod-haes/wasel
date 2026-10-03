import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { BlockUserDialog } from '@/features/users/components/block-user-dialog';
import { ResetUserPasswordDialog } from '@/features/users/components/reset-user-password-dialog';
import { UserFilters } from '@/features/users/components/user-filters';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import { UsersTable } from '@/features/users/components/users-table';
import {
  useBlockUserMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useRolesQuery,
  useUnblockUserMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from '@/features/users/hooks/use-users-query';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserFormInput,
  UserRoleAssignment,
  UsersFilter,
} from '@/features/users/types/user-types';
import type { PaginationParams } from '@/types/api';

const defaultFilters: UsersFilter = {
  search: '',
  role: 'all',
  status: 'all',
};

export default function UsersPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<UsersFilter>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [blockUser, setBlockUser] = useState<User | null>(null);
  const [unblockUser, setUnblockUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const usersQuery = useUsersQuery(filters, pagination);
  const rolesQuery = useRolesQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const blockUserMutation = useBlockUserMutation();
  const unblockUserMutation = useUnblockUserMutation();
  const resetPasswordMutation = useResetUserPasswordMutation();
  const roleOptions = useMemo<UserRoleAssignment[]>(
    () =>
      [...(rolesQuery.data ?? [])]
        .filter((role) => role.key !== 'viewer')
        .sort((first, second) => first.name.localeCompare(second.name)),
    [rolesQuery.data],
  );

  if (usersQuery.isError) {
    return <ErrorState onRetry={() => void usersQuery.refetch()} />;
  }

  const openCreateDialog = (): void => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setIsFormOpen(true);
  };

  const openEditDialog = (user: User): void => {
    setDialogMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const submitUser = (payload: UserFormInput): void => {
    if (dialogMode === 'create') {
      if (!payload.password) {
        return;
      }

      createUserMutation.mutate(payload as CreateUserInput, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
      return;
    }

    if (!selectedUser) {
      return;
    }

    const updatePayload: UpdateUserInput = {
      id: selectedUser.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      countryCallingCode: payload.countryCallingCode,
      phoneNumber: payload.phoneNumber,
      location: payload.location,
      latitude: payload.latitude,
      longitude: payload.longitude,
      phoneNumberVerified: payload.phoneNumberVerified,
      roleIds: payload.roleIds,
    };

    updateUserMutation.mutate(
      updatePayload,
      {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      }
    );
  };

  const confirmDelete = (): void => {
    if (!deleteUser) {
      return;
    }

    deleteUserMutation.mutate(deleteUser.id, {
      onSuccess: () => {
        setDeleteUser(null);
      },
    });
  };

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;
  const isMutating =
    isSubmitting ||
    deleteUserMutation.isPending ||
    blockUserMutation.isPending ||
    unblockUserMutation.isPending ||
    resetPasswordMutation.isPending;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="users.title"
        descriptionKey="users.description"
        actions={
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('users.createUser')}
          </Button>
        }
      />

      <UserFilters
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onReset={() => {
          setFilters(defaultFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
      />

      <UsersTable
        users={usersQuery.data?.items ?? []}
        isLoading={usersQuery.isLoading || usersQuery.isFetching}
        isMutating={isMutating}
        onEditUser={openEditDialog}
        onDeleteUser={setDeleteUser}
        onBlockUser={setBlockUser}
        onUnblockUser={setUnblockUser}
        onResetPassword={setResetPasswordUser}
        pagination={usersQuery.data}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      <UserFormDialog
        open={isFormOpen}
        mode={dialogMode}
        defaultUser={selectedUser}
        roleOptions={roleOptions}
        onOpenChange={setIsFormOpen}
        onSubmit={submitUser}
        isSubmitting={isSubmitting || rolesQuery.isLoading}
      />

      <BlockUserDialog
        open={Boolean(blockUser)}
        user={blockUser}
        onOpenChange={(open) => {
          if (!open) setBlockUser(null);
        }}
        isSubmitting={blockUserMutation.isPending}
        onSubmit={(reason) => {
          if (!blockUser) return;
          blockUserMutation.mutate(
            { userId: blockUser.id, reason },
            { onSuccess: () => setBlockUser(null) },
          );
        }}
      />

      <ResetUserPasswordDialog
        open={Boolean(resetPasswordUser)}
        user={resetPasswordUser}
        onOpenChange={(open) => {
          if (!open) setResetPasswordUser(null);
        }}
        isSubmitting={resetPasswordMutation.isPending}
        onSubmit={(newPassword) => {
          if (!resetPasswordUser) return;
          resetPasswordMutation.mutate(
            { userId: resetPasswordUser.id, newPassword },
            { onSuccess: () => setResetPasswordUser(null) },
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(unblockUser)}
        onOpenChange={(open) => {
          if (!open) setUnblockUser(null);
        }}
        onConfirm={() => {
          if (!unblockUser) return;
          unblockUserMutation.mutate(unblockUser.id, {
            onSuccess: () => setUnblockUser(null),
          });
        }}
        titleKey="users.confirmUnblock.title"
        descriptionKey="users.confirmUnblock.description"
        confirmLabelKey="users.actions.unblock"
        isLoading={unblockUserMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteUser)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
        onConfirm={confirmDelete}
        titleKey="users.confirmDelete.title"
        descriptionKey="users.confirmDelete.description"
        confirmLabelKey="users.deleteUser"
        isLoading={deleteUserMutation.isPending}
      />
    </PageContainer>
  );
}
