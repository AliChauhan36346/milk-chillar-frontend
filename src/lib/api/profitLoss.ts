// src/lib/api/profitLoss.ts
import { api } from './api';

// ============================================
// INTERFACES
// ============================================

export interface PeriodDto {
  startDate: string;
  endDate: string;
  displayText: string;
}

export interface AccountBreakdownDto {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface IncomeDto {
  salesRevenue: number;
  salesReturns: number;
  netSales: number;
  otherIncome: number;
  totalIncome: number;
  details: AccountBreakdownDto[];
}

export interface CogsDto {
  openingStock: number;
  purchases: number;
  purchaseReturns: number;
  directExpenses: number;
  closingStock: number;
  totalCogs: number;
  details: AccountBreakdownDto[];
}

export interface OperatingExpensesDto {
  salaries: number;
  rent: number;
  utilities: number;
  transportation: number;
  marketing: number;
  officeExpenses: number;
  depreciation: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  details: AccountBreakdownDto[];
}

export interface FinancialExpensesDto {
  interestExpense: number;
  bankCharges: number;
  otherFinancialExpenses: number;
  totalFinancialExpenses: number;
  details: AccountBreakdownDto[];
}

export interface ProfitLossResponse {
  period: PeriodDto;
  income: IncomeDto;
  cogs: CogsDto;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: OperatingExpensesDto;
  financialExpenses: FinancialExpensesDto;
  totalExpenses: number;
  netProfit: number;
  netProfitMargin: number;
}

export interface ComparisonDto {
  revenueChange: number;
  revenueChangePercentage: number;
  expenseChange: number;
  expenseChangePercentage: number;
  netProfitChange: number;
  netProfitChangePercentage: number;
}

export interface ProfitLossComparativeResponse {
  period1: ProfitLossResponse;
  period2: ProfitLossResponse;
  comparison: ComparisonDto;
}

export interface ExpenseCategoryDto {
  categoryName: string;
  amount: number;
  percentage: number;
  accounts: AccountBreakdownDto[];
}

export interface ExpenseBreakdownResponse {
  period: PeriodDto;
  categories: ExpenseCategoryDto[];
  totalExpenses: number;
}

export interface IncomeCategoryDto {
  categoryName: string;
  amount: number;
  percentage: number;
  accounts: AccountBreakdownDto[];
}

export interface IncomeBreakdownResponse {
  period: PeriodDto;
  categories: IncomeCategoryDto[];
  totalIncome: number;
}

export interface ProfitLossFilterRequest {
  startDate: string;
  endDate: string;
  format?: 'json' | 'pdf' | 'excel';
}

export interface ComparativeProfitLossRequest {
  period1StartDate: string;
  period1EndDate: string;
  period2StartDate: string;
  period2EndDate: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Profit & Loss Report
 */
export const getProfitLossReport = async (params: ProfitLossFilterRequest) => {
  const { startDate, endDate, format = 'json' } = params;
  const response = await api.get<{ success: boolean; data: ProfitLossResponse }>(
    `/reports/ProfitLoss?StartDate=${startDate}&EndDate=${endDate}&Format=${format}`
  );
  return response.data.data;
};

/**
 * Get Comparative Profit & Loss Report
 */
export const getComparativeProfitLoss = async (params: ComparativeProfitLossRequest) => {
  const { period1StartDate, period1EndDate, period2StartDate, period2EndDate } = params;
  const response = await api.get<{ success: boolean; data: ProfitLossComparativeResponse }>(
    `/reports/ProfitLoss/comparative?Period1StartDate=${period1StartDate}&Period1EndDate=${period1EndDate}&Period2StartDate=${period2StartDate}&Period2EndDate=${period2EndDate}`
  );
  return response.data.data;
};

/**
 * Get Expense Breakdown
 */
export const getExpenseBreakdown = async (params: ProfitLossFilterRequest) => {
  const { startDate, endDate } = params;
  const response = await api.get<{ success: boolean; data: ExpenseBreakdownResponse }>(
    `/reports/ProfitLoss/expenses?StartDate=${startDate}&EndDate=${endDate}`
  );
  return response.data.data;
};

/**
 * Get Income Breakdown
 */
export const getIncomeBreakdown = async (params: ProfitLossFilterRequest) => {
  const { startDate, endDate } = params;
  const response = await api.get<{ success: boolean; data: IncomeBreakdownResponse }>(
    `/reports/ProfitLoss/income?StartDate=${startDate}&EndDate=${endDate}`
  );
  return response.data.data;
};

/**
 * Get Financial Summary (Quick view for dashboard)
 */
export const getFinancialSummary = async (params: ProfitLossFilterRequest) => {
  const { startDate, endDate } = params;
  const response = await api.get<{
    success: boolean;
    data: {
      period: PeriodDto;
      totalRevenue: number;
      totalExpenses: number;
      grossProfit: number;
      netProfit: number;
      netProfitMargin: number;
      grossProfitMargin: number;
    };
  }>(`/reports/ProfitLoss/summary?StartDate=${startDate}&EndDate=${endDate}`);
  return response.data.data;
};

/**
 * Export Profit & Loss Report
 */
export const exportProfitLoss = async (params: ProfitLossFilterRequest) => {
  const { startDate, endDate, format = 'excel' } = params;
  const response = await api.get(
    `/reports/ProfitLoss/export?StartDate=${startDate}&EndDate=${endDate}&Format=${format}`,
    {
      responseType: 'blob',
    }
  );
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ProfitLoss_${startDate}_${endDate}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};