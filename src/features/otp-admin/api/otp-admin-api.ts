import { env } from '@/env';
import type {
  AdminPaginatedResult,
  CreateOtpApiKeyInput,
  CreateOtpClientInput,
  CreatedOtpApiKey,
  OtpApiKey,
  OtpAuditLog,
  OtpClient,
  OtpDashboardSummary,
  OtpRequest,
  UpdateOtpClientInput,
  WhatsAppSessionStatus,
} from '@/features/otp-admin/types/otp-admin-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';

let mockSession: WhatsAppSessionStatus = {
  id: 'wasel-whatsapp',
  status: 'READY',
  phoneNumber: '+963900000000',
  displayName: 'Wasel',
  lastConnectedAt: new Date().toISOString(),
  lastDisconnectedAt: null,
  disconnectReason: null,
  lastError: null,
  qrDataUrl: null,
  worker: 'up',
  whatsappSocket: 'up',
};

const mockOtpRequests: OtpRequest[] = [
  {
    requestId: 'otp-1001',
    clientId: 'client-wasel',
    phoneNumber: '+963***029',
    purpose: 'login',
    status: 'SENT',
    attempts: 0,
    maxAttempts: 5,
    providerMessageId: 'mock-provider-1',
    failureReason: null,
    expiresAt: new Date(Date.now() + 180_000).toISOString(),
    queuedAt: new Date(Date.now() - 20_000).toISOString(),
    sendingAt: new Date(Date.now() - 19_000).toISOString(),
    sentAt: new Date(Date.now() - 18_000).toISOString(),
    verifiedAt: null,
    consumedAt: null,
    createdAt: new Date(Date.now() - 20_000).toISOString(),
    updatedAt: new Date(Date.now() - 18_000).toISOString(),
  },
];

const mockAuditLogs: OtpAuditLog[] = [
  {
    id: 'audit-1001',
    actorType: 'ADMIN',
    actorId: 'mock-admin',
    action: 'otp.whatsapp.reconnect',
    resource: 'OtpWhatsappSession',
    resourceId: null,
    ipAddress: null,
    metadata: null,
    createdAt: new Date().toISOString(),
  },
];

