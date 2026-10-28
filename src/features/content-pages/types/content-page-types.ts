export const CONTENT_PAGE_SLUGS = ['privacy', 'help', 'support'] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

export interface PublicContentPage {
  slug: ContentPageSlug;
  html: string;
  updatedAt: string;
}

export interface AdminContentPage extends PublicContentPage {
  updatedByUserId: string;
}

export const CONTENT_PAGE_LABELS: Record<ContentPageSlug, string> = {
  privacy: 'سياسة الخصوصية',
  help: 'المساعدة والأسئلة الشائعة',
  support: 'معلومات الدعم والتواصل',
};
