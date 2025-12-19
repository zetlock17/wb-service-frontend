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

export const getProfile = async (eid: number): Promise<ApiResponse<UserProfile>> => {
    return await getRequest<UserProfile>(`/api/v1/profile/me`, { eid });
};

export const updateProfile = async (eid: number, profileData: CanEdit): Promise<ApiResponse<UserProfile>> => {
    return await patchRequest<UserProfile>(`/api/v1/profile/me?eid=${eid}`, profileData);
};

export const shareProfile = async (eid: number): Promise<ApiResponse<string>> => {
    return await getRequest<string>(`/api/v1/profile/share`, { eid });
};

export const getProfileEditLog = async (eid: number): Promise<ApiResponse<ProfileChangeLog[]>> => {
    return await getRequest<ProfileChangeLog[]>(`/api/v1/profile/log`, { eid });
};