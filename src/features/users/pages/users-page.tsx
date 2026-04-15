import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { UserFilters } from '@/features/users/components/user-filters';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import { UsersTable } from '@/features/users/components/users-table';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
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

const defaultFilters: UsersFilter = {
  search: '',
  role: 'all',
  status: 'all',
};

export default function UsersPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<UsersFilter>(defaultFilters);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const usersQuery = useUsersQuery(filters);
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const roleOptions = useMemo<UserRoleAssignment[]>(() => {
    const users = usersQuery.data ?? [];
    const uniqueRoleMap = new Map<string, UserRoleAssignment>();

    users.forEach((user) => {
      user.roles.forEach((role) => {
        if (!role.id) {
          return;
        }

        uniqueRoleMap.set(role.id, role);
      });
    });

    return Array.from(uniqueRoleMap.values()).sort((first, second) =>
      first.name.localeCompare(second.name)
    );
  }, [usersQuery.data]);

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
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      location: payload.location,
      latitude: payload.latitude,
      longitude: payload.longitude,
      phoneNumberVerified: payload.phoneNumberVerified,
      roleIds: payload.roleIds,
    };

    if (payload.password) {
      updatePayload.password = payload.password;
    }

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
  const isMutating = isSubmitting || deleteUserMutation.isPending;

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

      <UserFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

      <UsersTable
        users={usersQuery.data ?? []}
        isLoading={usersQuery.isLoading || usersQuery.isFetching}
        isMutating={isMutating}
        onEditUser={openEditDialog}
        onDeleteUser={setDeleteUser}
      />

      <UserFormDialog
        open={isFormOpen}
        mode={dialogMode}
        defaultUser={selectedUser}
        roleOptions={roleOptions}
        onOpenChange={setIsFormOpen}
        onSubmit={submitUser}
        isSubmitting={isSubmitting}
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
