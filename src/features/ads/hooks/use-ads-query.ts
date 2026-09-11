import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { adsApi } from '@/features/ads/api/ads-api';
import type { CreateAdInput, UpdateAdInput } from '@/features/ads/types/ad-types';

export const useAdsQuery = () => useQuery({
  queryKey: queryKeys.ads.list(),
  queryFn: () => adsApi.getAds(),
});

export const useAdQuery = (adId: string | undefined) => useQuery({
  queryKey: queryKeys.ads.detail(adId ?? ''),
  queryFn: () => adsApi.getAd(adId ?? ''),
  enabled: Boolean(adId),
});

export const useCreateAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdInput) => adsApi.createAd(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ads.root });
      toast.success('تم إنشاء الإعلان بنجاح');
    },
  });
};

export const useUpdateAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAdInput) => adsApi.updateAd(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ads.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ads.detail(payload.id) });
      toast.success('تم تحديث الإعلان بنجاح');
    },
  });
};

export const useDeleteAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => adsApi.deleteAd(adId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ads.root });
      toast.success('تم حذف الإعلان بنجاح');
    },
  });
};
