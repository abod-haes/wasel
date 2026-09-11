export type AdMediaType = 'image' | 'gif' | 'video';

export interface AdProductSummary {
  id: string;
  name: string;
  code?: string;
  parCode?: string;
}

export interface Ad {
  id: string;
  productId: string | null;
  imagePath: string;
  mediaPath: string;
  mediaType: AdMediaType;
  title?: string;
  description?: string;
  order: number;
  product?: AdProductSummary | null;
}

export interface AdFormPayload {
  media?: File;
  title?: string;
  description?: string;
  order: number;
  productId?: string;
}

export interface CreateAdInput extends Omit<AdFormPayload, 'media'> {
  media: File;
}

export interface UpdateAdInput {
  id: string;
  media?: File;
  title?: string;
  description?: string;
  order?: number;
  productId?: string;
}
