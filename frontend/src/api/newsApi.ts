import type { ApiResponse } from './api';
import { getRequest, postRequest, patchRequest, deleteRequest } from './api';

// Интерфейсы для новостей
export interface NewsListItem {
    id: number;
    title: string;
    short_description: string;
    author_name: string;
    categories?: Category[];
    file_ids?: number[];
    published_at: string;
    is_pinned: boolean;
    comments_enabled: boolean;
    views_count: number;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    status?: NewsStatus;
    tags?: string[];
}

export interface NewsDetail {
    id: number;
    title: string;
    short_description: string;
    author_name: string;
    file_ids?: number[];
    published_at: string;
    is_pinned: boolean;
    comments_enabled: boolean;
    views_count: number;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    content: string;
    mandatory_ack: boolean;
    ack_target_all: boolean;
    is_acknowledged: boolean;
    must_acknowledge: boolean;
    expires_at?: string | null;
    scheduled_publish_at?: string | null;
    tags?: string[];
    categories?: Category[];
    status?: NewsStatus;
}

export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';

export interface NewsCreate {
    title: string;
    content: string;
    short_description: string;
    category_ids: number[];
    tag_names?: string[];
    is_pinned?: boolean;
    mandatory_ack?: boolean;
    ack_target_all?: boolean;
    ack_target_eids?: string[];
    ack_target_org_unit_ids?: number[];
    comments_enabled?: boolean;
    file_ids?: number[];
    status?: NewsStatus;
    scheduled_publish_at?: string | null;
    expires_at?: string | null;
}

export interface NewsUpdate {
    title?: string;
    content?: string;
    short_description?: string;
    category_ids?: number[];
    tag_names?: string[];
    is_pinned?: boolean;
    mandatory_ack?: boolean;
    ack_target_all?: boolean;
    ack_target_eids?: string[];
    ack_target_org_unit_ids?: number[];
    comments_enabled?: boolean;
    file_ids?: number[];
    status?: NewsStatus;
    scheduled_publish_at?: string | null;
    expires_at?: string | null;
}

export interface Category {
    id: number;
    name: string;
}

export interface CategoryCreate {
    name: string;
}

export interface AcknowledgementTarget {
    user_eid: string;
    full_name: string;
    acknowledged: boolean;
    acknowledged_at?: string | null;
}

export interface AcknowledgementStatus {
    news_id: number;
    ack_target_all: boolean;
    total_targets: number;
    acknowledged_count: number;
    targets: AcknowledgementTarget[];
}

export type NewsSortBy = 'newest' | 'popular' | 'discussed';

export interface NewsFilters {
    category_id?: number;
    date_from?: string;
    date_to?: string;
    sort_by?: NewsSortBy;
    page?: number;
    size?: number;
    likes?: boolean;
    status?: NewsStatus;
    tag?: string;
    search?: string;
}

/**
 * Получение списка новостей с фильтрами, сортировкой и пагинацией
 * @param filters - Фильтры для новостей (категория, даты, сортировка, страница)
 * @returns Массив новостей (закрепленные всегда в топе)
 */
export const getNews = async (filters?: NewsFilters): Promise<ApiResponse<NewsListItem[]>> => {
    const params: Record<string, any> = {};
    
    if (filters?.category_id) params.category_id = filters.category_id;
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;
    if (filters?.sort_by) params.sort_by = filters.sort_by;
    if (filters?.page) params.page = filters.page;
    if (filters?.size) params.size = filters.size;
    if (filters?.likes !== undefined) params.likes = filters.likes;
    if (filters?.status) params.status = filters.status;
    if (filters?.tag) params.tag = filters.tag;
    if (filters?.search) params.search = filters.search;
    
    return await getRequest<NewsListItem[]>('/api/v1/news/', params);
};

/**
 * Получение детальной информации о новости по ID
 * @param newsId - ID новости
 * @returns Детальная информация о новости
 */
