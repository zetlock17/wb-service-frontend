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
    created_at: string | null;
    sent_at?: string | null;
    delivered_at?: string | null;
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
    receive_news?: boolean;
    receive_documents?: boolean;
    receive_birthdays?: boolean;
    receive_comments?: boolean;
    updated_at: string;
}

export interface NotificationPreferencesUpdateSchema {
    channel_portal?: boolean | null;
    channel_email?: boolean | null;
    channel_messenger?: boolean | null;
    digest_daily?: boolean | null;
    receive_news?: boolean | null;
    receive_documents?: boolean | null;
    receive_birthdays?: boolean | null;
    receive_comments?: boolean | null;
}

export interface NotificationStatsSchema {
    total_count: number;
    unread_count: number;
    read_count: number;
    mandatory_unread: number;
    by_type: Record<string, number>;
}

export interface UserBotMappingCreateSchema {
    band_chat_id: string;
    band_user_id?: string | null;
}

export interface UserBotMappingSchema {
    id: number;
    user_eid: string;
    band_chat_id: string;
    band_user_id?: string | null;
    is_active: boolean;
    last_delivery_at?: string | null;
    delivery_error_count: number;
    created_at: string;
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
    const response = await getRequest<NotificationListResponse>('/api/v1/notifications/', filters);

    if (response.status === 404) {
        return {
            status: 200,
            data: {
                total: 0,
                unread_count: 0,
                notifications: [],
                page: filters?.page ?? 1,
                size: filters?.size ?? 20,
            },
        };
    }

    return response;
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

export const getNotificationStats = async (): Promise<ApiResponse<NotificationStatsSchema>> => {
    return await getRequest<NotificationStatsSchema>('/api/v1/notifications/stats');
};

export const linkBot = async (data: UserBotMappingCreateSchema): Promise<ApiResponse<UserBotMappingSchema>> => {
    return await postRequest<UserBotMappingSchema>('/api/v1/notifications/bot/link', data);
};

export const getBotMapping = async (): Promise<ApiResponse<UserBotMappingSchema>> => {
    return await getRequest<UserBotMappingSchema>('/api/v1/notifications/bot/mapping');
};

export const unlinkBot = async (): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>('/api/v1/notifications/bot/unlink');
};

export const testBotNotification = async (): Promise<ApiResponse<any>> => {
    return await postRequest<any>('/api/v1/notifications/bot/test', {});
};
