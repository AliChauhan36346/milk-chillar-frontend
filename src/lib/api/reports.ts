
// lib/api/reports.ts
import { api } from './api';

export interface DodhiDashboardStats {
  totalPurchaseLiters: number;
  totalReceivedLiters: number;
}

export interface ChillarInchargeDashboardStats {
  previousStock: number;
  totalChillarReceive: number;
  totalSales: number;
  currentStock: number;
}

export interface DashboardStatsParams {
  startDate: string;
  endDate: string;
  timeOfDay?: string;
  dodhiId: number;
  chillarId?: number;
}

export interface ChillarReportsParams {
  startDate: string;
  endDate: string;
  startTimeOfDay?: string; // morning or evening it is the start date time 
  endTimeOfDay?: string;  // morning or evening it is the end date time
  chillarId: number;
  chillarInchargeId: number;
  dodhiId?: number;
}

export interface SalesReportParams {
  startDate: string;
  endDate: string;
  buyerCode?: string;
  chillarId?: number;
}

export interface PurchaseRecord {
  purchaseId: number;
  date: string;
  timeOfDay: string;
  accountId: number;
  accountName: string;
  accountCode: string;
  expenseAccountName: string;
  dodhiName: string;
  grossLiters: number;
  rate: number;
  totalAmount: number;
  balance: number;
}

export interface ReceiveRecord {
  receiveId: number;
  date: string;
  timeOfDay: string;
  chillarName: string;
  inchargeName: string;
  dodhiName: string;
  dodhiID: number;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
}

export interface SalesRecord {
  saleId: number;
  date: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  revenueAccountName: string;
  chillarName: string;
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

export interface DodhiDashboardRecords {
  purchases: PurchaseRecord[];
  receives: ReceiveRecord[];
}

export interface DashboardRecordsParams {
  startDate: string;
  endDate: string;
  timeOfDay?: string;
  dodhiId: number;
  chillarId?: number;
}

export interface AdminDashboardStats {
  cashBalance: number;
  bankBalance: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
  dueReceipts: number;
  dueReceiptsCount: number;
  todayCashChange: number;
  todayBankChange: number;
}

export interface AccountBalanceDetail {
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  lastUpdated: string;
}

export interface AccountBalanceSummary {
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  accountCount: number;
}

export interface PagedAccountBalances {
  balances: AccountBalanceDetail[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  summary: AccountBalanceSummary;
}

// lib/api/dodhiDashboard.ts
export const fetchMyDodhiId = async (): Promise<number> => {
  try {
    const response = await api.get('/Purchase/mydodhi');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dodhi ID:', error);
    throw new Error('Failed to fetch your dodhi information');
  }
};

export const fetchDodhiDashboardStats = async (params: DashboardStatsParams): Promise<DodhiDashboardStats> => {
  try {
    const queryParams = new URLSearchParams({
      StartDate: params.startDate,
      EndDate: params.endDate,
      DodhiId: params.dodhiId.toString(),
      ...(params.timeOfDay && { TimeOfDay: params.timeOfDay }),
      ...(params.chillarId && { ChillarId: params.chillarId.toString() })
    });

    const response = await api.get(`/Reports/DodhiDashboardStats?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dodhi dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
};

export const fetchChillarInchargeDashboardStats = async (params: ChillarReportsParams): Promise<ChillarInchargeDashboardStats> => {
  try {
    const queryParams = new URLSearchParams({
      StartDate: params.startDate,
      EndDate: params.endDate,
      ChillarId: params.chillarId.toString(),
      ChillarInchargeId: params.chillarInchargeId.toString(),
      ...(params.startTimeOfDay && { StartTimeOfDay: params.startTimeOfDay }),
      ...(params.endTimeOfDay && { EndTimeOfDay: params.endTimeOfDay }),
      ...(params.dodhiId && { DodhiId: params.dodhiId.toString() })
    });

    const response = await api.get(`/Reports/ChillarInchargeDashboardStats?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chillar incharge dashboard stats:', error);
    throw new Error('Failed to fetch chillar incharge dashboard statistics');
  }
};

export const fetchDodhiDashboardRecords = async (params: DashboardRecordsParams): Promise<DodhiDashboardRecords> => {
  try {
    const queryParams = new URLSearchParams({
      StartDate: params.startDate,
      EndDate: params.endDate,
      DodhiId: params.dodhiId.toString(),
      ...(params.timeOfDay && { TimeOfDay: params.timeOfDay }),
      ...(params.chillarId && { ChillarId: params.chillarId.toString() })
    });

    const response = await api.get(`/Reports/GetDodhiPurchaseReport?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dodhi dashboard records:', error);
    throw new Error('Failed to fetch dashboard records');
  }
};

// Get chillar receive records for reports
export const getChillarReceiveRecords = async (params: ChillarReportsParams): Promise<ReceiveRecord[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add required parameters
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);
    
    // Add optional parameters if provided
    if (params.startTimeOfDay) {
      queryParams.append('StartTimeOfDay', params.startTimeOfDay);
    }
    if (params.endTimeOfDay) {
      queryParams.append('EndTimeOfDay', params.endTimeOfDay);
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }
    if (params.chillarInchargeId) {
      queryParams.append('ChillarInchargeId', params.chillarInchargeId.toString());
    }
    if (params.dodhiId) {
      queryParams.append('DodhiId', params.dodhiId.toString());
    }

    const response = await api.get(`/Reports/GetChillarReceiveRecords?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chillar receive records:', error);
    throw new Error('Failed to fetch chillar receive records');
  }
};

// NEW: Get sales report records
export const getSalesReport = async (params: SalesReportParams): Promise<SalesRecord[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add required parameters
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);
    
    // Add optional buyer code parameter if provided
    if (params.buyerCode) {
      queryParams.append('BuyerCode', params.buyerCode);
    }

    // Add optional chillarId parameter if provided
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }

    const response = await api.get(`/Reports/GetSalesReport?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sales report:', error);
    throw new Error('Failed to fetch sales report');
  }
};

// Get admin dashboard statistics
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const response = await api.get('/Reports/AdminDashboardStats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch admin dashboard stats:', error);
    throw new Error('Failed to fetch admin dashboard statistics');
  }
};

// Get account balances with pagination
export const fetchAccountBalances = async (
  accountType: 'Supplier' | 'Buyer' | 'Cash' | 'Bank',
  pageNumber: number = 1,
  pageSize: number = 25
): Promise<PagedAccountBalances> => {
  try {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    });

    const response = await api.get(`/Reports/AccountBalances/${accountType}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch account balances:', error);
    throw new Error('Failed to fetch account balances');
  }
};

// Get account balance summary
export const fetchAccountBalanceSummary = async (
  accountType: 'Supplier' | 'Buyer' | 'Cash' | 'Bank'
): Promise<AccountBalanceSummary> => {
  try {
    const response = await api.get(`/Reports/AccountBalances/${accountType}/Summary`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch account balance summary:', error);
    throw new Error('Failed to fetch account balance summary');
  }
};