let mockClients: OtpClient[] = [
  {
    id: 'client-wasel',
    name: 'Wasel',
    slug: 'wasel',
    isActive: true,
    hourlyOtpLimit: 100,
    dailyOtpLimit: 500,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
];

let mockApiKeys: OtpApiKey[] = [
  {
    id: 'key-wasel',
    clientId: 'client-wasel',
    name: 'WASEL Backend',
    prefix: 'wasel-demo',
    status: 'ACTIVE',
    expiresAt: null,
    lastUsedAt: new Date().toISOString(),
    revokedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

const pageResult = <T,>(items: T[], page: number, pageSize: number): AdminPaginatedResult<T> => {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount: items.length,
  };
};

export const otpAdminApi = {
  async getSummary(): Promise<OtpDashboardSummary> {
    if (env.enableMockApi) {
      await delay(150);
      return {
        activeClients: mockClients.filter((client) => client.isActive).length,
        activeApiKeys: mockApiKeys.filter((key) => key.status === 'ACTIVE').length,
        today: { sent: 42, verified: 38, failedOrUnknown: 2 },
        worker: mockSession.worker,
        whatsapp: mockSession.status,
        whatsappSocket: mockSession.whatsappSocket,
      };
    }

    const { data } = await apiClient.get<OtpDashboardSummary>('/api/v1/admin/dashboard/summary');
    return data;
  },

  async getSessionStatus(): Promise<WhatsAppSessionStatus> {
    if (env.enableMockApi) {
      await delay(120);
      return { ...mockSession };
    }

    const { data } = await apiClient.get<WhatsAppSessionStatus>('/api/v1/admin/whatsapp/session/status');
    return data;
  },

  async controlSession(action: 'start' | 'reconnect' | 'stop' | 'logout'): Promise<{ queued: boolean; action: string }> {
    if (env.enableMockApi) {
      await delay(220);
      if (action === 'logout') {
        mockSession = {
          ...mockSession,
          status: 'LOGGED_OUT',
          phoneNumber: null,
          displayName: null,
          whatsappSocket: 'down',
          lastDisconnectedAt: new Date().toISOString(),
        };
      } else if (action === 'stop') {
        mockSession = {
          ...mockSession,
          status: 'DISCONNECTED',
          whatsappSocket: 'down',
          lastDisconnectedAt: new Date().toISOString(),
        };
      } else {
        mockSession = {
          ...mockSession,
          status: 'READY',
          phoneNumber: '+963900000000',
          displayName: 'Wasel',
          whatsappSocket: 'up',
          lastConnectedAt: new Date().toISOString(),
          lastError: null,
        };
      }
      return { queued: true, action };
    }

    const { data } = await apiClient.post<{ queued: boolean; action: string }>(
      `/api/v1/admin/whatsapp/session/${action}`
    );
    return data;
  },

  async getOtpRequests(page: number, pageSize: number): Promise<AdminPaginatedResult<OtpRequest>> {
    if (env.enableMockApi) {
      await delay(180);
      return pageResult(mockOtpRequests, page, pageSize);
    }

    const { data } = await apiClient.get<AdminPaginatedResult<OtpRequest>>('/api/v1/admin/otp', {
      params: { page, pageSize },
    });
    return data;
  },

  async getOtpRequest(requestId: string): Promise<OtpRequest | null> {
    if (env.enableMockApi) {
      await delay(120);
      return mockOtpRequests.find((item) => item.requestId === requestId) ?? null;
    }

    const { data } = await apiClient.get<OtpRequest | null>(`/api/v1/admin/otp/${requestId}`);
    return data;
  },

  async getAuditLogs(page: number, pageSize: number): Promise<AdminPaginatedResult<OtpAuditLog>> {
    if (env.enableMockApi) {
      await delay(180);
      return pageResult(mockAuditLogs, page, pageSize);
    }

    const { data } = await apiClient.get<AdminPaginatedResult<OtpAuditLog>>('/api/v1/admin/audit-logs', {
      params: { page, pageSize },
    });
    return data;
  },

  async getClients(): Promise<OtpClient[]> {
    if (env.enableMockApi) {
      await delay(120);
      return mockClients.map((client) => ({ ...client }));
    }

    const { data } = await apiClient.get<OtpClient[]>('/api/v1/admin/clients');
    return data;
  },

  async createClient(payload: CreateOtpClientInput): Promise<OtpClient> {
    if (env.enableMockApi) {
      await delay(180);
      const client: OtpClient = {
        id: `client-${Date.now()}`,
        name: payload.name,
        slug: payload.slug,
        isActive: true,
        hourlyOtpLimit: payload.hourlyOtpLimit ?? 100,
        dailyOtpLimit: payload.dailyOtpLimit ?? 500,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
      };
      mockClients = [client, ...mockClients];
      return client;
    }

    const { data } = await apiClient.post<OtpClient>('/api/v1/admin/clients', payload);
    return data;
  },

  async updateClient(payload: UpdateOtpClientInput): Promise<OtpClient> {
    const { id, ...request } = payload;

    if (env.enableMockApi) {
      await delay(180);
      const index = mockClients.findIndex((client) => client.id === id);
      if (index < 0) throw new Error('Client not found');
      mockClients[index] = { ...mockClients[index], ...request, updatedAt: new Date().toISOString() };
      return { ...mockClients[index] };
    }

    const { data } = await apiClient.put<OtpClient>(`/api/v1/admin/clients/${id}`, request);
    return data;
  },

  async getApiKeys(): Promise<OtpApiKey[]> {
    if (env.enableMockApi) {
      await delay(120);
      return mockApiKeys.map((key) => ({ ...key }));
    }

    const { data } = await apiClient.get<OtpApiKey[]>('/api/v1/admin/api-keys');
    return data;
  },

  async createApiKey(payload: CreateOtpApiKeyInput): Promise<CreatedOtpApiKey> {
    if (env.enableMockApi) {
      await delay(180);
      const id = `key-${Date.now()}`;
      const created: CreatedOtpApiKey = {
        id,
        clientId: payload.clientId,
        name: payload.name,
        prefix: `wasel-${id.slice(-6)}`,
        status: 'ACTIVE',
        expiresAt: payload.expiresAt ?? null,
        lastUsedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        apiKey: `wasel_mock_${Date.now()}_secret`,
      };
      const { apiKey: _apiKey, ...stored } = created;
      void _apiKey;
      mockApiKeys = [stored, ...mockApiKeys];
      return created;
    }

    const { data } = await apiClient.post<CreatedOtpApiKey>('/api/v1/admin/api-keys', payload);
    return data;
  },

  async revokeApiKey(id: string): Promise<OtpApiKey> {
    if (env.enableMockApi) {
      await delay(180);
      const index = mockApiKeys.findIndex((key) => key.id === id);
      if (index < 0) throw new Error('API key not found');
      mockApiKeys[index] = {
        ...mockApiKeys[index],
        status: 'REVOKED',
        revokedAt: new Date().toISOString(),
      };
      return { ...mockApiKeys[index] };
    }

    const { data } = await apiClient.post<OtpApiKey>(`/api/v1/admin/api-keys/${id}/revoke`);
    return data;
  },
};
