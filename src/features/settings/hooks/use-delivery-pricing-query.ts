import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import {
  deliveryPricingApi,
  type UpdateDeliveryPricingSettings,
} from '@/features/settings/api/delivery-pricing-api';

function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : 'تعذر حفظ إعدادات التوصيل.';
}

export const useDeliveryPricingQuery = () =>
  useQuery({
    queryKey: queryKeys.settings.deliveryPricing(),
    queryFn: deliveryPricingApi.get,
  });

export const useUpdateDeliveryPricingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDeliveryPricingSettings) => deliveryPricingApi.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings.deliveryPricing(), data);
      toast.success('تم حفظ إعدادات التوصيل');
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};
