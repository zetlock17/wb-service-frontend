import type { ApiResponse } from './api';
import { getRequest, patchRequest } from './api';
import type { UserProfile, CanEdit } from '../types/portal';

export interface ProfileChangeLog {
    id: number;
    profile_id: number;
    changed_by_eid: number;
    changed_at: string;
    table_name: string;
    record_id: number | null;
    field_name: string;
    old_value: string | object | any[] | boolean | number | null;
    new_value: string | object | any[] | boolean | number | null;
    operation: string;
}

export interface ProfileListItem {
    eid: string;
    full_name: string;
    position: string;
    org_unit?: string | null;
    birth_date?: string | null;
    hire_date?: string | null;
    work_phone?: string | null;
    work_email?: string | null;
    work_band?: string | null;
    is_fired?: boolean;
}

export interface ProfileListFilters {
    eid?: string;
    full_name?: string;
    position?: string;
    work_email?: string;
    work_band?: string;
    is_fired?: boolean;
    hire_date_from?: string;
    hire_date_to?: string;
    page?: number;
    size?: number;
}

export interface EmployeeSearchResult {
    eid: string;
    full_name: string;
    position: string;
    work_email?: string | null;
    work_phone?: string | null;
    organization_unit_id?: string | null;
    organization_unit_name?: string | null;
    work_band?: string | null;
    score: number;
}

export interface SearchResponse {
    total: number;
    results: EmployeeSearchResult[];
    error?: string | null;
}

export interface EmployeeSuggestion {
    eid: string;
    full_name: string;
    position: string;
    department: string;
}

export interface SuggestResponse {
    suggestions: EmployeeSuggestion[];
}

export const getProfile = async (_eid?: number | string): Promise<ApiResponse<UserProfile>> => {
    return await getRequest<UserProfile>(`/api/v1/profile/me`);
};

export const updateProfile = async (_eid: number | string, profileData: CanEdit): Promise<ApiResponse<UserProfile>> => {
    return await patchRequest<UserProfile>(`/api/v1/profile/me`, profileData);
};

export const shareProfile = async (_eid?: number | string): Promise<ApiResponse<string>> => {
    return await getRequest<string>(`/api/v1/profile/share`);
};

export const getProfileEditLog = async (_eid?: number | string): Promise<ApiResponse<ProfileChangeLog[]>> => {
    return await getRequest<ProfileChangeLog[]>(`/api/v1/profile/log`);
};

export const getProfilesList = async (filters?: ProfileListFilters): Promise<ApiResponse<ProfileListItem[]>> => {
    const params: Record<string, string | number | boolean> = {};

    if (filters?.eid !== undefined) params.eid = filters.eid;
    if (filters?.full_name !== undefined) params.full_name = filters.full_name;
    if (filters?.position !== undefined) params.position = filters.position;
    if (filters?.work_email !== undefined) params.work_email = filters.work_email;
    if (filters?.work_band !== undefined) params.work_band = filters.work_band;
    if (filters?.is_fired !== undefined) params.is_fired = filters.is_fired;
    if (filters?.hire_date_from !== undefined) params.hire_date_from = filters.hire_date_from;
    if (filters?.hire_date_to !== undefined) params.hire_date_to = filters.hire_date_to;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.size !== undefined) params.size = filters.size;

    return await getRequest<ProfileListItem[]>(`/api/v1/profile/list`, params);
};

export const exportProfiles = async (fields?: string): Promise<ApiResponse<any>> => {
    const params = fields ? { fields } : undefined;
    return await getRequest<any>(`/api/v1/profile/export`, params);
};

export const searchProfiles = async (
    q?: string,
    from_: number = 0,
    size: number = 10
): Promise<ApiResponse<SearchResponse>> => {
    return await getRequest<SearchResponse>(`/api/v1/profile/search`, { q, from_, size });
};

export const suggestEmployees = async (
    q: string = '',
    size: number = 10
): Promise<ApiResponse<SuggestResponse>> => {
    return await getRequest<SuggestResponse>(`/api/v1/profile/suggest`, { q, size });
};

export const getProfileSearchStats = async (): Promise<ApiResponse<any>> => {
    return await getRequest<any>(`/api/v1/profile/stats`);
};