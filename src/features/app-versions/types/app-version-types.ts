export interface AppVersion {
  id: string;
  version: string;
  needToUpdate: boolean;
  forceUpdate: boolean;
  isVisible: boolean;
  /**
   * Version-specific release flag. The mobile app displays SYP when true,
   * USD when false. This does NOT change the app's API base URL.
   * Optional until the backend returns it from GET /api/AppVersions/{version}.
   */
  isProduction?: boolean;
  IsProduction?: boolean;
  googlePlayLink: string;
  appStoreLink: string;
  websiteLink: string;
  createdAt: string;
}

export type CreateAppVersionInput = Omit<AppVersion, 'id' | 'createdAt' | 'isProduction' | 'IsProduction'> & {
  isProduction: boolean;
};
export type UpdateAppVersionInput = Omit<CreateAppVersionInput, 'version'>;
