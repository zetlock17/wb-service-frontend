import type { ApiResponse } from './api';
import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from './api';

export type OrgUnitType = 'Department' | 'Management' | 'Division' | 'Group' | 'ProjectTeam';

export interface OrgUnitManager {
    eid: string;
    full_name: string;
    position: string;
    manager_avatar_id: number | null;
}

export interface OrgUnitHierarchy {
    id: number;
    name: string;
    unit_type: OrgUnitType;
    parent_id: number | null;
    is_temporary: boolean;
    start_date: string | null;
    end_date: string | null;
    manager: OrgUnitManager | null;
    children: OrgUnitHierarchy[];
}

export interface OrgUnitCreate {
    name: string;
    unit_type: OrgUnitType;
    parent_id?: number | null;
    manager_eid?: string | null;
    is_temporary?: boolean;
    start_date?: string | null;
    end_date?: string | null;
}

export interface OrgUnitUpdate {
    name?: string | null;
    unit_type?: OrgUnitType | null;
    is_temporary?: boolean | null;
    start_date?: string | null;
    end_date?: string | null;
}

export interface OrgUnitChangeLog {
    id: number;
    org_unit_id: number;
    changed_by_eid: string;
    changed_at: string;
    field_name: string;
    old_value: string | object | any[] | boolean | number | null;
    new_value: string | object | any[] | boolean | number | null;
    operation: string;
}

export interface ProfileSearchEmployee {
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

export interface ProfileSearchResult {
  total: number;
  results: ProfileSearchEmployee[];
  error?: string | null;
}

export interface ProfileSuggestion {
    eid: string;
  full_name: string;
  position: string;
  department: string;
}

export interface ProfileSearchSuggestResponse {
  suggestions: ProfileSuggestion[];
}

export const getOrgHierarchy = async (): Promise<ApiResponse<OrgUnitHierarchy[]>> => {
    return await getRequest<OrgUnitHierarchy[]>(`/api/v1/orgstructure/hierarchy`);
};

export const moveOrgUnit = async (unitId: number, newParentId?: number | null): Promise<ApiResponse<any>> => {
    const newParentParam = newParentId === undefined || newParentId === null ? '' : `&new_parent_id=${newParentId}`;
    return await putRequest<any>(`/api/v1/orgstructure/move?unit_id=${unitId}${newParentParam}`);
};

export const createOrgUnit = async (unitData: OrgUnitCreate): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/orgstructure/units/add`, unitData);
};

export const getOrgUnit = async (unitId: number): Promise<ApiResponse<OrgUnitHierarchy>> => {
    return await getRequest<OrgUnitHierarchy>(`/api/v1/orgstructure/units/get`, { unit_id: unitId });
};

export const updateOrgUnit = async (unitId: number, unitData: OrgUnitUpdate): Promise<ApiResponse<any>> => {
    return await patchRequest<any>(`/api/v1/orgstructure/units/update?unit_id=${unitId}`, unitData);
};

export const deleteOrgUnit = async (unitId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/orgstructure/units/delete?unit_id=${unitId}`);
};

export const setOrgUnitManager = async (unitId: number, managerEid: string): Promise<ApiResponse<any>> => {
    return await patchRequest<any>(
        `/api/v1/orgstructure/units/set_manager?unit_id=${unitId}&manager_eid=${managerEid}`
    );
};

export const getOrgUnitEditLog = async (unitId: number): Promise<ApiResponse<OrgUnitChangeLog[]>> => {
    return await getRequest<OrgUnitChangeLog[]>(`/api/v1/orgstructure/units/log`, { unit_id: unitId });
};

export const searchHierarchy = async (query: string, offset?: number, size?: number): Promise<ApiResponse<ProfileSearchResult>> => {
    return await getRequest<ProfileSearchResult>(`/api/v1/profile/search`, { q: query, from_: offset, size: size ?? 10 });
};

export const searchSuggestHierarchy = async (query: string, size?: number): Promise<ApiResponse<ProfileSearchSuggestResponse>> => {
    return await getRequest<ProfileSearchSuggestResponse>(`/api/v1/profile/suggest`, { q: query, size });
};