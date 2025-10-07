import { api } from './api';

export interface OpeningBalance {
  openingBalanceId: number;
  accountId: number;
  openingDate: string;
  debitOpening: number;
  creditOpening: number;
  description: string;
  addedBy: number;
  journalEntryId: number;
  createdAt: string;
  accountCode: string;
  accountName: string;
  accountFullCode: string;
  addedByUsername: string;
  journalDescription: string;
  netBalance: number;
  balanceType: 'Debit' | 'Credit';
  absoluteBalance: number;
}

export interface OpeningBalanceCreateUpdate {
  accountId: number;
  openingDate: string;
  debitOpening: number;
  creditOpening: number;
  description: string;
}

export interface OpeningBalanceFilters {
  search?: string;
  accountId?: number;
  hasDebitBalance?: boolean;
  hasCreditBalance?: boolean;
  minAmount?: number;
  maxAmount?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface OpeningBalanceResponse {
  items: OpeningBalance[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const handleApiError = (error: any, defaultMessage: string) => {
  console.error('API Error:', error?.response?.data || error?.message || error);
  throw new Error(error?.response?.data?.message || defaultMessage);
};

export const openingBalancesApi = {
  getOpeningBalances: async (filters: OpeningBalanceFilters) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('Search', filters.search);
      if (filters.accountId) queryParams.append('AccountId', filters.accountId.toString());
      if (filters.hasDebitBalance !== undefined) queryParams.append('HasDebitBalance', filters.hasDebitBalance.toString());
      if (filters.hasCreditBalance !== undefined) queryParams.append('HasCreditBalance', filters.hasCreditBalance.toString());
      if (filters.minAmount !== undefined) queryParams.append('MinAmount', filters.minAmount.toString());
      if (filters.maxAmount !== undefined) queryParams.append('MaxAmount', filters.maxAmount.toString());
      if (filters.pageNumber) queryParams.append('PageNumber', filters.pageNumber.toString());
      if (filters.pageSize) queryParams.append('PageSize', filters.pageSize.toString());

      const response = await api.get<OpeningBalanceResponse>(`/AccountOpeningBalances/paged?${queryParams}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch opening balances');
    }
  },

  getOpeningBalanceById: async (id: number) => {
    try {
      const response = await api.get<OpeningBalance>(`/AccountOpeningBalances/${id}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch opening balance');
    }
  },

  getOpeningBalanceByAccount: async (accountId: number) => {
    try {
      const response = await api.get<OpeningBalance>(`/AccountOpeningBalances/by-account/${accountId}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to fetch account opening balance');
    }
  },

  createOpeningBalance: async (data: OpeningBalanceCreateUpdate) => {
    try {
      const response = await api.post<OpeningBalance>('/AccountOpeningBalances', data);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to create opening balance');
    }
  },

  updateOpeningBalance: async (id: number, data: OpeningBalanceCreateUpdate) => {
    try {
      const response = await api.put<OpeningBalance>(`/AccountOpeningBalances/${id}`, data);
      return response.data;
    } catch (error: any) {
      handleApiError(error, 'Failed to update opening balance');
    }
  },

  deleteOpeningBalance: async (id: number) => {
    try {
      const response = await api.delete(`/AccountOpeningBalances/${id}`);
      // Return a success message or the response data
      return response.data;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Delete Error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      if (error?.response?.status === 404) {
        throw new Error('Opening balance not found');
      } else if (error?.response?.status === 400) {
        throw new Error(error?.response?.data?.message || 'Invalid request');
      } else {
        handleApiError(error, 'Failed to delete opening balance');
      }
    }
  }
};