import type { ApiResponse } from './api';
import { deleteRequest, getRequest, postRequest, putRequest } from './api';

export interface RoleSchema {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export interface RoleCreateSchema {
    name: string;
    description?: string | null;
}

export interface RoleUpdateSchema {
    description?: string | null;
}

export interface PermissionSchema {
    id: number;
    name: string;
    resource: string;
    action: string;
    description?: string | null;
}

export interface PermissionCreateSchema {
    name: string;
    resource: string;
    action: string;
    description?: string | null;
}

export interface UserRolesResponseSchema {
    user_eid: string;
    roles: RoleSchema[];
}

export interface RoleWithPermissionsSchema extends RoleSchema {
    permissions: PermissionSchema[];
}

export interface CuratorScopeSchema {
    id: number;
    curator_eid: string;
    org_unit_id: number;
}

export interface CuratorScopeWithOrgUnitSchema extends CuratorScopeSchema {
    org_unit_name?: string;
}

export interface RBACUserDetailSchema {
    user_eid: string;
    roles: RoleWithPermissionsSchema[];
    curator_scopes: CuratorScopeWithOrgUnitSchema[];
    all_permissions: string[];
}

export const getRoles = async (): Promise<ApiResponse<RoleSchema[]>> => {
    return await getRequest<RoleSchema[]>('/api/v1/rbac/roles');
};

export const getRoleById = async (roleId: number): Promise<ApiResponse<RoleSchema>> => {
    return await getRequest<RoleSchema>(`/api/v1/rbac/roles/${roleId}`);
};

export const createRole = async (data: RoleCreateSchema): Promise<ApiResponse<RoleSchema>> => {
    return await postRequest<RoleSchema>('/api/v1/rbac/roles', data);
};

export const updateRole = async (roleId: number, data: RoleUpdateSchema): Promise<ApiResponse<RoleSchema>> => {
    return await putRequest<RoleSchema>(`/api/v1/rbac/roles/${roleId}`, data);
};

export const deleteRole = async (roleId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/roles/${roleId}`);
};

export const getPermissions = async (): Promise<ApiResponse<PermissionSchema[]>> => {
    return await getRequest<PermissionSchema[]>('/api/v1/rbac/permissions');
};

export const getPermissionsByResource = async (resource: string): Promise<ApiResponse<PermissionSchema[]>> => {
    return await getRequest<PermissionSchema[]>(`/api/v1/rbac/permissions/resource/${encodeURIComponent(resource)}`);
};

export const createPermission = async (data: PermissionCreateSchema): Promise<ApiResponse<PermissionSchema>> => {
    return await postRequest<PermissionSchema>('/api/v1/rbac/permissions', data);
};

export const deletePermission = async (permissionId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/permissions/${permissionId}`);
};

export const getRolePermissions = async (roleId: number): Promise<ApiResponse<PermissionSchema[]>> => {
    return await getRequest<PermissionSchema[]>(`/api/v1/rbac/roles/${roleId}/permissions`);
};

export const addPermissionToRole = async (roleId: number, permissionId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/rbac/roles/${roleId}/permissions/${permissionId}`);
};

export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/roles/${roleId}/permissions/${permissionId}`);
};

export const getUserRoles = async (userEid: string): Promise<ApiResponse<UserRolesResponseSchema>> => {
    return await getRequest<UserRolesResponseSchema>(`/api/v1/rbac/users/${encodeURIComponent(userEid)}/roles`);
};

export const assignRoleToUser = async (userEid: string, roleId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/rbac/users/${encodeURIComponent(userEid)}/roles/${roleId}`);
};

export const removeRoleFromUser = async (userEid: string, roleId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/users/${encodeURIComponent(userEid)}/roles/${roleId}`);
};

export const removeAllRolesFromUser = async (userEid: string): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/users/${encodeURIComponent(userEid)}/roles`);
};

export const getCuratorScopes = async (curatorEid: string): Promise<ApiResponse<CuratorScopeSchema[]>> => {
    return await getRequest<CuratorScopeSchema[]>(`/api/v1/rbac/curators/${encodeURIComponent(curatorEid)}/scopes`);
};

export const addCuratorScope = async (curatorEid: string, orgUnitId: number): Promise<ApiResponse<any>> => {
    return await postRequest<any>(`/api/v1/rbac/curators/${encodeURIComponent(curatorEid)}/scopes/${orgUnitId}`);
};

export const removeCuratorScope = async (curatorEid: string, orgUnitId: number): Promise<ApiResponse<any>> => {
    return await deleteRequest<any>(`/api/v1/rbac/curators/${encodeURIComponent(curatorEid)}/scopes/${orgUnitId}`);
};

export const getUserRBACDetail = async (userEid: string): Promise<ApiResponse<RBACUserDetailSchema>> => {
    return await getRequest<RBACUserDetailSchema>(`/api/v1/rbac/users/${encodeURIComponent(userEid)}/detail`);
};

export const initializeRBAC = async (): Promise<ApiResponse<{ message: string }>> => {
    return await postRequest<{ message: string }>('/api/v1/rbac/initialize');
};
