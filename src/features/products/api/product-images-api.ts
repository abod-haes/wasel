import { env } from '@/env';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

export const productImagesApi = {
  async addImages(productId: string, files: File[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    if (env.enableMockApi) {
      await delay(250);
      return;
    }

    if (files.length === 1) {
      const formData = new FormData();
      formData.append('Image', files[0]);
      await apiClient.post(`/api/Products/${productId}/images`, formData);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('Images', file));
    await apiClient.post(`/api/Products/${productId}/images/batch`, formData);
  },

  async replaceMainImage(productId: string, file: File): Promise<void> {
    if (env.enableMockApi) {
      await delay(250);
      return;
    }

    const formData = new FormData();
    formData.append('Image', file);
    await apiClient.put(`/api/Products/${productId}/image`, formData);
  },

  async deleteImage(productId: string, imageId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(200);
      return;
    }

    await apiClient.delete(`/api/Products/${productId}/images/${imageId}`);
  },

  async setMainImage(productId: string, imageId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(200);
      return;
    }

    await apiClient.put(`/api/Products/${productId}/images/${imageId}/set-main`);
  },
};
