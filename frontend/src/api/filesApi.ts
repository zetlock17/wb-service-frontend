import axios from 'axios';
import { deleteRequest } from './api';
import { getAccessToken } from '../utils/authTokens';

interface UploadResponse {
    data: number;
    status: number;
    message?: string;
}

export const fetchStatic = async (id: number) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${baseURL}/api/v1/static/get?id=${id}`;
    const token = getAccessToken();

    try {
        console.log(`[FILE_DOWNLOAD] Отправка GET запроса...`);
        const response = await axios.get(url, {
            responseType: 'blob',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
        });
        const blob = response.data as Blob;


        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return {
            data: dataUrl,
            status: response.status,
        };
    } catch (error: any) {
        return {
            data: '',
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}

export const uploadPhoto = async (
    file: File,
    createdFor?: number,
    type: 'image' | 'video' | 'audio' | 'document' = 'image',
    lang: 'ru' | 'en' = 'ru',
): Promise<UploadResponse> => {

    const formData = new FormData();
    formData.append('file', file);

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const params = new URLSearchParams({ type, lang });
    if (createdFor !== undefined) {
        params.append('created_for', String(createdFor));
    }
    const url = `${baseURL}/api/v1/static/add?${params.toString()}`;
    const token = getAccessToken();

    try {

        const response = await axios.post<number>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : '',
            },
        });

        return {
            data: response.data,
            status: response.status,
        };
    } catch (error: any) {
        return {
            data: 0,
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}

export const deleteStatic = async (
    id: number,
    _legacyEid?: number,
    lang: 'ru' | 'en' = 'ru'
) => {
    const params: Record<string, number | string> = { id, lang };
    return await deleteRequest<void>('/api/v1/static/delete', params);
}