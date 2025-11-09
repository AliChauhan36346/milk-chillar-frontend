// src/lib/api/bank-transactions.ts
import { api } from './api';

export interface BankTransactionLine {
  transactionLineId: number;
  transactionId: number;
  accountId: number;
  description?: string;
  amount: number;
  accountCode?: string;
  accountName?: string;
  accountFullCode?: string;
}

export interface BankTransaction {
  transactionId: number;
  tenantId: number;
  voucherNo: number;
  transactionDate: string;
  jobDescription?: string;
  bankAccountId: number;
  instrumentNo?: string;
  instrumentDate?: string;
  totalAmount: number;
  remarks?: string;
  addedBy: number;
  journalEntryId?: number;
  createdAt: string;
  bankAccountCode?: string;
  bankAccountName?: string;
  addedByUsername?: string;
  journalDescription?: string;
  transactionLines: BankTransactionLine[];
}

export interface BankTransactionPagedResponse {
  items: BankTransaction[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateBankTransactionLineRequest {
  accountId: number;
  description?: string;
  amount: number;
}

export interface CreateBankTransactionRequest {
  transactionDate: string;
  jobDescription?: string;
  bankAccountId: number;
  instrumentNo?: string;
  instrumentDate?: string;
  totalAmount: number;
  remarks?: string;
  transactionLines: CreateBankTransactionLineRequest[];
}

export interface UpdateBankTransactionRequest extends CreateBankTransactionRequest {}

// ==================== Bank Payment APIs ====================

// Get paged bank payments
export const getBankPaymentsPaged = async (params: {
  tenantId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  voucherNo?: number;
  fromDate?: string;
  toDate?: string;
  bankAccountId?: number;
  minAmount?: number;
  maxAmount?: number;
  hasJournalEntry?: boolean;
  instrumentNo?: string;
}) => {
  const {
    tenantId,
    pageNumber = 1,
    pageSize = 10,
    search = '',
    voucherNo,
    fromDate,
    toDate,
    bankAccountId,
    minAmount,
    maxAmount,
    hasJournalEntry,
    instrumentNo,
  } = params;

  let url = `/BankPayments?tenantId=${tenantId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (voucherNo !== undefined) url += `&voucherNo=${voucherNo}`;
  if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
  if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
  if (bankAccountId !== undefined) url += `&bankAccountId=${bankAccountId}`;
  if (minAmount !== undefined) url += `&minAmount=${minAmount}`;
  if (maxAmount !== undefined) url += `&maxAmount=${maxAmount}`;
  if (hasJournalEntry !== undefined) url += `&hasJournalEntry=${hasJournalEntry}`;
  if (instrumentNo) url += `&instrumentNo=${encodeURIComponent(instrumentNo)}`;

  const response = await api.get<BankTransactionPagedResponse>(url);
  return response.data;
};

// Get single bank payment by ID
export const getBankPaymentById = async (id: number) => {
  const response = await api.get<BankTransaction>(`/BankPayments/${id}`);
  return response.data;
};

// Get next bank payment voucher number
export const getNextBankPaymentVoucherNumber = async () => {
  const response = await api.get<{ nextVoucherNumber: number }>('/BankPayments/next-voucher');
  return response.data;
};

// Create bank payment
export const createBankPayment = async (data: CreateBankTransactionRequest) => {
  const response = await api.post<BankTransaction>('/BankPayments', data);
  return response.data;
};

// Update bank payment
export const updateBankPayment = async (id: number, data: UpdateBankTransactionRequest) => {
  const response = await api.put<BankTransaction>(`/BankPayments/${id}`, data);
  return response.data;
};

// Delete bank payment
export const deleteBankPayment = async (id: number) => {
  const response = await api.delete(`/BankPayments/${id}`);
  return response.data;
};

// ==================== Bank Receipt APIs ====================

// Get paged bank receipts
export const getBankReceiptsPaged = async (params: {
  tenantId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  voucherNo?: number;
  fromDate?: string;
  toDate?: string;
  bankAccountId?: number;
  minAmount?: number;
  maxAmount?: number;
  hasJournalEntry?: boolean;
  instrumentNo?: string;
}) => {
  const {
    tenantId,
    pageNumber = 1,
    pageSize = 10,
    search = '',
    voucherNo,
    fromDate,
    toDate,
    bankAccountId,
    minAmount,
    maxAmount,
    hasJournalEntry,
    instrumentNo,
  } = params;

  let url = `/BankReceipts?tenantId=${tenantId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (voucherNo !== undefined) url += `&voucherNo=${voucherNo}`;
  if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
  if (toDate) url += `&toDate=${encodeURIComponent(toDate)}`;
  if (bankAccountId !== undefined) url += `&bankAccountId=${bankAccountId}`;
  if (minAmount !== undefined) url += `&minAmount=${minAmount}`;
  if (maxAmount !== undefined) url += `&maxAmount=${maxAmount}`;
  if (hasJournalEntry !== undefined) url += `&hasJournalEntry=${hasJournalEntry}`;
  if (instrumentNo) url += `&instrumentNo=${encodeURIComponent(instrumentNo)}`;

  const response = await api.get<BankTransactionPagedResponse>(url);
  return response.data;
};

// Get single bank receipt by ID
export const getBankReceiptById = async (id: number) => {
  const response = await api.get<BankTransaction>(`/BankReceipts/${id}`);
  return response.data;
};

// Get next bank receipt number
export const getNextBankReceiptNumber = async () => {
  const response = await api.get<{ nextReceiptNumber: number }>('/BankReceipts/next-receipt');
  return response.data;
};

// Create bank receipt
export const createBankReceipt = async (data: CreateBankTransactionRequest) => {
  const response = await api.post<BankTransaction>('/BankReceipts', data);
  return response.data;
};

// Update bank receipt
export const updateBankReceipt = async (id: number, data: UpdateBankTransactionRequest) => {
  const response = await api.put<BankTransaction>(`/BankReceipts/${id}`, data);
  return response.data;
};

// Delete bank receipt
export const deleteBankReceipt = async (id: number) => {
  const response = await api.delete(`/BankReceipts/${id}`);
  return response.data;
};