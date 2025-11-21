
// import { api } from './api';

// export interface Purchase {
//   purchaseId: number;
//   date: string;
//   timeOfDay: 'morning' | 'evening';
//   accountId: number;
//   accountName: string;
//   accountCode: string;
//   expenseAccountName: string;
//   dodhiName: string;
//   grossLiters: number;
//   rate: number;
//   totalAmount: number;
//   balance: number;
// }

// export interface RemainingSupplier {
//   accountId: number;
//   accountName: string;
//   accountCode: string;
//   rate: number;
//   timeOfDay: 'morning' | 'evening';
// }

// export interface ExpenseAccount {
//   accountId: number;
//   accountCode: string;
//   accountName: string;
// }

// export interface PurchaseMetadata {
//   dodhiId: number;
//   addedPurchases: Purchase[];
//   remainingSuppliers: RemainingSupplier[];
//   expenseAccounts: ExpenseAccount[];
// }

// export interface CreatePurchaseRequest {
//   date: string;
//   timeOfDay: 'morning' | 'evening';
//   accountId: number;
//   expenseAccountId: number;
//   dodhiId: number;
//   grossLiters: number;
//   rate: number;
//   balance: number;
// }

// export const getPurchaseMetadata = async (
//   date: string, 
//   timeOfDay: 'morning' | 'evening' | 'both',
//   dodhiId: number
// ): Promise<PurchaseMetadata> => {
//   const response = await api.get(`/Purchase/metadata?date=${date}&timeOfDay=${timeOfDay}&dodhiId=${dodhiId}`);
//   return response.data;
// };

// export const createPurchase = async (data: CreatePurchaseRequest): Promise<Purchase> => {
//   const response = await api.post('/Purchase', data);
//   return response.data;
// };

// export const updatePurchase = async (id: number, data: CreatePurchaseRequest): Promise<Purchase> => {
//   const response = await api.put(`/Purchase/${id}`, data);
//   return response.data;
// };

// export const getPurchaseById = async (id: number): Promise<Purchase> => {
//   const response = await api.get(`/Purchase/${id}`);
//   return response.data;
// };


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
  name: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TimeSummary {
  totalLiters: number;
  totalAmount: number;
  count: number;
}

export interface PurchaseSummary {
  date: string;
  dodhiId: number;
  morning: TimeSummary;
  evening: TimeSummary;
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

export const getRemainingSuppliers = async (
  date: string,
  timeOfDay: 'morning' | 'evening' | 'both',
  dodhiId: number,
  searchCode: string = '',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResult<RemainingSupplier>> => {
  const response = await api.get(`/Purchase/remaining-suppliers?date=${date}&timeOfDay=${timeOfDay}&dodhiId=${dodhiId}&searchCode=${searchCode}&page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const getDailyPurchases = async (
  date: string,
  timeOfDay: 'morning' | 'evening' | 'both',
  dodhiId: number,
  searchCode: string = '',
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResult<Purchase>> => {
  const response = await api.get(`/Purchase/daily?date=${date}&timeOfDay=${timeOfDay}&dodhiId=${dodhiId}&searchCode=${searchCode}&page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const getPurchaseSummary = async (
  date: string,
  dodhiId: number,
  timeOfDay?: 'morning' | 'evening' | 'both'
): Promise<PurchaseSummary> => {
  const timeParam = timeOfDay ? `&timeOfDay=${timeOfDay}` : '';
  const response = await api.get(`/Purchase/summary?date=${date}&dodhiId=${dodhiId}${timeParam}`);
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

export const getPurchaseById = async (id: number): Promise<Purchase> => {
  const response = await api.get(`/Purchase/${id}`);
  return response.data;
};