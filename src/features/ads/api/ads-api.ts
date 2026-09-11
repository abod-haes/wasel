import { env } from '@/env';
import type {
  Ad,
  AdMediaType,
  AdProductSummary,
  CreateAdInput,
  UpdateAdInput,
} from '@/features/ads/types/ad-types';
import { apiClient } from '@/services/api/client';

interface ProductSummaryApiResponse {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  parCode?: string;
  ParCode?: string;
}

interface AdApiResponse {
  id?: string;
  Id?: string;
  productId?: string | null;
  ProductId?: string | null;
  imagePath?: string;
  ImagePath?: string;
  mediaPath?: string;
  MediaPath?: string;
  mediaType?: string;
  MediaType?: string;
  title?: string | null;
  Title?: string | null;
  description?: string | null;
  Description?: string | null;
  order?: number;
  Order?: number;
  product?: ProductSummaryApiResponse | null;
  Product?: ProductSummaryApiResponse | null;
}

const mockAds: Ad[] = [];

const normalizeOptionalText = (value?: string | null): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const inferMediaType = (path: string): AdMediaType => {
  const extension = path.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  if (extension === 'gif') return 'gif';
  if (extension === 'mp4' || extension === 'webm' || extension === 'mov') return 'video';
  return 'image';
};

const normalizeMediaType = (value: string | undefined, path: string): AdMediaType => {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'image' || normalized === 'gif' || normalized === 'video') return normalized;
  return inferMediaType(path);
};

const mapProduct = (source?: ProductSummaryApiResponse | null): AdProductSummary | null => {
  if (!source) return null;
  return {
    id: source.id ?? source.Id ?? '',
    name: source.name ?? source.Name ?? '',
    code: normalizeOptionalText(source.code ?? source.Code),
    parCode: normalizeOptionalText(source.parCode ?? source.ParCode),
  };
};

const mapAd = (source: AdApiResponse): Ad => {
  const mediaPath = source.mediaPath ?? source.MediaPath ?? source.imagePath ?? source.ImagePath ?? '';
  return {
    id: source.id ?? source.Id ?? '',
    productId: source.productId ?? source.ProductId ?? null,
    imagePath: source.imagePath ?? source.ImagePath ?? mediaPath,
    mediaPath,
    mediaType: normalizeMediaType(source.mediaType ?? source.MediaType, mediaPath),
    title: normalizeOptionalText(source.title ?? source.Title),
    description: normalizeOptionalText(source.description ?? source.Description),
    order: source.order ?? source.Order ?? 0,
    product: mapProduct(source.product ?? source.Product),
  };
};

const appendOptionalText = (formData: FormData, key: string, value: string | undefined): void => {
  if (value !== undefined) formData.append(key, value.trim());
};

export const adsApi = {
  async getAds(): Promise<Ad[]> {
    if (env.enableMockApi) return [...mockAds].sort((first, second) => first.order - second.order);
    const { data } = await apiClient.get<AdApiResponse[]>('/api/Ads');
    return (data ?? []).map(mapAd).sort((first, second) => first.order - second.order);
  },

  async getAd(adId: string): Promise<Ad> {
    if (env.enableMockApi) {
      const ad = mockAds.find((item) => item.id === adId);
      if (!ad) throw new Error('Ad not found.');
      return ad;
    }
    const { data } = await apiClient.get<AdApiResponse>(`/api/Ads/${adId}`);
    return mapAd(data);
  },

  async createAd(payload: CreateAdInput): Promise<Ad> {
    if (env.enableMockApi) {
      const mediaPath = URL.createObjectURL(payload.media);
      const created: Ad = {
        id: crypto.randomUUID(),
        productId: payload.productId ?? null,
        imagePath: mediaPath,
        mediaPath,
        mediaType: inferMediaType(payload.media.name),
        title: normalizeOptionalText(payload.title),
        description: normalizeOptionalText(payload.description),
        order: payload.order,
        product: null,
      };
      mockAds.push(created);
      return created;
    }

    const formData = new FormData();
    formData.append('Media', payload.media);
    appendOptionalText(formData, 'Title', payload.title);
    appendOptionalText(formData, 'Description', payload.description);
    formData.append('order', String(payload.order));
    if (payload.productId?.trim()) formData.append('ProductId', payload.productId.trim());

    const { data } = await apiClient.post<AdApiResponse>('/api/Ads', formData);
    return mapAd(data);
  },

  async updateAd(payload: UpdateAdInput): Promise<Ad> {
    if (env.enableMockApi) {
      const index = mockAds.findIndex((item) => item.id === payload.id);
      if (index < 0) throw new Error('Ad not found.');
      const current = mockAds[index];
      const mediaPath = payload.media ? URL.createObjectURL(payload.media) : current.mediaPath;
      const updated: Ad = {
        ...current,
        mediaPath,
        imagePath: mediaPath,
        mediaType: payload.media ? inferMediaType(payload.media.name) : current.mediaType,
        title: payload.title === undefined ? current.title : normalizeOptionalText(payload.title),
        description: payload.description === undefined ? current.description : normalizeOptionalText(payload.description),
        order: payload.order ?? current.order,
        productId: payload.productId ?? current.productId,
      };
      mockAds[index] = updated;
      return updated;
    }

    const formData = new FormData();
    if (payload.media) formData.append('Media', payload.media);
    appendOptionalText(formData, 'Title', payload.title);
    appendOptionalText(formData, 'Description', payload.description);
    if (payload.order !== undefined) formData.append('order', String(payload.order));
    if (payload.productId?.trim()) formData.append('ProductId', payload.productId.trim());

    const { data } = await apiClient.put<AdApiResponse>(`/api/Ads/${payload.id}`, formData);
    return mapAd(data);
  },

  async deleteAd(adId: string): Promise<void> {
    if (env.enableMockApi) {
      const index = mockAds.findIndex((item) => item.id === adId);
      if (index >= 0) mockAds.splice(index, 1);
      return;
    }
    await apiClient.delete(`/api/Ads/${adId}`);
  },
};
