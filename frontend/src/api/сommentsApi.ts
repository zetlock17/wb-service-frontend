import type { ApiResponse } from './api';
import { getRequest, postRequest, putRequest, deleteRequest } from './api';

// Интерфейсы для комментариев
export interface Author {
    eid: string;
    full_name: string;
}

export interface Comment {
    id: number;
    parent_id: number | null;
    content: string;
    author: Author;
    created_at: string;
    is_edited: boolean;
    file_ids: number[] | null;
    likes_count: number;
    replies_count: number;
    replies: Comment[];
}

export interface CommentViewResponse {
    result: Comment[];
    count: number;
}

export interface CommentCreate {
    author_id: string;
    news_id: number;
    parent_id?: number | null;
    content: string;
    file_ids?: number[] | null;
}

export interface CommentUpdate {
    id: number;
    content: string;
    file_ids?: number[] | null;
}

export type CommentSortBy = 'popular' | 'new';

/**
 * Получение комментариев к новости с сортировкой
 * @param newsId - ID новости
 * @param sortBy - Сортировка комментариев ('popular' или 'new')
 * @returns Список комментариев с общим количеством
 */
export const getComments = async (
    newsId: number,
    sortBy: CommentSortBy = 'new'
): Promise<ApiResponse<CommentViewResponse>> => {
    return await getRequest<CommentViewResponse>('/api/v1/comments/', {
        news_id: newsId,
        sort_by: sortBy
    });
};

/**
 * Создание нового комментария
 * @param commentData - Данные комментария (автор, новость, содержимое, родительский комментарий)
 * @returns ID созданного комментария
 */
export const createComment = async (commentData: CommentCreate): Promise<ApiResponse<number>> => {
    return await postRequest<number>('/api/v1/comments/', commentData);
};

/**
 * Редактирование существующего комментария
 * @param commentData - Данные для обновления (ID комментария, новое содержимое, файлы)
 * @returns Ответ с результатом обновления
 */
export const updateComment = async (commentData: CommentUpdate): Promise<ApiResponse<any>> => {
    return await putRequest<any>('/api/v1/comments/', commentData);
};

/**
 * Удаление комментария
 * @param commentId - ID комментария
 * @param eid - EID пользователя
 * @returns Ответ с результатом удаления
 */
export const deleteComment = async (commentId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/comments/?comment_id=${commentId}`);
};

/**
 * Добавление лайка к комментарию
 * @param commentId - ID комментария
 * @param eid - EID пользователя
 * @returns Ответ с результатом операции
 */
export const addLikeToComment = async (commentId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/comments/like/add?comment_id=${commentId}`, {});
};

/**
 * Удаление лайка с комментария
 * @param commentId - ID комментария
 * @param eid - EID пользователя
 * @returns Ответ с результатом операции
 */
export const removeLikeFromComment = async (commentId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/comments/like/remove?comment_id=${commentId}`);
};
