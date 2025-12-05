import type { ApiResponse } from './api';
import { getRequest, patchRequest } from './api';
import type { UserProfile, CanEdit } from '../types/portal';

export const getProfile = async (eid: number): Promise<ApiResponse<UserProfile>> => {
    return await getRequest<UserProfile>(`/api/v1/profile/me`, { eid });
};

export const updateProfile = async (eid: number, profileData: CanEdit): Promise<ApiResponse<UserProfile>> => {
    return await patchRequest<UserProfile>(`/api/v1/profile/me?eid=${eid}`, profileData);
};