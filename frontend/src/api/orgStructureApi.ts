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

export const getOrgHierarchy = async (): Promise<ApiResponse<OrgUnitHierarchy[]>> => {
    return await getRequest<OrgUnitHierarchy[]>(`/api/v1/orgstructure/hierarchy`);
};
