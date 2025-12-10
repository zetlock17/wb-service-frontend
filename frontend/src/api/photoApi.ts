import { getRequest, deleteRequest } from "./api";
import axios from 'axios';

interface UploadResponse {
    data: number;
    status: number;
    message?: string;
}

export const fetchStatic = async (id: number) => {
    return await getRequest<string>(`/api/v1/static/get`, { id });
}

export const uploadPhoto = async (
    eid: number,
    file: File,
    type: 'image' | 'video' | 'audio' | 'document' = 'image',
    lang: 'ru' | 'en' = 'ru',
    name?: string,
    created_for?: number
): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const params: Record<string, string> = {
        eid: eid.toString(),
        type,
        lang,
    };

    if (name) {
        params.name = name;
    }

    if (created_for !== undefined) {
        params.created_for = created_for.toString();
    }

    const queryParams = new URLSearchParams(params);
    const baseURL = import.meta.env.VITE_API_URL;
    const url = `${baseURL}/api/v1/static/add?${queryParams.toString()}`;

    try {
        const response = await axios.post<number>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return {
            data: response.data,
            status: response.status,
        };
    } catch (error: any) {
        console.error('Upload error:', error);
        return {
            data: 0,
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}

export const deleteStatic = async (id: number, eid: number) => {
    return await deleteRequest<void>(`/api/v1/static/delete?id=${id}&eid=${eid}`);
}