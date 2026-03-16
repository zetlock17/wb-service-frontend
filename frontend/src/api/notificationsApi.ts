import type { ApiResponse } from './api';
import { deleteRequest, getRequest, patchRequest, postRequest } from './api';

export interface NotificationSchema {
    id: number;
    user_eid: string;
    event_type: string;
    title: string;
    message: string;
    payload?: Record<string, unknown> | null;
    is_read?: boolean;
    is_mandatory?: boolean;
    created_at: string;
}

export interface NotificationListResponse {
    total: number;
    unread_count: number;
    notifications: NotificationSchema[];
    page: number;
    size: number;
}

export interface NotificationCreateSchema {
    user_eid: string;
    event_type: string;
    title: string;
    message: string;
    payload?: Record<string, unknown> | null;
    is_mandatory?: boolean;
}

export interface NotificationBulkCreateSchema {
    notifications: NotificationCreateSchema[];
}

export interface NotificationPreferencesSchema {
    id: number;
    user_eid: string;
    channel_portal?: boolean;
    channel_email?: boolean;
    channel_messenger?: boolean;
    digest_daily?: boolean;
    updated_at: string;
}

export interface NotificationPreferencesUpdateSchema {
    channel_portal?: boolean | null;
    channel_email?: boolean | null;
    channel_messenger?: boolean | null;
    digest_daily?: boolean | null;
}

export interface NotificationsFilters {
    page?: number;
    size?: number;
    is_read?: boolean;
    event_type?: string;
}

export const getNotifications = async (
    filters?: NotificationsFilters
): Promise<ApiResponse<NotificationListResponse>> => {
    return await getRequest<NotificationListResponse>('/api/v1/notifications/', filters);
};

export const createNotification = async (
    data: NotificationCreateSchema
): Promise<ApiResponse<number>> => {
    return await postRequest<number>('/api/v1/notifications/', data);
};

export const getUnreadNotificationsCount = async (): Promise<ApiResponse<number>> => {
    return await getRequest<number>('/api/v1/notifications/unread-count');
};

export const getNotificationById = async (
    notificationId: number
): Promise<ApiResponse<NotificationSchema>> => {
    return await getRequest<NotificationSchema>(`/api/v1/notifications/${notificationId}`);
};

export const deleteNotification = async (notificationId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/notifications/${notificationId}`);
};

export const markNotificationAsRead = async (notificationId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/notifications/${notificationId}/read`, {});
};

export const markAllNotificationsAsRead = async (): Promise<ApiResponse<any>> => {
    return await postRequest<any>('/api/v1/notifications/read-all', {});
};

export const getNotificationPreferences = async (): Promise<ApiResponse<NotificationPreferencesSchema>> => {
    return await getRequest<NotificationPreferencesSchema>('/api/v1/notifications/preferences');
};

export const updateNotificationPreferences = async (
    data: NotificationPreferencesUpdateSchema
): Promise<ApiResponse<NotificationPreferencesSchema>> => {
    return await patchRequest<NotificationPreferencesSchema>('/api/v1/notifications/preferences', data);
};

export const createNotificationsBulk = async (
    data: NotificationBulkCreateSchema
): Promise<ApiResponse<number[]>> => {
    return await postRequest<number[]>('/api/v1/notifications/bulk', data);
};

export const cleanupOldNotifications = async (days: number = 30): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>('/api/v1/notifications/cleanup', { days });
};
