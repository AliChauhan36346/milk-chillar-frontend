// src/lib/api/roznamcha.ts
import { api } from './api';
import { getAccountsByCodePrefix } from './accounts';

// ============================================
// INTERFACES
// ============================================

export interface RoznamchaFilterRequest {
  startDate?: string;
  endDate?: string;
  viewType?: 'ALL' | 'CASH' | 'BANK';
  cashAccountId?: number;
  bankAccountId?: number;
  transactionType?: 'PAYMENT' | 'RECEIPT' | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionLineDto {
  accountCode: string;
  accountName: string;
  description?: string;
  amount: number;
}

export interface RoznamchaEntryDto {
  id: number;
  date: string;
  voucherType: 'CASH_PAYMENT' | 'CASH_RECEIPT' | 'BANK_PAYMENT' | 'BANK_RECEIPT';
  voucherNo: string;
  jobDescription?: string;
  cashOrBankAccount: string;
  cashOrBankAccountId: number;
  payeeOrRecipient: string;
  amount: number;
  chequeNo?: string;
  chequeDate?: string;
  remarks?: string;
  createdBy?: string;
  createdAt: string;
  lines: TransactionLineDto[];
}

export interface RoznamchaSummaryDto {
  totalPayments: number;
  totalReceipts: number;
  netAmount: number;
  totalTransactions: number;
  cashPayments: number;
  cashReceipts: number;
  bankPayments: number;
  bankReceipts: number;
}

export interface PaginationDto {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RoznamchaResponse {
  entries: RoznamchaEntryDto[];
  summary: RoznamchaSummaryDto;
  pagination: PaginationDto;
}

export interface RoznamchaSummaryResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: RoznamchaSummaryDto;
}

export interface DayBookEntryDto {
  date: string;
  totalPayments: number;
  totalReceipts: number;
  net: number;
  transactionCount: number;
  cashPayments: number;
  cashReceipts: number;
  bankPayments: number;
  bankReceipts: number;
}

export interface DayBookResponse {
  entries: DayBookEntryDto[];
}

export interface AccountOptionDto {
  accountId: number;
  accountName: string;
  accountCode: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all Roznamcha entries
 */
export const getRoznamcha = async (params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: RoznamchaResponse }>(
    `/Roznamcha?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Roznamcha summary only
 */
export const getRoznamchaSummary = async (params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: RoznamchaSummaryResponse }>(
    `/Roznamcha/summary?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Roznamcha by specific account
 */
export const getRoznamchaByAccount = async (accountId: number, params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: RoznamchaResponse }>(
    `/Roznamcha/by-account/${accountId}?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Cash Book
 */
export const getCashBook = async (params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: RoznamchaResponse }>(
    `/Roznamcha/cashbook?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Bank Book
 */
export const getBankBook = async (bankAccountId: number | null, params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  if (bankAccountId) {
    queryParams.append('bankAccountId', bankAccountId.toString());
  }
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: RoznamchaResponse }>(
    `/Roznamcha/bankbook?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Day Book
 */
export const getDayBook = async (params: RoznamchaFilterRequest) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: DayBookResponse }>(
    `/Roznamcha/daybook?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Get Cash Accounts (using code prefix 110)
 */
export const getCashAccounts = async () => {
  return await getAccountsByCodePrefix('110');
};

/**
 * Get Bank Accounts (using code prefix 120)
 */
export const getBankAccounts = async () => {
  return await getAccountsByCodePrefix('120');
};

/**
 * Export Roznamcha
 */
export const exportRoznamcha = async (params: RoznamchaFilterRequest, format: 'excel' | 'pdf' = 'excel') => {
  const queryParams = new URLSearchParams();
  queryParams.append('format', format);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get(
    `/Roznamcha/export?${queryParams.toString()}`,
    {
      responseType: 'blob',
    }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Roznamcha_${new Date().getTime()}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};