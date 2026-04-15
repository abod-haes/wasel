import { env } from '@/env';
import { settingsSchema } from '@/features/settings/schemas/settings-schema';
import type {
  UpdateWorkspaceSettingsInput,
  WorkspaceSettings,
} from '@/features/settings/types/settings-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

let settingsDb: WorkspaceSettings = {
  displayName: 'لوحة واسل',
  email: 'admin@wasel.com',
  language: 'ar',
  compactSidebar: false,
  emailNotifications: true,
};

export const settingsApi = {
  async getSettings(): Promise<WorkspaceSettings> {
    if (env.enableMockApi) {
      await delay(320);
      return settingsDb;
    }

    const { data } = await apiClient.get<WorkspaceSettings>('/api/Settings');
    return data;
  },

  async updateSettings(payload: UpdateWorkspaceSettingsInput): Promise<WorkspaceSettings> {
    if (env.enableMockApi) {
      await delay(480);
      const mergedSettings = {
        ...settingsDb,
        ...payload,
      };
      settingsDb = settingsSchema.parse(mergedSettings);
      return settingsDb;
    }

    const { data } = await apiClient.patch<WorkspaceSettings>('/api/Settings', payload);
    return data;
  },
};
