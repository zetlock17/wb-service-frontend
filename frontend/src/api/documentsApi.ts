import axios from 'axios';
import type { ApiResponse } from './api';
import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from './api';
import { getAccessToken } from '../utils/authTokens';

export type DocumentStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'PUBLISHED';

export interface Folder {
    id: number;
    name: string;
    parent_id: number | null;
    path: string;
    created_by: string;
    created_at: string | null;
}

export interface FolderTree {
    id: number;
    name: string;
    path: string;
    children: FolderTree[];
}

export interface FolderCreate {
    name: string;
    parent_id?: number | null;
}

export interface FolderUpdate {
    name?: string | null;
    parent_id?: number | null;
}

export interface DocumentsFilters {
    folder_id?: number | null;
    show_archived?: boolean;
    page?: number;
    size?: number;
}

export interface Document {
    id: number;
    folder_id: number | null;
    title: string;
    type: string;
    status: DocumentStatus;
    description: string | null;
    author_id: string;
    curator_id: string | null;
    current_version: number;
    s3_key: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface DocumentUpdate {
    title?: string | null;
    type?: string | null;
    folder_id?: number | null;
    status?: DocumentStatus | null;
    description?: string | null;
    curator_id?: string | null;
}

export interface DocumentUploadPayload {
    folder_id?: number | null;
    title?: string | null;
    type?: string | null;
    description?: string | null;
    curator_id?: string | null;
}

export interface DocumentArchivePayload {
    comment: string;
}

export interface DocumentVersion {
    id: number;
    document_id: number;
    version_major: number;
    version_minor: number;
    version_number?: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    uploaded_by: string;
    upload_comment: string | null;
    is_current: boolean;
    created_at: string | null;
}

export interface DocumentVersionUploadPayload {
    upload_comment?: string | null;
    bump_major?: boolean;
}

export interface UploadProgressOptions {
    onProgress?: (progress: number) => void;
}

export interface BlobDownloadResponse {
    data: Blob;
    status: number;
    filename?: string;
    message?: string;
}

export const getFolders = async (parentId?: number | null): Promise<ApiResponse<Folder[]>> => {
    const params = parentId === undefined ? undefined : { parent_id: parentId };
    return await getRequest<Folder[]>('/api/v1/folders/', params);
};

export const getFoldersTree = async (rootId?: number | null): Promise<ApiResponse<FolderTree[]>> => {
    const params = rootId === undefined ? undefined : { root_id: rootId };
    return await getRequest<FolderTree[]>('/api/v1/folders/tree', params);
};

export const createFolder = async (folderData: FolderCreate): Promise<ApiResponse<number>> => {
    return await postRequest<number>('/api/v1/folders/', folderData);
};

export const getFolderById = async (folderId: number): Promise<ApiResponse<Folder>> => {
    return await getRequest<Folder>(`/api/v1/folders/${folderId}`);
};

export const updateFolder = async (folderId: number, folderData: FolderUpdate): Promise<ApiResponse<Folder>> => {
    return await patchRequest<Folder>(`/api/v1/folders/${folderId}`, folderData);
};

export const deleteFolder = async (folderId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/folders/${folderId}`);
};

export const getDocuments = async (filters?: DocumentsFilters): Promise<ApiResponse<Document[]>> => {
    const params: Record<string, number | boolean | null> = {};

    if (filters?.folder_id !== undefined) params.folder_id = filters.folder_id;
    if (filters?.show_archived !== undefined) params.show_archived = filters.show_archived;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.size !== undefined) params.size = filters.size;

    return await getRequest<Document[]>('/api/v1/documents/', Object.keys(params).length ? params : undefined);
};

export const getDocumentById = async (docId: number): Promise<ApiResponse<Document>> => {
    return await getRequest<Document>(`/api/v1/documents/${docId}`);
};

export const updateDocument = async (docId: number, documentData: DocumentUpdate): Promise<ApiResponse<Document>> => {
    return await patchRequest<Document>(`/api/v1/documents/${docId}`, documentData);
};

export const deleteDocument = async (docId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/documents/${docId}`);
};

export const getDocumentDownloadUrl = async (docId: number): Promise<ApiResponse<Record<string, unknown>>> => {
    return await getRequest<Record<string, unknown>>(`/api/v1/documents/${docId}/download`);
};

export const archiveDocument = async (
    docId: number,
    payload: DocumentArchivePayload
): Promise<ApiResponse<Document>> => {
    return await putRequest<Document>(`/api/v1/documents/${docId}/archive`, payload);
};

