import { settingsSchema } from '@/features/settings/schemas/settings-schema';
import type {
  UpdateWorkspaceSettingsInput,
  WorkspaceSettings,
} from '@/features/settings/types/settings-types';

const STORAGE_KEY = 'wasel_dashboard_settings';

const defaultSettings: WorkspaceSettings = {
  displayName: 'لوحة واسل',
  language: 'ar',
  compactSidebar: false,
};

const readSettings = (): WorkspaceSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return defaultSettings;
  }

  try {
    return settingsSchema.parse({
      ...defaultSettings,
      ...(JSON.parse(storedValue) as Partial<WorkspaceSettings>),
    });
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultSettings;
  }
};

const writeSettings = (settings: WorkspaceSettings): WorkspaceSettings => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  return settings;
};

export const settingsApi = {
  async getSettings(): Promise<WorkspaceSettings> {
    return readSettings();
  },

  async updateSettings(payload: UpdateWorkspaceSettingsInput): Promise<WorkspaceSettings> {
    const currentSettings = readSettings();
    const nextSettings = settingsSchema.parse({
      ...currentSettings,
      ...payload,
    });

    return writeSettings(nextSettings);
  },
};
