export interface AppVersion {
  id: string;
  version: string;
  needToUpdate: boolean;
  forceUpdate: boolean;
  isVisible: boolean;
  googlePlayLink: string;
  appStoreLink: string;
  websiteLink: string;
  createdAt: string;
}

export type CreateAppVersionInput = Omit<AppVersion, 'id' | 'createdAt'>;
export type UpdateAppVersionInput = Omit<CreateAppVersionInput, 'version'>;
