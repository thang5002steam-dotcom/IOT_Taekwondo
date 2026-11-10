import type { PersonSimpleResponse } from '@/features/person/api/person.dto';
import type { UserSimpleResponse } from '@/features/user/api/user.dto';
import type { NotificationRecipientStatus, NotificationType } from '../constants/notification.constants';

export interface NotificationCreateRequest {
  title: string | null;
  body: string | null;
  notificationType: NotificationType;
  referenceType: string | null;
  referenceId: string | null;
  payload: string | null;
  recipientUserIds?: string[] | null;
  recipientPersonIds?: string[] | null;
  recipientRoleCodes?: string[] | null;
}

export interface NotificationUpdateRequest {
  title: string | null;
  body: string | null;
  notificationType: NotificationType;
  referenceType: string | null;
  referenceId: string | null;
  payload: string | null;
}

export interface NotificationListParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}

export interface NotificationResponse {
  notificationId: string;
  title: string | null;
  body: string | null;
  notificationType: NotificationType | null;
  referenceType: string | null;
  referenceId: string | null;
  payload: string | null;
  createdAt: string | null;
  recipientCount: number | null;
}

export interface NotificationSimpleResponse {
  notificationId: string;
  title: string | null;
  notificationType: NotificationType;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  recipientCount: number | null;
}

export interface NotificationRecipientCreateRequest {
  notificationId: string;
  recipientUserId: string;
  contextPersonId?: string | null;
}

export interface NotificationRecipientUpdateRequest {
  read: boolean;
  deliveredAt?: string | null;
  notificationRecipientStatus: NotificationRecipientStatus;
}

export interface NotificationRecipientAdminResponse {
  notificationRecipientId: string;
  notification: NotificationResponse;
  recipientUser: UserSimpleResponse;
  contextPerson: PersonSimpleResponse | null;
  read: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  notificationRecipientStatus: NotificationRecipientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipientSimpleResponse {
  notificationRecipientId: string;
  notification: NotificationSimpleResponse;
  recipientUser: UserSimpleResponse;
  contextPerson: PersonSimpleResponse | null;
  read: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  notificationRecipientStatus: NotificationRecipientStatus;
  createdAt: string;
}

export interface NotificationRecipientMine {
  notificationRecipientId: string;
  notificationId: string;
  contextPersonId: string | null;
  title: string | null;
  body: string | null;
  notificationType: NotificationType;
  referenceType: string | null;
  referenceId: string | null;
  payload: string | null;
  read: boolean;
  readAt: string | null;
  deliveredAt: string | null;
  notificationRecipientStatus: NotificationRecipientStatus;
  createdAt: string;
}

export interface NotificationRecipientAdminDetail extends NotificationRecipientAdminResponse {}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MineListParams {
  read?: boolean | null;
  type?: NotificationType | null;
  search?: string | null;
  page?: number;
  size?: number;
  sort?: string | string[];
}
