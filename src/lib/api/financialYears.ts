import { api } from './api';

export interface FinancialYear {
  financialYearId: number;
  tenantId: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: number;
  closedByUsername?: string;
  closingJournalEntryId?: number;
  retainedEarningsAccountId?: number;
  retainedEarningsAccountName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: 'Active' | 'Closed' | 'Draft';
}

export interface CreateFinancialYearRequest {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  setAsActive: boolean;
  notes?: string;
}

export interface UpdateFinancialYearRequest {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface RollForwardAccountItem {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  newDebitOpening: number;
  newCreditOpening: number;
}

export interface CloseFinancialYearPreview {
  financialYearId: number;
  financialYearName: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpense: number;
  netProfitLoss: number;
  accountsToRollForwardCount: number;
  rollForwardAccounts: RollForwardAccountItem[];
}

export interface CloseFinancialYearRequest {
  retainedEarningsAccountId: number;
  nextFinancialYearId?: number;
  createNextYearIfMissing: boolean;
  nextYearName?: string;
  nextYearCode?: string;
  nextYearStartDate?: string;
  nextYearEndDate?: string;
  notes?: string;
}

export interface FinancialYearCloseResult {
  success: boolean;
  message: string;
  closedFinancialYearId: number;
  activeFinancialYearId: number;
  closingJournalEntryId?: number;
  rolledForwardBalancesCount: number;
  netProfitLoss: number;
}

export const financialYearsApi = {
  getAll: async (): Promise<FinancialYear[]> => {
    const response = await api.get<FinancialYear[]>('/financial-years');
    return response.data;
  },

  getActive: async (): Promise<FinancialYear> => {
    const response = await api.get<FinancialYear>('/financial-years/active');
    return response.data;
  },

  getById: async (id: number): Promise<FinancialYear> => {
    const response = await api.get<FinancialYear>(`/financial-years/${id}`);
    return response.data;
  },

  create: async (data: CreateFinancialYearRequest): Promise<FinancialYear> => {
    const response = await api.post<FinancialYear>('/financial-years', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFinancialYearRequest): Promise<FinancialYear> => {
    const response = await api.put<FinancialYear>(`/financial-years/${id}`, data);
    return response.data;
  },

  setActive: async (id: number): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(`/financial-years/${id}/set-active`);
    return response.data;
  },

  getClosingPreview: async (id: number): Promise<CloseFinancialYearPreview> => {
    const response = await api.get<CloseFinancialYearPreview>(`/financial-years/${id}/closing-preview`);
    return response.data;
  },

  closeFinancialYear: async (id: number, data: CloseFinancialYearRequest): Promise<FinancialYearCloseResult> => {
    const response = await api.post<FinancialYearCloseResult>(`/financial-years/${id}/close`, data);
    return response.data;
  },

  reopen: async (id: number): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/financial-years/${id}/reopen`);
    return response.data;
  }
};
