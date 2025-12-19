import axios from 'axios';
import { deleteRequest } from './api';

interface UploadResponse {
    data: number;
    status: number;
    message?: string;
}

export const fetchStatic = async (id: number) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${baseURL}/api/v1/static/get?id=${id}`;

    try {
        const response = await axios.get(url, { responseType: 'blob' });
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
        console.error('Failed fetchStatic:', error);
        return {
            data: '',
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}

export const uploadPhoto = async (
    file: File,
    eid: number,
    type: 'image' | 'video' | 'audio' | 'document' = 'image',
): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const url = `${baseURL}/api/v1/static/add?type=${type}&eid=${eid}`;

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
    const params: Record<string, number> = { id };
    if (eid) params.eid = eid;
    return await deleteRequest<void>('/api/v1/static/delete', params);
}