import type { LanguageCode } from '@/types/i18n';

export interface WorkspaceSettings {
  displayName: string;
  email: string;
  language: LanguageCode;
  compactSidebar: boolean;
  emailNotifications: boolean;
}

export type UpdateWorkspaceSettingsInput = Partial<WorkspaceSettings>;
