import { javaApi } from '@/infrastructure/http/httpClient';
import type { PageResponse } from '@/infrastructure/http/pagination.types';

import type {
  MineListParams,
  NotificationRecipientAdminDetail,
  NotificationRecipientAdminResponse,
  NotificationRecipientSimpleResponse,
  NotificationRecipientCreateRequest,
  NotificationRecipientMine,
  NotificationRecipientUpdateRequest,
  UnreadCountResponse,
} from './notification.dto';

export const notificationRecipientApi = {
  async getMine(
    params?: MineListParams,
  ): Promise<PageResponse<NotificationRecipientMine>> {
    const response = await javaApi.get<PageResponse<NotificationRecipientMine>>(
      '/notification-recipients/mine',
      { params },
    );
    return response.data;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await javaApi.get<UnreadCountResponse>(
      '/notification-recipients/mine/unread-count',
    );
    return response.data;
  },

  async getMineDetail(notificationRecipientId: string): Promise<NotificationRecipientMine> {
    const response = await javaApi.get<NotificationRecipientMine>(
      `/notification-recipients/mine/${notificationRecipientId}`,
    );
    return response.data;
  },

  async getDetail(notificationRecipientId: string): Promise<NotificationRecipientAdminDetail> {
    const response = await javaApi.get<NotificationRecipientAdminDetail>(
      `/notification-recipients/${notificationRecipientId}`,
    );
    return response.data;
  },

  async markRead(notificationRecipientId: string): Promise<UnreadCountResponse> {
    const response = await javaApi.patch<UnreadCountResponse>(
      `/notification-recipients/${notificationRecipientId}/read`,
    );
    return response.data;
  },

  async markAllRead(): Promise<UnreadCountResponse> {
    const response = await javaApi.patch<UnreadCountResponse>(
      '/notification-recipients/mine/read-all',
    );
    return response.data;
  },

  async create(request: NotificationRecipientCreateRequest): Promise<NotificationRecipientAdminResponse> {
    const response = await javaApi.post<NotificationRecipientAdminResponse>(
      '/notification-recipients',
      request,
    );
    return response.data;
  },

  async update(
    notificationRecipientId: string,
    request: NotificationRecipientUpdateRequest,
  ): Promise<NotificationRecipientAdminResponse> {
    const response = await javaApi.put<NotificationRecipientAdminResponse>(
      `/notification-recipients/${notificationRecipientId}`,
      request,
    );
    return response.data;
  },

  async remove(notificationRecipientId: string): Promise<void> {
    await javaApi.delete(`/notification-recipients/${notificationRecipientId}`);
  },
};
