// src/lib/api/parchi.ts
import { api } from './api';

export interface ParchiDto {
  accountCode: string;
  accountName: string;
  khataNumber: string;
  dodhiId?: number;
  dodhiName?: string;
  
  // Previous Balance (before period)
  previousBalance: number;
  previousBalanceType: string; // "Debit" or "Credit"
  
  // Period Transactions
  totalLiters: number;
  purchaseAmount: number;
  paymentsInPeriod: number;
  receiptsInPeriod: number;
  
  // Closing Balance
  closingBalance: number;
  closingBalanceType: string;
  
  // Credit Logic
  creditLimit: number;
  isCreditAllowed: boolean;
  parchiAmount: number;
  finalBalance: number;
  finalBalanceType: string;
}

export interface ParchiSummary {
  totalLiters: number;
  totalPurchaseAmount: number;
  totalPayments: number;
  totalParchiAmount: number;
}

export interface ParchiResult {
  items: ParchiDto[];
  summary: ParchiSummary;
  totalCount: number;
}

export interface ParchiQueryParams {
  startDate: string;
  endDate: string;
  dodhiId?: number;
  supplierId?: number;
  search?: string;
  isActive?: boolean;
}

// Get parchi for multiple suppliers
export const getSupplierParchi = async (params: ParchiQueryParams): Promise<ParchiResult> => {
  const queryParams = new URLSearchParams();
  queryParams.append('StartDate', params.startDate);
  queryParams.append('EndDate', params.endDate);
  
  if (params.dodhiId) queryParams.append('DodhiId', params.dodhiId.toString());
  if (params.supplierId) queryParams.append('SupplierId', params.supplierId.toString());
  if (params.search) queryParams.append('Search', params.search);
  if (params.isActive !== undefined) queryParams.append('IsActive', params.isActive.toString());
  
  const resp = await api.get<ParchiResult>(`/Parchi/suppliers?${queryParams.toString()}`);
  return resp.data;
};

// Get parchi for single supplier
export const getSingleSupplierParchi = async (
  supplierId: number, 
  startDate: string, 
  endDate: string
): Promise<ParchiDto> => {
  const resp = await api.get<ParchiDto>(
    `/Parchi/suppliers/${supplierId}?startDate=${startDate}&endDate=${endDate}`
  );
  return resp.data;
};