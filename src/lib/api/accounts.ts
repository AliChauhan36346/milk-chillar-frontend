
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

export interface SearchAccountResult {
  accountId: number;
  accountCode: string;
  name: string;
  balance: number;
  type?: string;
  accountName?: string;
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

export interface UpdateMainAccountRequest {
  tenantId: number;
  name: string;
  financialStatementComponent: string;
}

export interface UpdateSubAccountRequest {
  tenantId: number;
  mainAccountId: number;
  name: string;
}

export interface UpdateAccountRequest {
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

export const getMainAccountById = async (mainAccountId: number) => {
  const response = await api.get<MainAccount>(`/accounts/main/${mainAccountId}`);
  return response.data;
};

export const updateMainAccount = async (mainAccountId: number, data: UpdateMainAccountRequest) => {
  const response = await api.put(`/accounts/main/${mainAccountId}`, data);
  return response.data;
};

export const deleteMainAccount = async (mainAccountId: number) => {
  const response = await api.delete(`/accounts/main/${mainAccountId}`);
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

export const getSubAccountsByMainCode = async (tenantId: number, mainAccountCode: string) => {
  const response = await api.get<SubAccount[]>(`/accounts/sub/by-main-code?tenantId=${tenantId}&mainAccountCode=${mainAccountCode}`);
  return response.data;
};

export const getSubAccountById = async (subAccountId: number) => {
  const response = await api.get<SubAccount>(`/accounts/sub/${subAccountId}`);
  return response.data;
};

export const updateSubAccount = async (subAccountId: number, data: UpdateSubAccountRequest) => {
  const response = await api.put(`/accounts/sub/${subAccountId}`, data);
  return response.data;
};

export const deleteSubAccount = async (subAccountId: number) => {
  const response = await api.delete(`/accounts/sub/${subAccountId}`);
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

export const getAccountById = async (accountId: number) => {
  const response = await api.get<Account>(`/accounts/${accountId}`);
  return response.data;
};

export const updateAccount = async (accountId: number, data: UpdateAccountRequest) => {
  const response = await api.put(`/accounts/${accountId}`, data);
  return response.data;
};

export const deleteAccount = async (accountId: number) => {
  const response = await api.delete(`/Accounts/${accountId}`);
  return response.data;
};

// Search accounts
export const searchAccounts = async (query: string, mainAccountCode?: string, tenantId?: number) => {
  try {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('query', query);
    if (mainAccountCode) queryParams.append('mainAccountCode', mainAccountCode);
    if (tenantId) queryParams.append('tenantId', tenantId.toString());

    const response = await api.get<SearchAccountResult[]>(`/Accounts/search?${queryParams}`);
    return response.data;
  } catch (error: any) {
    console.error('Error searching accounts:', error?.response?.data || error?.message || error);
    throw new Error(error?.response?.data?.message || 'Failed to search accounts');
  }
};

// NEW: Get accounts by code prefix (first 3 digits)
export const getAccountsByCodePrefix = async (codePrefix: string) => {
  try {
    if (!codePrefix || codePrefix.trim().length === 0) {
      throw new Error('Code prefix is required');
    }

    const trimmedPrefix = codePrefix.trim();
    if (trimmedPrefix.length !== 3) {
      throw new Error('Code prefix must be exactly 3 digits');
    }

    const response = await api.get<SearchAccountResult[]>(`/Accounts/by-code-prefix?codePrefix=${trimmedPrefix}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting accounts by code prefix:', error?.response?.data || error?.message || error);
    throw new Error(error?.response?.data?.message || 'Failed to get accounts by code prefix');
  }
};

// Utility function to get accounts by financial statement component
export const getAccountsByComponent = async (component: 'assets' | 'liabilities' | 'equity' | 'revenue' | 'expenses') => {
  try {
    const componentPrefixes = {
      assets: '100',
      liabilities: '200',
      equity: '300',
      revenue: '400',
      expenses: '500'
    };

    const prefix = componentPrefixes[component];
    if (!prefix) {
      throw new Error('Invalid financial statement component');
    }

    return await getAccountsByCodePrefix(prefix);
  } catch (error: any) {
    console.error(`Error getting ${component} accounts:`, error?.response?.data || error?.message || error);
    throw new Error(error?.response?.data?.message || `Failed to get ${component} accounts`);
  }
};

// Export all account-related functions
export const accountsApi = {
  // Main accounts
  createMainAccount,
  getMainAccounts,
  getMainAccountById,
  updateMainAccount,
  deleteMainAccount,

  // Sub accounts
  createSubAccount,
  getSubAccounts,
  getSubAccountsByMainCode,
  getSubAccountById,
  updateSubAccount,
  deleteSubAccount,

  // Accounts
  createAccount,
  getAccounts,
  getChartOfAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,

  // Search and filtering
  searchAccounts,
  getAccountsByCodePrefix,
  getAccountsByComponent
};