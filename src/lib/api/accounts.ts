import { api } from './api';

export interface MainAccount {
  mainAccountId: number;
  mainAccountCode: string;
  name: string;
  financialStatementComponent: string;
}

export interface SubAccount {
  subAccountId: number;
  subAccountCode: string;
  name: string;
  mainAccountId: number;
}

export interface Account {
  accountId: number;
  accountCode: string;
  fullCode: string;
  name: string;
  subAccountId: number;
}

export interface CreateMainAccountRequest {
  tenantId: number;
  name: string;
  financialStatementComponent: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
}

export interface CreateSubAccountRequest {
  tenantId: number;
  mainAccountId: number;
  name: string;
}

export interface CreateAccountRequest {
  tenantId: number;
  subAccountId: number;
  name: string;
}

export interface ChartAccount {
  mainAccountId: number;
  mainAccountCode: string;
  name: string;
  financialStatementComponent: string;
  subAccounts: {
    subAccountId: number;
    subAccountCode: string;
    name: string;
    accounts: {
      accountId: number;
      accountCode: string;
      fullCode: string;
      name: string;
    }[];
  }[];
}

// Main Accounts API
export const createMainAccount = async (data: CreateMainAccountRequest) => {
  const response = await api.post('/accounts/main', data);
  return response.data;
};

export const getMainAccounts = async (tenantId: number) => {
  const response = await api.get<MainAccount[]>(`/accounts/main?tenantId=${tenantId}`);
  return response.data;
};

// Sub Accounts API
export const createSubAccount = async (data: CreateSubAccountRequest) => {
  const response = await api.post('/accounts/sub', data);
  return response.data;
};

export const getSubAccounts = async (tenantId: number, mainAccountId: number) => {
  const response = await api.get<SubAccount[]>(`/accounts/sub?tenantId=${tenantId}&mainAccountId=${mainAccountId}`);
  return response.data;
};

// Accounts API
export const createAccount = async (data: CreateAccountRequest) => {
  const response = await api.post('/accounts', data);
  return response.data;
};

export const getAccounts = async (tenantId: number, subAccountId: number) => {
  const response = await api.get<Account[]>(`/accounts?tenantId=${tenantId}&subAccountId=${subAccountId}`);
  return response.data;
};

export const getChartOfAccounts = async (tenantId: number) => {
  const response = await api.get<ChartAccount[]>(`/accounts/chart?tenantId=${tenantId}`);
  return response.data;
}; 