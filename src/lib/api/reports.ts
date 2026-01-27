
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

// Add these interfaces (already provided, but including for completeness)
export interface PurchaseReportQuery {
  startDate: string;
  endDate: string;
  timeOfDay?: 'morning' | 'evening';
  dodhiId?: number;
  chillarId?: number;
  supplierCode?: string;

  pageNumber?: number;
  pageSize?: number;
}

export interface PurchaseDetail {
  purchaseId: number;
  accountId: number;
  date: string;
  timeOfDay: string;
  accountCode: string;
  accountName: string;
  expenseAccountName: string;
  dodhiName: string;
  dodhiId: number;
  chillarName: string;
  grossLiters: number;
  rate: number;
  totalAmount: number;
  balance: number;
}

export interface PagedPurchaseReport {
  paginatedPurchases: {
    items: PurchaseDetail[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}



export interface PurchaseReportSummary {
  totalLiters: number;
  totalAmount: number;
  averageRate: number;
  totalTransactions: number;
  totalSuppliers: number;
}

export interface DetailedPurchaseReport {
  purchases: PurchaseDetail[];
  summary: PurchaseReportSummary;
}

export interface SupplierPurchaseSummary {
  accountId: number;
  accountCode: string;
  accountName: string;
  totalLiters: number;
  totalAmount: number;
  averageRate: number;
  transactionCount: number;
  balance: number;
}

export interface SupplierWisePurchaseReport {
  supplierSummaries: SupplierPurchaseSummary[];
  overallSummary: PurchaseReportSummary;
}


export interface BuyerWiseSalesReportQuery {
  startDate: string;
  endDate: string;
  accountId?: number;
  chillarId?: number;
}

export interface BuyerSalesSummary {
  accountId: number;
  accountCode: string;
  accountName: string;
  totalGrossLiters: number;
  totalNetLiters: number;
  totalAmount: number;
  totalAmountReceived: number;
  averageRate: number;
  averageLR: number;
  averageFat: number;
  transactionCount: number;
  balance: number;
}

export interface SalesReportSummary {
  totalGrossLiters: number;
  totalNetLiters: number;
  totalAmount: number;
  totalAmountReceived: number;
  totalBalance: number;
  averageRate: number;
  averageLR: number;
  averageFat: number;
  totalTransactions: number;
  totalBuyers: number;
}

export interface DailyTotalsDto {
  date: string;
  totalPurchaseLiters: number;
  totalPurchaseAmount: number;
  totalChillarReceiveLiters: number;
  dodhiLoss: number;
  totalSalesLiters: number;
  chillarLoss: number;
  tsSalesLiters: number;
  tsDifference: number;
  salesAmount: number;
  grossProfit: number;
}


export interface BuyerWiseSalesReport {
  buyerSummaries: BuyerSalesSummary[];
  overallSummary: SalesReportSummary;
}

export interface OverallDodhiSummaryDto {
  totalPurchasedLiters: number;
  totalPurchaseAmount: number;
  averagePurchaseRate: number;
  totalPurchaseTransactions: number;
  totalReceivedLiters: number;
  totalNetLiters: number;
  totalReceptionLoss: number;
  overallReceptionLossPercentage: number;
  totalReceiveTransactions: number;
  totalPurchaseReceiveDifference: number;
  totalDodhis: number;
}

export interface SingleDodhiSummaryDto {
  dodhiId: number;
  dodhiName: string;
  chillarId: number;
  chillarName: string;
  totalPurchasedLiters: number;
  totalPurchaseAmount: number;
  averagePurchaseRate: number;
  purchaseTransactionCount: number;
  totalReceivedLiters: number;
  totalNetLiters: number;
  receptionLoss: number;
  receptionLossPercentage: number;
  receiveTransactionCount: number;
  purchaseReceiveDifference: number;
  purchaseReceiveDifferencePercentage: number;
}

export interface DodhiSummaryQuery {
  startDate: string;
  endDate: string;
  startTimeOfDay?: string;
  endTimeOfDay?: string;
  chillarId?: number;
}

export const getDailyTotalsReport = async (
  startDate: string,
  endDate: string,
  chillarId: number = 0
): Promise<DailyTotalsDto[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("startDate", startDate);
    queryParams.append("endDate", endDate);
    queryParams.append("chillarId", chillarId.toString());

    const response = await api.get(`/Reports/DailyTotals?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch daily totals report:", error);
    throw new Error("Failed to fetch daily totals report");
  }
};



// Add these API functions at the bottom of the file
export const getDetailedPurchaseReport = async (
  params: PurchaseReportQuery
): Promise<PagedPurchaseReport> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);

    if (params.timeOfDay) {
      queryParams.append('TimeOfDay', params.timeOfDay);
    }
    if (params.dodhiId) {
      queryParams.append('DodhiId', params.dodhiId.toString());
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }
    if (params.supplierCode) {
      queryParams.append('SupplierCode', params.supplierCode);
    }
    if (params.pageNumber) {
      queryParams.append('PageNumber', params.pageNumber.toString());
    }
    if (params.pageSize) {
      queryParams.append('PageSize', params.pageSize.toString());
    }

    const response = await api.get(`/Reports/GetDetailedPurchaseReport?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch detailed purchase report:', error);
    throw new Error('Failed to fetch detailed purchase report');
  }
};

export const getPurchaseReportSummary = async (
  params: PurchaseReportQuery
): Promise<PurchaseReportSummary> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);

