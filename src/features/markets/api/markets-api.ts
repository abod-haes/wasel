import type { MarketOption } from '@/features/markets/types/market-types';
import { apiClient } from '@/services/api/client';
import { getPaginatedItems } from '@/services/api/pagination';
import type { ApiPaginatedResult } from '@/types/api';

interface MarketUserApiResponse {
  id?: string;
  Id?: string;
  firstName?: string;
  FirstName?: string;
  lastName?: string;
  LastName?: string;
  location?: string;
  Location?: string;
  latitude?: number;
  Latitude?: number;
  longitude?: number;
  Longitude?: number;
}

type MarketUsersResponse = Partial<ApiPaginatedResult<MarketUserApiResponse>> & {
  items?: MarketUserApiResponse[];
};

export const marketsApi = {
  async getOptions(): Promise<MarketOption[]> {
    const { data } = await apiClient.get<MarketUsersResponse>('/api/Users', {
      params: {
        page: 1,
        pageSize: 100,
        includeRoles: true,
        roleName: 'Market',
      },
    });

    return getPaginatedItems(data)
      .map((user) => {
        const firstName = user.firstName ?? user.FirstName ?? '';
        const lastName = user.lastName ?? user.LastName ?? '';
        const location = user.location ?? user.Location ?? '';
        const latitude = user.latitude ?? user.Latitude;
        const longitude = user.longitude ?? user.Longitude;

        if (latitude == null || longitude == null) return null;

        return {
          id: user.id ?? user.Id ?? '',
          name: `${firstName} ${lastName}`.trim() || 'Market',
          location,
          latitude,
          longitude,
        } satisfies MarketOption;
      })
      .filter((market): market is MarketOption => Boolean(market?.id));
  },
};
