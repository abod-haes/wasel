import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { otpAdminApi } from '@/features/otp-admin/api/otp-admin-api';
import type {
  CreateOtpApiKeyInput,
  CreateOtpClientInput,
  UpdateOtpClientInput,
} from '@/features/otp-admin/types/otp-admin-types';

export const useOtpAdminSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.summary(),
    queryFn: otpAdminApi.getSummary,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
};

export const useWhatsAppSessionQuery = () => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.session(),
    queryFn: otpAdminApi.getSessionStatus,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });
};

export const useWhatsAppSessionActionMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (action: 'start' | 'reconnect' | 'stop' | 'logout') =>
      otpAdminApi.controlSession(action),
    onSuccess: (_data, action) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.session() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.summary() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.root });
      toast.success(t(`otpAdmin.messages.${action}Queued`));
    },
  });
};

export const useOtpRequestsQuery = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.requests({ page, pageSize }),
    queryFn: () => otpAdminApi.getOtpRequests(page, pageSize),
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
};

export const useOtpRequestQuery = (requestId: string | null) => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.request(requestId ?? ''),
    queryFn: () => otpAdminApi.getOtpRequest(requestId ?? ''),
    enabled: Boolean(requestId),
  });
};

export const useOtpAuditLogsQuery = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.auditLogs({ page, pageSize }),
    queryFn: () => otpAdminApi.getAuditLogs(page, pageSize),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
};

export const useOtpClientsQuery = () => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.clients(),
    queryFn: otpAdminApi.getClients,
  });
};

export const useCreateOtpClientMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateOtpClientInput) => otpAdminApi.createClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.clients() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.summary() });
      toast.success(t('otpAdmin.messages.clientCreated'));
    },
  });
};

export const useUpdateOtpClientMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateOtpClientInput) => otpAdminApi.updateClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.clients() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.summary() });
      toast.success(t('otpAdmin.messages.clientUpdated'));
    },
  });
};

export const useOtpApiKeysQuery = () => {
  return useQuery({
    queryKey: queryKeys.otpAdmin.apiKeys(),
    queryFn: otpAdminApi.getApiKeys,
  });
};

export const useCreateOtpApiKeyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: CreateOtpApiKeyInput) => otpAdminApi.createApiKey(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.apiKeys() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.summary() });
      toast.success(t('otpAdmin.messages.apiKeyCreated'));
    },
  });
};

export const useRevokeOtpApiKeyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => otpAdminApi.revokeApiKey(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.apiKeys() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.otpAdmin.summary() });
      toast.success(t('otpAdmin.messages.apiKeyRevoked'));
    },
  });
};
