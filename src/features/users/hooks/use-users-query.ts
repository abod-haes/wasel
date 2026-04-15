import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { usersApi } from '@/features/users/api/users-api';
import type {
  CreateUserInput,
  UpdateUserInput,
  UsersFilter,
} from '@/features/users/types/user-types';

export const useUsersQuery = (filters: UsersFilter) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.getUsers(filters),
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateUserInput) => usersApi.createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(t('users.messages.created'));
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateUserInput) => usersApi.updateUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(t('users.messages.updated'));
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(t('users.messages.deleted'));
    },
  });
};
