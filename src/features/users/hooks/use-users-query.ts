import { isAxiosError } from 'axios';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { usersApi } from '@/features/users/api/users-api';
import type {
  AdminResetPasswordInput,
  BlockUserInput,
  CreateUserInput,
  UpdateUserInput,
  UsersFilter,
} from '@/features/users/types/user-types';
import type { PaginationParams } from '@/types/api';

const getMutationErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

export const useRolesQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.roles(),
    queryFn: usersApi.getRoles,
  });
};

export const useUsersQuery = (filters: UsersFilter, pagination: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.users.list({ filters, pagination }),
    queryFn: () => usersApi.getUsers(filters, pagination),
    placeholderData: keepPreviousData,
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


export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userId, reason }: BlockUserInput) => usersApi.blockUser(userId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(t('users.messages.blocked'));
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t('users.messages.blockFailed')));
    },
  });
};

export const useUnblockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (userId: string) => usersApi.unblockUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(t('users.messages.unblocked'));
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t('users.messages.unblockFailed')));
    },
  });
};

export const useResetUserPasswordMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userId, newPassword }: AdminResetPasswordInput) =>
      usersApi.resetUserPassword(userId, newPassword),
    onSuccess: () => {
      toast.success(t('users.messages.passwordReset'));
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t('users.messages.passwordResetFailed')));
    },
  });
};