    if (params.timeOfDay) {
      queryParams.append('TimeOfDay', params.timeOfDay);
    }
    if (params.dodhiId) {
      queryParams.append('DodhiId', params.dodhiId.toString());
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }
    if (params.supplierCode) {
      queryParams.append('SupplierCode', params.supplierCode);
    }

    const response = await api.get(`/Reports/GetPurchaseReportSummary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch purchase report summary:', error);
    throw new Error('Failed to fetch purchase report summary');
  }
};

export const getSupplierWisePurchaseReport = async (
  params: PurchaseReportQuery
): Promise<SupplierWisePurchaseReport> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);

    if (params.timeOfDay) {
      queryParams.append('TimeOfDay', params.timeOfDay);
    }
    if (params.dodhiId) {
      queryParams.append('DodhiId', params.dodhiId.toString());
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }
    if (params.supplierCode) {
      queryParams.append('SupplierCode', params.supplierCode);
    }

    const response = await api.get(`/Reports/GetSupplierWisePurchaseReport?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supplier-wise purchase report:', error);
    throw new Error('Failed to fetch supplier-wise purchase report');
  }
};

export const getBuyerWiseSalesReport = async (
  params: BuyerWiseSalesReportQuery
): Promise<BuyerWiseSalesReport> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);

    if (params.accountId) {
      queryParams.append('AccountId', params.accountId.toString());
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }

    const response = await api.get(`/Reports/GetBuyerWiseSalesReport?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch buyer-wise sales report:', error);
    throw new Error('Failed to fetch buyer-wise sales report');
  }
};

// ADD new function - Get sales report summary
export const getSalesReportSummary = async (
  params: BuyerWiseSalesReportQuery
): Promise<SalesReportSummary> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('StartDate', params.startDate);
    queryParams.append('EndDate', params.endDate);

    if (params.accountId) {
      queryParams.append('AccountId', params.accountId.toString());
    }
    if (params.chillarId) {
      queryParams.append('ChillarId', params.chillarId.toString());
    }

    const response = await api.get(`/Reports/GetSalesReportSummary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sales report summary:', error);
    throw new Error('Failed to fetch sales report summary');
  }
};

export const getOverallDodhiSummary = async (params: DodhiSummaryQuery): Promise<OverallDodhiSummaryDto> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.startTimeOfDay) {
      queryParams.append('startTimeOfDay', params.startTimeOfDay);
    }
    if (params.endTimeOfDay) {
      queryParams.append('endTimeOfDay', params.endTimeOfDay);
    }
    if (params.chillarId) {
      queryParams.append('chillarId', params.chillarId.toString());
    }

    const response = await api.get(`/Reports/OverallDodhiSummary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch overall dodhi summary:', error);
    throw new Error('Failed to fetch overall dodhi summary');
  }
};

export const getSingleDodhiSummary = async (params: DodhiSummaryQuery): Promise<SingleDodhiSummaryDto[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    if (params.startTimeOfDay) {
      queryParams.append('startTimeOfDay', params.startTimeOfDay);
    }
    if (params.endTimeOfDay) {
      queryParams.append('endTimeOfDay', params.endTimeOfDay);
    }
    if (params.chillarId) {
      queryParams.append('chillarId', params.chillarId.toString());
    }

    const response = await api.get(`/Reports/SingleDodhiSummary?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch single dodhi summary:', error);
    throw new Error('Failed to fetch single dodhi summary');
  }
};

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