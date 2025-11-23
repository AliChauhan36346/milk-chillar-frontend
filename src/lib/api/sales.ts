// src/lib/api/sales.ts
import { api } from './api';

export interface SalesAccount {
  accountId: number;
  accountName: string;
  accountCode: string;
  rate: number; // Add rate property
}

export interface RevenueAccount {
  accountId: number;
  accountName: string;
  accountCode: string;
}


export interface SaleDto {
  saleId: number;
  date: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  revenueAccountId: number;
  revenueAccountName: string;
  chillarId: number;
  chillarName: string;
  addedById: number;
  addedByName: string;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
  rate: number;
  totalAmount: number;
  amountReceived: number;
  balance: number;
}

export interface SalesMetadata {
  chillarId: number;
  remainingAccounts: SalesAccount[];
  addedSales: SaleDto[];
  revenueAccounts: RevenueAccount[]; // Add revenueAccounts property
}

export interface CreateSaleRequest {
  date: string;
  accountId: number;
  revenueAccountId: number;
  chillarId: number;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
  rate: number;
  amountReceived: number;
}

// Get metadata (remaining + added) for a given date
export const getSalesMetadata = async (date: string) => {
  const resp = await api.get<SalesMetadata>(`/Sales/metadata?date=${date}`);
  return resp.data;
};

// Create a new sale entry
export const createSale = async (data: CreateSaleRequest) => {
  const resp = await api.post<SaleDto>('/Sales', data);
  return resp.data;
};

// Update an existing sale
export const updateSale = async (id: number, data: CreateSaleRequest) => {
  const resp = await api.put<SaleDto>(`/Sales/${id}`, data);
  return resp.data;
};

// Get sale by ID
export const getSaleById = async (id: number) => {
  const resp = await api.get<SaleDto>(`/Sales/${id}`);
  return resp.data;
};

export const deleteSale = async (id: number): Promise<void> => {
  await api.delete(`/Sales/${id}`);
};
