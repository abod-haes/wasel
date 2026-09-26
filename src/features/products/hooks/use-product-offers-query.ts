import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import {
  productOffersApi,
  type ProductOfferRequest,
} from '@/features/products/api/product-offers-api';
import { getErrorMessage } from '@/services/api/api-error';

const invalidateOfferQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  productId: string
): void => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.offers(productId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
};

export const useProductOffersQuery = (productId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.products.offers(productId ?? ''),
    queryFn: () => productOffersApi.getOffers(productId ?? ''),
    enabled: Boolean(productId),
  });

export const useCreateProductOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: ProductOfferRequest;
    }) => productOffersApi.createOffer(productId, payload),
    onSuccess: (_, { productId }) => {
      invalidateOfferQueries(queryClient, productId);
      toast.success('تم إنشاء العرض بنجاح');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateProductOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      offerId,
      payload,
    }: {
      productId: string;
      offerId: string;
      payload: ProductOfferRequest;
    }) => productOffersApi.updateOffer(productId, offerId, payload),
    onSuccess: (_, { productId }) => {
      invalidateOfferQueries(queryClient, productId);
      toast.success('تم تحديث العرض بنجاح');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteProductOfferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, offerId }: { productId: string; offerId: string }) =>
      productOffersApi.deleteOffer(productId, offerId),
    onSuccess: (_, { productId }) => {
      invalidateOfferQueries(queryClient, productId);
      toast.success('تم حذف العرض');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
