
// lib/api/cashReceipts.ts
import { api } from './api';

export interface CashReceiptLine {
  cashReceiptLineId: number;
  cashReceiptId: number;
  accountId: number;
  description: string;
  amount: number;
  accountCode: string;
  accountName: string;
  accountFullCode: string;
}

export interface CashReceipt {
  cashReceiptId: number;
  tenantId: number;
  receiptNo: number;
  receiptDate: string;
  jobDescription: string;
  cashAccountId: number;
  totalAmount: number;
  remarks: string;
  addedBy: number;
  journalEntryId?: number;
  createdAt: string;
  cashAccountCode: string;
  cashAccountName: string;
  addedByUsername: string;
  journalDescription?: string;
  receiptLines: CashReceiptLine[];
}

export interface CashReceiptPagedResponse {
  items: CashReceipt[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CashReceiptLineCreateUpdate {
  accountId: number;
  description: string;
  amount: number;
}

export interface CashReceiptCreateUpdate {
  paymentDate: string;  // Changed from receiptDate to match API
  jobDescription: string;
  cashAccountId: number;
  totalAmount: number;
  remarks: string;
  paymentLines: CashReceiptLineCreateUpdate[];  // Changed from receiptLines to match API
}

// Get paged cash receipts
export const getReceiptsPaged = async (params: {
  tenantId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  receiptNo?: number;
  fromDate?: string;
  toDate?: string;
  cashAccountId?: number;
  minAmount?: number;
  maxAmount?: number;
  hasJournalEntry?: boolean;
}) => {
  try {
    const {
      tenantId,
      pageNumber = 1,
      pageSize = 10,
      search = '',
      receiptNo,
      fromDate,
      toDate,
      cashAccountId,
      minAmount,
      maxAmount,
      hasJournalEntry,
    } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('tenantId', tenantId.toString());
    searchParams.append('pageNumber', pageNumber.toString());
    searchParams.append('pageSize', pageSize.toString());
    if (search) searchParams.append('search', search);
    if (receiptNo !== undefined) searchParams.append('voucherNo', receiptNo.toString());
    if (fromDate) searchParams.append('fromDate', fromDate);
    if (toDate) searchParams.append('toDate', toDate);
    if (cashAccountId !== undefined) searchParams.append('cashAccountId', cashAccountId.toString());
    if (minAmount !== undefined) searchParams.append('minAmount', minAmount.toString());
    if (maxAmount !== undefined) searchParams.append('maxAmount', maxAmount.toString());
    if (hasJournalEntry !== undefined) searchParams.append('hasJournalEntry', hasJournalEntry.toString());

    console.log('Getting receipts with params:', params);
    const response = await api.get<CashReceiptPagedResponse>(`/CashReceipts?${searchParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting receipts:', error?.response?.data || error?.message || error);
    throw new Error(error?.response?.data?.message || 'Failed to get receipts');
  }
};

// Get single cash receipt by ID
export const getReceipt = async (id: number) => {
  try {
    console.log('Getting receipt with ID:', id);
    if (!id || id <= 0) {
      throw new Error('Valid receipt ID is required');
    }
    
    const response = await api.get<CashReceipt>(`/CashReceipts/${id}`);
    console.log('Receipt retrieved:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting receipt:', error?.response?.data || error?.message || error);
    
    if (error?.response?.status === 404) {
      throw new Error('Receipt not found');
    }
    
    throw new Error(error?.response?.data?.message || 'Failed to get receipt');
  }
};

// Get next receipt number
export const getNextReceiptNumber = async () => {
  try {
    console.log('Getting next receipt number...');
    const response = await api.get<{ nextReceiptNumber: number }>('/CashReceipts/next-receipt');
    console.log('Next receipt number response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting next receipt number:', error?.response?.data || error?.message || error);
    throw new Error(error?.response?.data?.message || 'Failed to get next receipt number');
  }
};

// Create cash receipt
export const createReceipt = async (data: CashReceiptCreateUpdate) => {
  try {
    console.log('Creating receipt:', JSON.stringify(data, null, 2));
    
    // Validate the receipt data before sending
    if (!data.paymentDate) {
      throw new Error('Payment date is required');
    }
    if (!data.jobDescription?.trim()) {
      throw new Error('Job description is required');
    }
    if (!data.cashAccountId || data.cashAccountId <= 0) {
      throw new Error('Cash account is required');
    }
    if (!data.paymentLines || data.paymentLines.length === 0) {
      throw new Error('At least one payment line is required');
    }
    if (data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    // Validate payment lines
    data.paymentLines.forEach((line: CashReceiptLineCreateUpdate, index: number) => {
      if (!line.accountId || line.accountId <= 0) {
        throw new Error(`Receipt line ${index + 1}: Account is required`);
      }
      if (!line.amount || line.amount <= 0) {
        throw new Error(`Receipt line ${index + 1}: Amount must be greater than 0`);
      }
    });

    const response = await api.post<CashReceipt>('/CashReceipts', data);
    console.log('Receipt created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating receipt:', error?.response?.data || error?.message || error);
    
    // Handle different error types
    if (error?.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData?.errors) {
        // Handle validation errors
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation errors: ${validationErrors}`);
      } else if (errorData?.message) {
        throw new Error(errorData.message);
      }
    } else if (error?.response?.status === 401) {
      throw new Error('Unauthorized. Please check your authentication.');
    } else if (error?.response?.status === 403) {
      throw new Error('Forbidden. You do not have permission to create receipts.');
    } else if (error?.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // If it's our own validation error, re-throw it
    if (error?.message && !error?.response) {
      throw error;
    }
    
    throw new Error(error?.response?.data?.message || error?.message || 'Failed to create receipt');
  }
};

// Update cash receipt
export const updateReceipt = async (id: number, data: CashReceiptCreateUpdate) => {
  try {
    console.log('Updating receipt:', id, JSON.stringify(data, null, 2));
    
    if (!id || id <= 0) {
      throw new Error('Valid receipt ID is required');
    }
    
    // Same validation as create
    if (!data.paymentDate) {
      throw new Error('Payment date is required');
    }
    if (!data.jobDescription?.trim()) {
      throw new Error('Job description is required');
    }
    if (!data.cashAccountId || data.cashAccountId <= 0) {
      throw new Error('Cash account is required');
    }
    if (!data.paymentLines || data.paymentLines.length === 0) {
      throw new Error('At least one payment line is required');
    }
    if (data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    const response = await api.put<CashReceipt>(`/CashReceipts/${id}`, data);
    console.log('Receipt updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating receipt:', error?.response?.data || error?.message || error);
    
    if (error?.response?.status === 404) {
      throw new Error('Receipt not found');
    } else if (error?.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData?.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation errors: ${validationErrors}`);
      }
    }
    
    // If it's our own validation error, re-throw it
    if (error?.message && !error?.response) {
      throw error;
    }
    
    throw new Error(error?.response?.data?.message || 'Failed to update receipt');
  }
};

// Delete cash receipt
export const deleteReceipt = async (id: number) => {
  try {
    console.log('Deleting receipt with ID:', id);
    if (!id || id <= 0) {
      throw new Error('Valid receipt ID is required');
    }
    
    const response = await api.delete(`/CashReceipts/${id}`);
    console.log('Receipt deleted successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error deleting receipt:', error?.response?.data || error?.message || error);
    
    if (error?.response?.status === 404) {
      throw new Error('Receipt not found');
    }
    
    throw new Error(error?.response?.data?.message || 'Failed to delete receipt');
  }
};

export const cashReceiptsApi = {
  getReceiptsPaged,
  getReceipt,
  getNextReceiptNumber,
  createReceipt,
  updateReceipt,
  deleteReceipt,
};