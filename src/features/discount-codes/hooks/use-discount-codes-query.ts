import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { discountCodesApi } from '@/features/discount-codes/api/discount-codes-api';
import type { DiscountCodeRequest } from '@/features/discount-codes/types/discount-code-types';
import { getErrorMessage } from '@/services/api/api-error';
import type { PaginationParams } from '@/types/api';

export const useDiscountCodesQuery = (pagination: PaginationParams) =>
  useQuery({
    queryKey: queryKeys.discountCodes.list(pagination),
    queryFn: () => discountCodesApi.getDiscountCodes(pagination),
    placeholderData: keepPreviousData,
  });

export const useCreateDiscountCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DiscountCodeRequest) => discountCodesApi.createDiscountCode(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.root });
      toast.success('تم إنشاء كود الخصم بنجاح');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateDiscountCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DiscountCodeRequest }) =>
      discountCodesApi.updateDiscountCode(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.root });
      toast.success('تم تحديث كود الخصم بنجاح');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteDiscountCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountCodesApi.deleteDiscountCode(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.discountCodes.root });
      toast.success('تم حذف كود الخصم');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
