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
    const maxPages = 50;
    const markets = new Map<string, MarketOption>();

    for (let page = 1; page <= maxPages; page += 1) {
      const { data } = await apiClient.get<MarketUsersResponse | MarketUserApiResponse[]>('/api/Users', {
        params: { page, pageSize, includeRoles: true, roleName: 'Market' },
      });
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.Items) ? data.Items : Array.isArray(data.items) ? data.items : [];
      if (items.length === 0) break;

      const sizeBefore = markets.size;
      for (const user of items) {
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

      if (markets.size === sizeBefore || Array.isArray(data)) break;
      const totalPages = !Array.isArray(data) ? (data as { totalPages?: number; TotalPages?: number }).totalPages ?? (data as { TotalPages?: number }).TotalPages : undefined;
      const totalCount = 'TotalCount' in data ? data.TotalCount : undefined;
      const computedPages = totalCount ? Math.ceil(totalCount / pageSize) : undefined;
      if (page >= (totalPages ?? computedPages ?? (items.length < pageSize ? page : maxPages))) break;
    }

    return [...markets.values()];
  },
};
