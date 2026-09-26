// src/lib/api/maintenance.ts
import { api } from './api';

export interface SupplierRateSummary {
    previousRate: number;
    totalLiters: number;
    totalAmount: number;
}

// Mass update supplier rates by Dodhi
export const massUpdateSupplierRatesByDodhi = async (dodhiId: number, newRate: number) => {
    const response = await api.post(`/Maintenance/mass-update-supplier-rate-by-dodhi?dodhiId=${dodhiId}`, newRate);
    return response.data;
};

// Mass update supplier rates
export const massUpdateSupplierRates = async (newRate: number) => {
    const response = await api.post('/Maintenance/mass-update-supplier-rate', newRate);
    return response.data;
};

// Mass update buyer rates
export const massUpdateBuyerRates = async (newRate: number) => {
    const response = await api.post('/Maintenance/mass-update-buyer-rate', newRate);
    return response.data;
};

// Mass update supplier Dodhi
export const massUpdateSupplierDodhi = async (dodhiId: number, supplierIds: number[]) => {
    const response = await api.post(`/Maintenance/mass-update-supplier-dodhi?dodhiId=${dodhiId}`, supplierIds);
    return response.data;
};

// Get supplier rate summary for a period
export const getSupplierRateSummaryForPeriod = async (accountId: number, startDate: string, endDate: string) => {
    const response = await api.get<SupplierRateSummary>(
        `/Maintenance/supplier-rate-summary?accountId=${accountId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
};

// Get buyer rate summary for a period
export const getBuyerRateSummaryForPeriod = async (accountId: number, startDate: string, endDate: string) => {
    const response = await api.get<SupplierRateSummary>(
        `/Maintenance/buyer-rate-summary?accountId=${accountId}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
};

// Update supplier rate for a period
export const updateSupplierRateForPeriod = async (
    accountId: number,
    newRate: number,
    startDate: string,
    endDate: string
) => {
    const response = await api.post(
        `/Maintenance/update-supplier-rate-period?accountId=${accountId}&newRate=${newRate}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
};

// Update buyer rate for a period
export const updateBuyerRateForPeriod = async (
    accountId: number,
    newRate: number,
    startDate: string,
    endDate: string
) => {
    const response = await api.post(
        `/Maintenance/update-buyer-rate-period?accountId=${accountId}&newRate=${newRate}&startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
};

// Data Cleanup Interfaces
export interface DataCleanupPreview {
    purchasesCount: number;
    salesCount: number;
    chillarReceivesCount: number;
    stockEntriesCount: number;
    cashPaymentsCount: number;
    cashReceiptsCount: number;
    bankPaymentsCount: number;
    bankReceiptsCount: number;
    journalEntriesCount: number;
    suppliersCount: number;
    buyersCount: number;
    employeesCount: number;
    chillarsCount: number;
    accountsCount: number;
    totalTransactionalRecords: number;
    totalMasterRecords: number;
}

export interface DataCleanupRequest {
    preserveAccounts: boolean;
    clearPurchases: boolean;
    clearSales: boolean;
    clearChillarReceives: boolean;
    clearStockEntries: boolean;
    clearPaymentsAndReceipts: boolean;
    clearJournalEntries: boolean;
    confirmationText?: string;
    password?: string;
}

export interface DataCleanupResult {
    success: boolean;
    message: string;
    deletedPurchases: number;
    deletedSales: number;
    deletedChillarReceives: number;
    deletedStockEntries: number;
    deletedPaymentsAndReceipts: number;
    deletedJournalEntries: number;
    deletedMasterEntities: number;
    deletedAccounts: number;
    totalDeleted: number;
}

export const getDataCleanupPreview = async (): Promise<DataCleanupPreview> => {
    const response = await api.get('/Maintenance/cleanup-preview');
    return response.data;
};

export const executeDataCleanup = async (request: DataCleanupRequest): Promise<DataCleanupResult> => {
    const response = await api.post('/Maintenance/cleanup', request);
    return response.data;
};
