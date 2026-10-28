import { apiClient } from '@/services/api/client';
import { getActiveApiBaseUrl } from '@/config/api-environment';

export const CONTENT_SLUGS = ['privacy', 'help', 'support'] as const;
export type ContentPageSlug = (typeof CONTENT_SLUGS)[number];

export interface PublicContentPage {
  slug: ContentPageSlug;
  html: string;
  updatedAt: string;
}

export interface AdminContentPage extends PublicContentPage {
  updatedByUserId: string;
}

export const contentPagesApi = {
  async list(): Promise<AdminContentPage[]> {
    const response = await apiClient.get<AdminContentPage[]>('/api/content-pages');
    return response.data;
  },
  async save(slug: ContentPageSlug, html: string): Promise<AdminContentPage> {
    const response = await apiClient.put<AdminContentPage>(
      `/api/content-pages/${slug}`,
      { html },
    );
    return response.data;
  },
  async getPublic(slug: ContentPageSlug): Promise<PublicContentPage | null> {
    // Public policy pages must not depend on browser authentication/JWT.
    const response = await fetch(`${getActiveApiBaseUrl()}/api/content-pages/${slug}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Unable to load content page (${response.status})`);
    return (await response.json()) as PublicContentPage;
  },
};
