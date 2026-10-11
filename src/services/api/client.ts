import axios from 'axios';

import { getActiveApiBaseUrl } from '@/config/api-environment';
import { clearStoredAuthSession, getStoredAuthToken } from '@/services/auth/auth-storage';
import { serializeApiParams } from '@/services/api/params-serializer';

export const apiClient = axios.create({
  baseURL: getActiveApiBaseUrl(),
  paramsSerializer: {
    serialize: serializeApiParams,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getActiveApiBaseUrl();
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.setContentType(undefined);
  }

  const storedToken = getStoredAuthToken();

  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredAuthSession();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('wasel:auth-invalidated'));
      }
    }

    return Promise.reject(error);
  }
);
