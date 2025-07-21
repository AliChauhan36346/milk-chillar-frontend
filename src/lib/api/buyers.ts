import { api } from './api';

export interface Buyer {
  buyerId: number;
  tenantId: number;
  accountId: number;
  rate: number;
  khataNumber: string;
  creditLimit: number;
  address: string;
  isActive: boolean;
  accountCode: string;
  accountName: string;
}

export interface BuyerPagedResponse {
  items: Buyer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateBuyerRequest {
  accountId: number;
  rate: number;
  khataNumber: string;
  creditLimit: number;
  address: string;
  isActive: boolean;
  tenantId?: number;
}

export interface UpdateBuyerRequest extends CreateBuyerRequest {
  buyerId: number;
}

// Get all buyers (not paged)
export const getBuyers = async (tenantId: number) => {
  const response = await api.get<Buyer[]>(`/Buyers/all?tenantId=${tenantId}`);
  return response.data;
};

// Get paged buyers
export const getBuyersPaged = async (params: {
  tenantId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}) => {
  const { tenantId, pageNumber = 1, pageSize = 10, search = '', isActive } = params;
  let url = `/Buyers/paged?tenantId=${tenantId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (isActive !== undefined) url += `&isActive=${isActive}`;
  const response = await api.get<BuyerPagedResponse>(url);
  return response.data;
};

// Get single buyer by ID
export const getBuyerById = async (id: number) => {
  const response = await api.get<Buyer>(`/Buyers/${id}`);
  return response.data;
};

// Create buyer
export const createBuyer = async (data: CreateBuyerRequest) => {
  const response = await api.post('/Buyers', data);
  return response.data;
};

// Update buyer
export const updateBuyer = async (id: number, data: CreateBuyerRequest) => {
  const response = await api.put(`/Buyers/${id}`, data);
  return response.data;
};

// Delete buyer
export const deleteBuyer = async (id: number) => {
  const response = await api.delete(`/Buyers/${id}`);
  return response.data;
};