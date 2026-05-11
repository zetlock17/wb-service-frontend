import type { ApiResponse } from './api';
import { getRequest, postRequest } from './api';

export interface ThesisDocumentLinkResponse {
    redirect_url: string;
    thesis_document_id: string;
    log_id: number;
    expires_in: number;
}

export interface ThesisTransitionLog {
    id: number;
    user_eid: string;
    thesis_document_id: string;
    local_document_id: number | null;
    status: 'pending' | 'success' | 'failed';
    error_message: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface ThesisLogsFilters {
    user_eid?: string | null;
    document_id?: number | null;
    status?: 'pending' | 'success' | 'failed' | null;
    limit?: number;
    offset?: number;
}

export interface ThesisLogsResponse {
    total: number;
    logs: ThesisTransitionLog[];
    limit: number;
    offset: number;
}

export interface ThesisStatsResponse {
    total_transitions: number;
    successful: number;
    failed: number;
    success_rate: number;
    last_24_hours: number;
}

export interface KeycloakSyncResponse {
    success: boolean;
    synced_count: number;
}

export const getThesisDocumentLink = async (
    thesisDocId: string,
    localDocumentId?: number | null
): Promise<ApiResponse<ThesisDocumentLinkResponse>> => {
    const params: Record<string, any> = {};
    if (localDocumentId !== undefined && localDocumentId !== null) {
        params.local_document_id = localDocumentId;
    }
    return await getRequest<ThesisDocumentLinkResponse>(
        `/api/v1/integrations/thesis/document/${encodeURIComponent(thesisDocId)}/link`,
        params
    );
};

export const getThesisLogs = async (
    filters?: ThesisLogsFilters
): Promise<ApiResponse<ThesisLogsResponse>> => {
    const params: Record<string, any> = {};
    if (filters?.user_eid) params.user_eid = filters.user_eid;
    if (filters?.document_id !== undefined) params.document_id = filters.document_id;
    if (filters?.status) params.status = filters.status;
    if (filters?.limit !== undefined) params.limit = filters.limit;
    if (filters?.offset !== undefined) params.offset = filters.offset;
    return await getRequest<ThesisLogsResponse>('/api/v1/integrations/thesis/logs', params);
};

export const getThesisStats = async (): Promise<ApiResponse<ThesisStatsResponse>> => {
    return await getRequest<ThesisStatsResponse>('/api/v1/integrations/thesis/stats');
};

export const syncKeycloakUsers = async (limit: number = 100): Promise<ApiResponse<KeycloakSyncResponse>> => {
    return await postRequest<KeycloakSyncResponse>(
        `/api/v1/integrations/keycloak/sync?limit=${limit}`
    );
};
