import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import {
  deliveryPricingApi,
  type DeliveryPricingSettings,
} from '@/features/settings/api/delivery-pricing-api';

export const useDeliveryPricingQuery = () =>
  useQuery({
    queryKey: queryKeys.settings.deliveryPricing(),
    queryFn: deliveryPricingApi.get,
  });

export const useUpdateDeliveryPricingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeliveryPricingSettings) => deliveryPricingApi.update(input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings.deliveryPricing(), data);
      toast.success('تم حفظ إعدادات التوصيل');
    },
  });
};
