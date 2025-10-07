// src/lib/api/accountLedger.ts
import { api } from './api';

export interface AccountLedger {
  journalLineId: number;
  journalEntryId: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  entryDate: string;
  referenceNo?: string;
  description?: string;
  narration?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  sourceTable?: string;
  sourceId?: number;
}

export interface AccountLedgerSummary {
  accountId: number;
  accountCode: string;
  accountName: string;
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  transactionCount: number;
  firstTransactionDate?: string;
  lastTransactionDate?: string;
}

export interface AccountLedgerPagedResponse {
  items: AccountLedger[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AccountBalance {
  accountId: number;
  balance: number;
  asOfDate: string;
}

export interface AccountLedgerQueryParams {
  accountId: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sourceTable?: string;
  pageNumber?: number;
  pageSize?: number;
  includeZeroTransactions?: boolean;
}

export interface MultipleAccountLedgerQueryParams {
  accountIds?: number[];
  accountCodePrefix?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Get ledger entries for a specific account
export const getAccountLedger = async (params: AccountLedgerQueryParams) => {
  const { accountId, ...queryParams } = params;
  const searchParams = new URLSearchParams();
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const url = `/AccountLedger/account/${accountId}?${searchParams.toString()}`;
  const response = await api.get<AccountLedgerPagedResponse>(url);
  return response.data;
};

// Get account ledger summary
export const getAccountLedgerSummary = async (
  accountId: number, 
  fromDate?: string, 
  toDate?: string
) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  
  const url = `/AccountLedger/account/${accountId}/summary?${params.toString()}`;
  const response = await api.get<AccountLedgerSummary>(url);
  return response.data;
};

// Get ledger entries for multiple accounts
export const getMultipleAccountLedger = async (params: MultipleAccountLedgerQueryParams) => {
  const searchParams = new URLSearchParams();
  
  // Handle array of account IDs
  if (params.accountIds && params.accountIds.length > 0) {
    params.accountIds.forEach(id => searchParams.append('accountIds', id.toString()));
  }
  
  // Handle other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'accountIds' && value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const url = `/AccountLedger/multiple?${searchParams.toString()}`;
  const response = await api.get<AccountLedgerPagedResponse>(url);
  return response.data;
};

// Get account balance
export const getAccountBalance = async (accountId: number, asOfDate?: string) => {
  const params = new URLSearchParams();
  if (asOfDate) params.append('asOfDate', asOfDate);
  
  const url = `/AccountLedger/account/${accountId}/balance?${params.toString()}`;
  const response = await api.get<AccountBalance>(url);
  return response.data;
};

// Get all account balances
export const getAllAccountBalances = async (accountCodePrefix?: string) => {
  const params = new URLSearchParams();
  if (accountCodePrefix) params.append('accountCodePrefix', accountCodePrefix);
  
  const url = `/AccountLedger/balances?${params.toString()}`;
  const response = await api.get<AccountLedgerSummary[]>(url);
  return response.data;
};

// Get ledger by account code prefix
export const getLedgerByCodePrefix = async (
  codePrefix: string, 
  params: Omit<MultipleAccountLedgerQueryParams, 'accountCodePrefix'> = {}
) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'accountIds' && Array.isArray(value)) {
        value.forEach(id => searchParams.append('accountIds', id.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const url = `/AccountLedger/by-code-prefix/${codePrefix}?${searchParams.toString()}`;
  const response = await api.get<AccountLedgerPagedResponse>(url);
  return response.data;
};