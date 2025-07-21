import { api } from './api';

export interface Supplier {
  supplierId: number;
  accountId: number;
  fullName: string;
  rate: number;
  khataNumber: string;
  creditLimit: number;
  dodhiId: number;
  dodhiName: string;
  accountCode: string;
  accountName: string;
  address: string;
  giveCreditOnParchi: boolean;
  isActive: boolean;
}

export interface SupplierPagedResponse {
  items: Supplier[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateSupplierRequest {
  accountId: number;
  fullName: string;
  rate: number;
  khataNumber: string;
  creditLimit: number;
  dodhiId: number;
  address: string;
  giveCreditOnParchi: boolean;
  isActive: boolean;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  supplierId: number;
}

// Get all suppliers (not paged)
export const getSuppliers = async () => {
  const response = await api.get<Supplier[]>(`/Suppliers/all`);
  return response.data;
};

// Get paged suppliers
export const getSuppliersPaged = async (params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  mainAccountCode?: string;
}) => {
  const { pageNumber = 1, pageSize = 10, search = '', isActive, mainAccountCode } = params;
  let url = `/Suppliers/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (isActive !== undefined) url += `&isActive=${isActive}`;
  if (mainAccountCode) url += `&mainAccountCode=${mainAccountCode}`;
  const response = await api.get<SupplierPagedResponse>(url);
  return response.data;
};

// Get single supplier by ID
export const getSupplierById = async (id: number) => {
  const response = await api.get<Supplier>(`/Suppliers/${id}`);
  return response.data;
};

// Create supplier
export const createSupplier = async (data: CreateSupplierRequest) => {
  const response = await api.post('/Suppliers', data);
  return response.data;
};

// Update supplier
export const updateSupplier = async (id: number, data: CreateSupplierRequest) => {
  const response = await api.put(`/Suppliers/${id}`, data);
  return response.data;
};

// Delete supplier
export const deleteSupplier = async (id: number) => {
  const response = await api.delete(`/Suppliers/${id}`);
  return response.data;
}; 