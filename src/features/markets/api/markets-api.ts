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
  async getOptions(search = ''): Promise<MarketOption[]> {
    // Fetch only one page; search is server-side instead of eagerly paging
    // through every account while the product form is opening.
    const { data } = await apiClient.get<MarketUsersResponse | MarketUserApiResponse[]>('/api/Users', {
      params: {
        page: 1,
        pageSize: 100,
        includeRoles: true,
        roleName: 'Market',
        search: search.trim() || undefined,
      },
    });
    const users = Array.isArray(data) ? data : getPaginatedItems(data);
    const markets = new Map<string, MarketOption>();

    for (const user of users) {
      const id = user.id ?? user.Id ?? '';
      if (!id) continue;
      const firstName = user.firstName ?? user.FirstName ?? '';
      const lastName = user.lastName ?? user.LastName ?? '';
      markets.set(id, {
        id,
        name: `${firstName} ${lastName}`.trim() || 'Market',
        location: user.location ?? user.Location ?? '',
        latitude: user.latitude ?? user.Latitude,
        longitude: user.longitude ?? user.Longitude,
      });
    }
    return Array.from(markets.values());
  },
};
