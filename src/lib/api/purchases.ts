import { api } from './api';

export interface Purchase {
  purchaseId: number;
  date: string;
  timeOfDay: 'morning' | 'evening';
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

export interface RemainingSupplier {
  accountId: number;
  accountName: string;
  accountCode: string;
  rate: number;
  timeOfDay: 'morning' | 'evening';
}

export interface ExpenseAccount {
  accountId: number;
  accountCode: string;
  accountName: string;
}

export interface PurchaseMetadata {
  dodhiId: number;
  addedPurchases: Purchase[];
  remainingSuppliers: RemainingSupplier[];
  expenseAccounts: ExpenseAccount[];
}

export interface CreatePurchaseRequest {
  date: string;
  timeOfDay: 'morning' | 'evening';
  accountId: number;
  expenseAccountId: number;
  dodhiId: number;
  grossLiters: number;
  rate: number;
  balance: number;
}

export const getPurchaseMetadata = async (date: string, timeOfDay: 'morning' | 'evening' | 'both'): Promise<PurchaseMetadata> => {
  const response = await api.get(`/Purchase/metadata?date=${date}&timeOfDay=${timeOfDay}`);
  return response.data;
};

export const createPurchase = async (data: CreatePurchaseRequest): Promise<Purchase> => {
  const response = await api.post('/Purchase', data);
  return response.data;
};

export const updatePurchase = async (id: number, data: CreatePurchaseRequest): Promise<Purchase> => {
  const response = await api.put(`/Purchase/${id}`, data);
  return response.data;
};
