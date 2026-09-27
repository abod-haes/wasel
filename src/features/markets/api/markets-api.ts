import type { MarketOption } from '@/features/markets/types/market-types';
import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
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
    const pageSize = 100;
    let page = 1;
    const markets: MarketOption[] = [];

    while (true) {
      const { data } = await apiClient.get<MarketUsersResponse>('/api/Users', {
        params: {
          page,
          pageSize,
          includeRoles: true,
          roleName: 'Market',
        },
      });

      const paginated = toPaginatedData(data, { page, pageSize });

      for (const user of paginated.items) {
        const firstName = user.firstName ?? user.FirstName ?? '';
        const lastName = user.lastName ?? user.LastName ?? '';
        const location = user.location ?? user.Location ?? '';
        const latitude = user.latitude ?? user.Latitude;
        const longitude = user.longitude ?? user.Longitude;
        const id = user.id ?? user.Id ?? '';

        if (!id) continue;

        markets.push({
          id,
          name: `${firstName} ${lastName}`.trim() || 'Market',
          location,
          latitude,
          longitude,
        });
      }

      if (page >= paginated.totalPages || paginated.items.length === 0) break;
      page += 1;
    }

    return Array.from(new Map(markets.map((market) => [market.id, market])).values());
  },
};
