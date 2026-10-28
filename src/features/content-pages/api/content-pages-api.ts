import axios from 'axios';

import { getActiveApiBaseUrl } from '@/config/api-environment';
import { apiClient } from '@/services/api/client';
import type {
  AdminContentPage,
  ContentPageSlug,
  PublicContentPage,
} from '@/features/content-pages/types/content-page-types';

const url = '/api/content-pages';

export const contentPagesApi = {
  async listAdmin(): Promise<AdminContentPage[]> {
    const { data } = await apiClient.get<AdminContentPage[]>(url);
    return data;
  },

  async save(slug: ContentPageSlug, html: string): Promise<AdminContentPage> {
    const { data } = await apiClient.put<AdminContentPage>(`${url}/${slug}`, { html });
    return data;
  },

  // Public endpoints MUST NOT attach a previously stored Admin JWT.
  async getPublic(slug: ContentPageSlug): Promise<PublicContentPage | null> {
    try {
      const { data } = await axios.get<PublicContentPage>(
        `${getActiveApiBaseUrl()}${url}/${slug}`,
        { headers: { Accept: 'application/json' } },
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },
};
