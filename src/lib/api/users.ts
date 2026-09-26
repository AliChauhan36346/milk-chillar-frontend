import { api } from './api';

export interface User {
  userId: number;
  username: string;
  userType: string;
  isBlocked: boolean;
  createdAt: string;
  roleId?: number | null;
  roleName?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  buyerId?: number | null;
  buyerName?: string | null;
}

export interface PaginatedUsersResult {
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface UserQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isBlocked?: boolean;
  userType?: string;
  roleId?: number;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  roleId?: number | null;
  userType?: string;
  isBlocked?: boolean;
  employeeId?: number | null;
  supplierId?: number | null;
  buyerId?: number | null;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  roleId?: number | null;
  userType?: string;
  isBlocked?: boolean;
  employeeId?: number | null;
  supplierId?: number | null;
  buyerId?: number | null;
}

export interface Role {
  roleId: number;
  name: string;
  description?: string;
}

export interface SystemPermission {
  permissionId: number;
  name: string;
  description?: string;
}

export interface UserPermissionItem {
  userId: number;
  permissionId: number;
  permissionName?: string;
  grantedAt: string;
}

export interface UserEffectivePermissions {
  userId: number;
  username: string;
  roleId?: number | null;
  roleName?: string | null;
  rolePermissionIds: number[];
  rolePermissionNames: string[];
  directUserPermissionIds: number[];
  directUserPermissionNames: string[];
  effectivePermissionNames: string[];
}

// User CRUD operations
export const getUsers = async (params: UserQueryParams = {}): Promise<PaginatedUsersResult> => {
  const queryParams = new URLSearchParams();
  if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.isBlocked !== undefined) queryParams.append('isBlocked', params.isBlocked.toString());
  if (params.userType) queryParams.append('userType', params.userType);
  if (params.roleId) queryParams.append('roleId', params.roleId.toString());

  const response = await api.get(`/users?${queryParams.toString()}`);
  return response.data;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/all');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await api.post('/users', payload);
  return response.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<User> => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const toggleUserStatus = async (user: User): Promise<User> => {
  return await updateUser(user.userId, {
    username: user.username,
    roleId: user.roleId,
    userType: user.userType,
    isBlocked: !user.isBlocked,
    employeeId: user.employeeId,
    supplierId: user.supplierId,
    buyerId: user.buyerId,
  });
};

// Roles API
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get('/role');
  return response.data;
};

// Permissions API
export const getAllPermissions = async (): Promise<SystemPermission[]> => {
  const response = await api.get('/permission');
  return response.data;
};

export const getUserPermissions = async (userId: number): Promise<UserPermissionItem[]> => {
  const response = await api.get(`/userpermission/${userId}`);
  return response.data;
};

export const getUserEffectivePermissions = async (userId: number): Promise<UserEffectivePermissions> => {
  const response = await api.get(`/userpermission/${userId}/effective`);
  return response.data;
};

export const syncUserPermissions = async (userId: number, permissionIds: number[]): Promise<UserPermissionItem[]> => {
  const response = await api.put(`/userpermission/${userId}/sync`, permissionIds);
  return response.data;
};
