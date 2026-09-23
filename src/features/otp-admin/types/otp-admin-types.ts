export type WhatsAppSessionState =
  | 'DISCONNECTED'
  | 'STARTING'
  | 'QR_READY'
  | 'CONNECTING'
  | 'READY'
  | 'RECONNECTING'
  | 'LOGGED_OUT'
  | 'ERROR';

export interface WhatsAppSessionStatus {
  id: string;
  status: WhatsAppSessionState;
  phoneNumber: string | null;
  displayName: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  disconnectReason: string | null;
  lastError: string | null;
  qrDataUrl: string | null;
  worker: 'up' | 'down';
  whatsappSocket: 'up' | 'down';
}

export interface OtpDashboardSummary {
  activeClients: number;
  activeApiKeys: number;
  today: {
    sent: number;
    verified: number;
    failedOrUnknown: number;
  };
  worker: 'up' | 'down';
  whatsapp: WhatsAppSessionState;
  whatsappSocket: 'up' | 'down';
}

export type OtpRequestStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'VERIFIED'
  | 'EXPIRED'
  | 'FAILED'
  | 'BLOCKED'
  | 'UNKNOWN';

export type OtpPurpose =
  | 'login'
  | 'register'
  | 'reset_password'
  | 'verify_phone'
  | 'confirm_action';

export interface OtpRequest {
  requestId: string;
  clientId: string;
  phoneNumber: string;
  purpose: OtpPurpose | string;
  status: OtpRequestStatus;
  attempts: number;
  maxAttempts: number;
  providerMessageId: string | null;
  failureReason: string | null;
  expiresAt: string;
  queuedAt: string | null;
  sendingAt: string | null;
  sentAt: string | null;
  verifiedAt: string | null;
  consumedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string | null;
}

export interface OtpAuditLog {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface OtpClient {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  hourlyOtpLimit: number;
  dailyOtpLimit: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CreateOtpClientInput {
  name: string;
  slug: string;
  hourlyOtpLimit?: number;
  dailyOtpLimit?: number;
}

export interface UpdateOtpClientInput {
  id: string;
  name?: string;
  isActive?: boolean;
  hourlyOtpLimit?: number;
  dailyOtpLimit?: number;
}

export interface OtpApiKey {
  id: string;
  clientId: string;
  name: string;
  prefix: string;
  status: 'ACTIVE' | 'REVOKED' | string;
  expiresAt: string | null;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatedOtpApiKey extends OtpApiKey {
  apiKey: string;
}

export interface CreateOtpApiKeyInput {
  clientId: string;
  name: string;
  expiresAt?: string | null;
}

export interface AdminPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
