import type { ApiResponse } from './api';
import { getRequest, postRequest, patchRequest, deleteRequest } from './api';

// Интерфейсы для новостей
export interface NewsListItem {
    id: number;
    title: string;
    short_description: string;
    author_name: string;
    published_at: string;
    is_pinned: boolean;
    views_count: number;
    likes_count: number;
    comments_count: number;
}

export interface NewsDetail {
    id: number;
    title: string;
    short_description: string;
    author_name: string;
    published_at: string;
    is_pinned: boolean;
    views_count: number;
    likes_count: number;
    comments_count: number;
    content: string;
    mandatory_ack: boolean;
    files: number[];
}

export interface NewsCreate {
    title: string;
    content: string;
    short_description: string;
    category_id: number;
    tag_names?: string[];
    is_pinned?: boolean;
    mandatory_ack?: boolean;
    file_ids?: number[];
}

export interface NewsUpdate {
    title?: string;
    content?: string;
    short_description?: string;
    category_id?: number;
    tag_names?: string[];
    is_pinned?: boolean;
    mandatory_ack?: boolean;
    file_ids?: number[];
}

export interface Category {
    id: number;
    name: string;
}

export interface CategoryCreate {
    name: string;
}

export type NewsSortBy = 'newest' | 'popular' | 'discussed';

export interface NewsFilters {
    category_id?: number;
    date_from?: string;
    date_to?: string;
    sort_by?: NewsSortBy;
    page?: number;
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
export const createNews = async (userEid: number, newsData: NewsCreate): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/news/?user_eid=${userEid}`, newsData);
};

/**
 * Обновление существующей новости
 * @param newsId - ID новости
 * @param userEid - EID пользователя
 * @param newsData - Данные для обновления
 * @returns Ответ с результатом обновления
 */
export const updateNews = async (
    newsId: number, 
    userEid: number, 
    newsData: NewsUpdate
): Promise<ApiResponse<any>> => {
    return await patchRequest<any>(`/api/v1/news/${newsId}?user_eid=${userEid}`, newsData);
};

/**
 * Удаление новости
 * @param newsId - ID новости
 * @param userEid - EID пользователя
 * @returns Ответ с результатом удаления
 */
export const deleteNews = async (newsId: number, userEid: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/news/${newsId}?user_eid=${userEid}`);
};

/**
 * Получение списка всех категорий новостей
 * @returns Массив категорий
 */
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    return await getRequest<Category[]>('/api/v1/news/categories');
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