export const restoreDocument = async (docId: number): Promise<ApiResponse<Document>> => {
    return await putRequest<Document>(`/api/v1/documents/${docId}/restore`);
};

export const getDocumentVersions = async (docId: number): Promise<ApiResponse<DocumentVersion[]>> => {
    return await getRequest<DocumentVersion[]>(`/api/v1/documents/${docId}/versions`);
};

export const getDocumentVersionDownloadUrl = async (
    docId: number,
    versionId: number
): Promise<ApiResponse<Record<string, unknown>>> => {
    return await getRequest<Record<string, unknown>>(`/api/v1/documents/${docId}/versions/${versionId}/download`);
};

export const setCurrentDocumentVersion = async (
    docId: number,
    versionId: number
): Promise<ApiResponse<DocumentVersion>> => {
    return await patchRequest<DocumentVersion>(`/api/v1/documents/${docId}/versions/${versionId}/set-current`);
};

export const deleteDocumentVersion = async (
    docId: number,
    versionId: number,
    reason: string
): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/documents/${docId}/versions/${versionId}`, { reason });
};

export const uploadDocument = async (
    file: File,
    payload?: DocumentUploadPayload,
    options?: UploadProgressOptions
): Promise<ApiResponse<number>> => {
    const formData = new FormData();
    formData.append('file', file);

    if (payload?.folder_id !== undefined && payload.folder_id !== null) {
        formData.append('folder_id', String(payload.folder_id));
    }
    if (payload?.title !== undefined && payload.title !== null) {
        formData.append('title', payload.title);
    }
    if (payload?.type !== undefined && payload.type !== null) {
        formData.append('type', payload.type);
    }
    if (payload?.description !== undefined && payload.description !== null) {
        formData.append('description', payload.description);
    }
    if (payload?.curator_id !== undefined && payload.curator_id !== null) {
        formData.append('curator_id', payload.curator_id);
    }

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = getAccessToken();

    try {
        const response = await axios.post<number>(`${baseURL}/api/v1/documents/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token ? `Bearer ${token}` : '',
            },
            onUploadProgress: (event) => {
                if (!options?.onProgress || !event.total) {
                    return;
                }
                const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                options.onProgress(percent);
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
};

export const uploadDocumentVersion = async (
    docId: number,
    file: File,
    payload?: DocumentVersionUploadPayload,
    options?: UploadProgressOptions
): Promise<ApiResponse<DocumentVersion>> => {
    const formData = new FormData();
    formData.append('file', file);

    if (payload?.upload_comment !== undefined && payload.upload_comment !== null) {
        formData.append('upload_comment', payload.upload_comment);
    }

    if (payload?.bump_major !== undefined) {
        formData.append('bump_major', String(payload.bump_major));
    }

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = getAccessToken();

    try {
        const response = await axios.post<DocumentVersion>(
            `${baseURL}/api/v1/documents/${docId}/versions`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                onUploadProgress: (event) => {
                    if (!options?.onProgress || !event.total) {
                        return;
                    }
                    const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
                    options.onProgress(percent);
                },
            }
        );

        return {
            data: response.data,
            status: response.status,
        };
    } catch (error: any) {
        return {
            data: {} as DocumentVersion,
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
};

const parseFilename = (contentDisposition?: string): string | undefined => {
    if (!contentDisposition) {
        return undefined;
    }

    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
        return decodeURIComponent(utfMatch[1]);
    }

    const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (asciiMatch?.[1]) {
        return asciiMatch[1];
    }

    return undefined;
};

export const downloadDocumentFile = async (docId: number): Promise<BlobDownloadResponse> => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = getAccessToken();

    try {
        const response = await axios.get<Blob>(`${baseURL}/api/v1/documents/${docId}/download`, {
            responseType: 'blob',
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
        });

        return {
            data: response.data,
            status: response.status,
            filename: parseFilename(response.headers['content-disposition']),
        };
    } catch (error: any) {
        return {
            data: new Blob(),
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const downloadDocumentVersionFile = async (
    docId: number,
    versionId: number
): Promise<BlobDownloadResponse> => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = getAccessToken();

    try {
        const response = await axios.get<Blob>(
            `${baseURL}/api/v1/documents/${docId}/versions/${versionId}/download`,
            {
                responseType: 'blob',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            }
        );

        return {
            data: response.data,
            status: response.status,
            filename: parseFilename(response.headers['content-disposition']),
        };
    } catch (error: any) {
        return {
            data: new Blob(),
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
};
