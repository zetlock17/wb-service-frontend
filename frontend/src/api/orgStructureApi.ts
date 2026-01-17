import type { ApiResponse } from './api';
import { getRequest } from './api';

export type OrgUnitType = 'Department' | 'Management' | 'Division' | 'Group' | 'ProjectTeam';

export interface OrgUnitManager {
    eid: number;
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

export interface ProfileSearchEmployee {
  eid: number;
  full_name: string;
  position: string;
  work_email: string;
  work_phone: string;
  organization_unit_id: string;
  organization_unit_name: string;
  work_band: string;
  score: number;
}

export interface ProfileSearchResult {
  total: number;
  results: ProfileSearchEmployee[];
  error?: string | null;
}

export interface ProfileSuggestion {
  eid: number;
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

export const searchHierarchy = async (query: string, offset?: number, size?: number): Promise<ApiResponse<ProfileSearchResult>> => {
    return await getRequest<ProfileSearchResult>(`/api/v1/profile/search`, { q: query, from_: offset, size: size ?? 10 });
};

export const searchSuggestHierarchy = async (query: string, size?: number): Promise<ApiResponse<ProfileSearchSuggestResponse>> => {
    return await getRequest<ProfileSearchSuggestResponse>(`/api/v1/profile/suggest`, { q: query, size });
};