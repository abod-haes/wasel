import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/services/api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnMount: 'always',
      // The dashboard does not expose manual refresh buttons.
      // Revalidate stale data automatically when the user returns to this tab.
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  }),
});
