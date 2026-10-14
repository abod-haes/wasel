import axios from 'axios';

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

const mapMarketUser = (user: MarketUserApiResponse): MarketOption | null => {
  const id = user.id ?? user.Id ?? '';
  if (!id) return null;

  const firstName = user.firstName ?? user.FirstName ?? '';
  const lastName = user.lastName ?? user.LastName ?? '';
  return {
    id,
    name: `${firstName} ${lastName}`.trim() || 'السوق الحالي',
    location: user.location ?? user.Location ?? '',
    latitude: user.latitude ?? user.Latitude,
    longitude: user.longitude ?? user.Longitude,
  };
};

export const marketsApi = {
  async getById(marketUserId: string): Promise<MarketOption | null> {
    try {
      const { data } = await apiClient.get<MarketUserApiResponse>(`/api/Users/${encodeURIComponent(marketUserId)}`);
      return mapMarketUser(data);
    } catch (error) {
      // Legacy products may reference deleted / unavailable Market accounts.
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async getOptions(search = '', signal?: AbortSignal): Promise<MarketOption[]> {
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
      signal,
    });
    const users = Array.isArray(data) ? data : getPaginatedItems(data);
    const markets = new Map<string, MarketOption>();

    for (const user of users) {
      const market = mapMarketUser(user);
      if (market) markets.set(market.id, market);
    }
    return Array.from(markets.values());
  },
};
