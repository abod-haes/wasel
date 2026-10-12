import { apiClient } from '@/services/api/client';
import type {
  AppVersion,
  CreateAppVersionInput,
  UpdateAppVersionInput,
} from '@/features/app-versions/types/app-version-types';

const endpoint = '/api/AppVersions';
const versionUrl = (version: string): string => `${endpoint}/${encodeURIComponent(version.trim())}`;

export const appVersionsApi = {
  async getByVersion(version: string): Promise<AppVersion> {
    const { data } = await apiClient.get<AppVersion>(versionUrl(version));
    return data;
  },

  async create(payload: CreateAppVersionInput): Promise<AppVersion> {
    const { data } = await apiClient.post<AppVersion>(endpoint, payload);
    return data;
  },

  async update(version: string, payload: UpdateAppVersionInput): Promise<AppVersion> {
    const { data } = await apiClient.patch<AppVersion>(versionUrl(version), payload);
    return data;
  },
};