export const getNewsById = async (newsId: number): Promise<ApiResponse<NewsDetail>> => {
    return await getRequest<NewsDetail>(`/api/v1/news/${newsId}`);
};

/**
 * Создание новой новости
 * @param userEid - EID пользователя-автора
 * @param newsData - Данные новости
 * @returns Ответ с результатом создания
 */
export const createNews = async (newsData: NewsCreate): Promise<ApiResponse<any>> => {
    console.log('Создание новости с данными:', newsData);
    const response = await postRequest<any>('/api/v1/news/', newsData);
    console.log('Создана новость:', response);
    return response;
};

/**
 * Обновление существующей новости
 * @param newsId - ID новости
 * @param userEid - EID пользователя
 * @param newsData - Данные для обновления
 * @returns Ответ с результатом обновления
 */
export const updateNews = async (newsId: number, newsData: NewsUpdate): Promise<ApiResponse<any>> => {
    return await patchRequest<any>(`/api/v1/news/${newsId}`, newsData);
};

/**
 * Удаление новости
 * @param newsId - ID новости
 * @param userEid - EID пользователя
 * @returns Ответ с результатом удаления
 */
export const deleteNews = async (newsId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/news/${newsId}`);
};

/**
 * Получение списка всех категорий новостей
 * @returns Массив категорий
 */
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    return await getRequest<Category[]>('/api/v1/news/categories');
};

/**
 * Получение списка отслеживаемых категорий текущим пользователем
 * @returns Массив отслеживаемых категорий
 */
export const getFollowedCategories = async (): Promise<ApiResponse<Category[]>> => {
    return await getRequest<Category[]>('/api/v1/news/categories/followed');
};

/**
 * Подписаться на категорию
 * @param categoryId - ID категории
 * @returns Ответ с результатом операции
 */
export const followCategory = async (categoryId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/news/categories/${categoryId}/follow`, {});
};

/**
 * Отписаться от категории
 * @param categoryId - ID категории
 * @returns Ответ с результатом операции
 */
export const unfollowCategory = async (categoryId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/news/categories/${categoryId}/follow`);
};

/**
 * Создание новой категории (только для администратора)
 * @param categoryData - Данные категории
 * @returns ID созданной категории
 */
export const createCategory = async (categoryData: CategoryCreate): Promise<ApiResponse<number>> => {
    return await postRequest<number>('/api/v1/news/categories', categoryData);
};

/**
 * Удаление категории
 * @param categoryId - ID категории
 * @returns Ответ с результатом удаления
 */
export const deleteCategory = async (categoryId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/news/categories/${categoryId}`);
};

/**
 * Добавление лайка к новости
 * @param newsId - ID новости
 * @returns Ответ с результатом операции
 */
export const addLikeToNews = async (newsId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/news/like/add?news_id=${newsId}`, {});
};

/**
 * Удаление лайка с новости
 * @param newsId - ID новости
 * @returns Ответ с результатом операции
 */
export const removeLikeFromNews = async (newsId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/news/like/remove?news_id=${newsId}`);
};

/**
 * Подтвердить прочтение новости (для обязательных новостей)
 * @param newsId - ID новости
 * @returns Ответ с результатом операции
 */
export const acknowledgeNews = async (newsId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/news/${newsId}/acknowledge`, {});
};

/**
 * Получить статус подтверждений прочтения новости
 * @param newsId - ID новости
 * @returns Статус подтверждений (кто прочитал, кто нет)
 */
export const getAcknowledgements = async (newsId: number): Promise<ApiResponse<AcknowledgementStatus>> => {
    return await getRequest<AcknowledgementStatus>(`/api/v1/news/${newsId}/acknowledgements`);
};

/**
 * Получить историю изменений новости
 * @param newsId - ID новости
 * @returns История изменений
 */
export const getNewsEditLog = async (newsId: number): Promise<ApiResponse<any>> => {
    return await getRequest<any>(`/api/v1/news/${newsId}/log`);
};
