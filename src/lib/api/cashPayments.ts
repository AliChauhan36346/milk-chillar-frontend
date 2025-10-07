// // src/lib/api/cashPayments.ts
// import { api } from './api';

// export interface CashPaymentLine {
//   cashPaymentLineId: number;
//   cashPaymentId: number;
//   accountId: number;
//   description: string;
//   amount: number;
//   accountCode: string;
//   accountName: string;
//   accountFullCode: string;
// }

// export interface CashPayment {
//   cashPaymentId: number;
//   tenantId: number;
//   voucherNo: number;
//   paymentDate: string;
//   jobDescription: string;
//   cashAccountId: number;
//   totalAmount: number;
//   remarks: string;
//   addedBy: number;
//   journalEntryId: number | null;
//   createdAt: string;
//   cashAccountCode: string;
//   cashAccountName: string;
//   addedByUsername: string;
//   journalDescription: string | null;
//   paymentLines: CashPaymentLine[];
//   linesTotal: number;
//   isBalanced: boolean;
// }

// export interface CashPaymentCreateUpdate {
//   paymentDate: string;
//   jobDescription: string;
//   cashAccountId: number;
//   totalAmount: number;
//   remarks: string;
//   paymentLines: {
//     accountId: number;
//     description: string;
//     amount: number;
//   }[];
// }

// export interface CashPaymentSearchParams {
//   TenantId?: number;
//   Search?: string;
//   VoucherNo?: number;
//   FromDate?: string;
//   ToDate?: string;
//   CashAccountId?: number;
//   MinAmount?: number;
//   MaxAmount?: number;
//   HasJournalEntry?: boolean;
//   PageNumber?: number;
//   PageSize?: number;
// }

// export interface CashPaymentsResponse {
//   items: CashPayment[];
//   totalCount: number;
//   pageNumber: number;
//   pageSize: number;
//   totalPages: number;
// }

// export const cashPaymentsApi = {
//   getPayments: async (params: CashPaymentSearchParams = {}): Promise<CashPaymentsResponse> => {
//     const searchParams = new URLSearchParams();
//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined) {
//         searchParams.append(key, value.toString());
//       }
//     });
    
//     const response = await api.get(`/CashPayments?${searchParams.toString()}`);
//     return response.data;
//   },

//   getNextVoucherNumber: async (): Promise<{ nextVoucherNumber: number }> => {
//     const response = await api.get('/CashPayments/next-voucher');
//     return response.data;
//   },

//   createPayment: async (payment: CashPaymentCreateUpdate): Promise<CashPayment> => {
//     const response = await api.post('/CashPayments', payment);
//     return response.data;
//   },

//   getPayment: async (id: number): Promise<CashPayment> => {
//     const response = await api.get(`/CashPayments/${id}`);
//     return response.data;
//   },

//   updatePayment: async (id: number, payment: CashPaymentCreateUpdate): Promise<CashPayment> => {
//     const response = await api.put(`/CashPayments/${id}`, payment);
//     return response.data;
//   },

//   deletePayment: async (id: number): Promise<void> => {
//     const response = await api.delete(`/CashPayments/${id}`);
//     return response.data;
//   },
// };

// src/lib/api/cashPayments.ts
import { api } from './api';

export interface CashPaymentLine {
  cashPaymentLineId: number;
  cashPaymentId: number;
  accountId: number;
  description: string;
  amount: number;
  accountCode: string;
  accountName: string;
  accountFullCode: string;
}

export interface CashPayment {
  cashPaymentId: number;
  tenantId: number;
  voucherNo: number;
  paymentDate: string;
  jobDescription: string;
  cashAccountId: number;
  totalAmount: number;
  remarks: string;
  addedBy: number;
  journalEntryId: number | null;
  createdAt: string;
  cashAccountCode: string;
  cashAccountName: string;
  addedByUsername: string;
  journalDescription: string | null;
  paymentLines: CashPaymentLine[];
  linesTotal: number;
  isBalanced: boolean;
}

export interface CashPaymentCreateUpdate {
  paymentDate: string;
  jobDescription: string;
  cashAccountId: number;
  totalAmount: number;
  remarks: string;
  paymentLines: {
    accountId: number;
    description: string;
    amount: number;
  }[];
}

export interface CashPaymentSearchParams {
  TenantId?: number;
  Search?: string;
  VoucherNo?: number;
  FromDate?: string;
  ToDate?: string;
  CashAccountId?: number;
  MinAmount?: number;
  MaxAmount?: number;
  HasJournalEntry?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

export interface CashPaymentsResponse {
  items: CashPayment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const cashPaymentsApi = {
  getPayments: async (params: CashPaymentSearchParams = {}): Promise<CashPaymentsResponse> => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      
      console.log('Getting payments with params:', params);
      const response = await api.get(`/CashPayments?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payments:', error?.response?.data || error?.message || error);
      throw new Error(error?.response?.data?.message || 'Failed to get payments');
    }
  },

  getNextVoucherNumber: async (): Promise<{ nextVoucherNumber: number }> => {
    try {
      console.log('Getting next voucher number...');
      const response = await api.get('/CashPayments/next-voucher');
      console.log('Next voucher number response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting next voucher number:', error?.response?.data || error?.message || error);
      throw new Error(error?.response?.data?.message || 'Failed to get next voucher number');
    }
  },

  createPayment: async (payment: CashPaymentCreateUpdate): Promise<CashPayment> => {
    try {
      console.log('Creating payment:', JSON.stringify(payment, null, 2));
      
      // Validate the payment data before sending
      if (!payment.paymentDate) {
        throw new Error('Payment date is required');
      }
      if (!payment.jobDescription?.trim()) {
        throw new Error('Job description is required');
      }
      if (!payment.cashAccountId || payment.cashAccountId <= 0) {
        throw new Error('Cash account is required');
      }
      if (!payment.paymentLines || payment.paymentLines.length === 0) {
        throw new Error('At least one payment line is required');
      }
      if (payment.totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }

      // Validate payment lines
      payment.paymentLines.forEach((line, index) => {
        if (!line.accountId || line.accountId <= 0) {
          throw new Error(`Payment line ${index + 1}: Account is required`);
        }
        if (!line.amount || line.amount <= 0) {
          throw new Error(`Payment line ${index + 1}: Amount must be greater than 0`);
        }
      });

      const response = await api.post('/CashPayments', payment);
      console.log('Payment created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', error?.response?.data || error?.message || error);
      
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
        throw new Error('Forbidden. You do not have permission to create payments.');
      } else if (error?.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      // If it's our own validation error, re-throw it
      if (error?.message && !error?.response) {
        throw error;
      }
      
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to create payment');
    }
  },

  getPayment: async (id: number): Promise<CashPayment> => {
    try {
      console.log('Getting payment with ID:', id);
      if (!id || id <= 0) {
        throw new Error('Valid payment ID is required');
      }
      
      const response = await api.get(`/CashPayments/${id}`);
      console.log('Payment retrieved:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment:', error?.response?.data || error?.message || error);
      
      if (error?.response?.status === 404) {
        throw new Error('Payment not found');
      }
      
      throw new Error(error?.response?.data?.message || 'Failed to get payment');
    }
  },

  updatePayment: async (id: number, payment: CashPaymentCreateUpdate): Promise<CashPayment> => {
    try {
      console.log('Updating payment:', id, JSON.stringify(payment, null, 2));
      
      if (!id || id <= 0) {
        throw new Error('Valid payment ID is required');
      }
      
      // Same validation as create
      if (!payment.paymentDate) {
        throw new Error('Payment date is required');
      }
      if (!payment.jobDescription?.trim()) {
        throw new Error('Job description is required');
      }
      if (!payment.cashAccountId || payment.cashAccountId <= 0) {
        throw new Error('Cash account is required');
      }
      if (!payment.paymentLines || payment.paymentLines.length === 0) {
        throw new Error('At least one payment line is required');
      }
      if (payment.totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }

      const response = await api.put(`/CashPayments/${id}`, payment);
      console.log('Payment updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment:', error?.response?.data || error?.message || error);
      
      if (error?.response?.status === 404) {
        throw new Error('Payment not found');
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
      
      throw new Error(error?.response?.data?.message || 'Failed to update payment');
    }
  },

  deletePayment: async (id: number): Promise<void> => {
    try {
      console.log('Deleting payment with ID:', id);
      if (!id || id <= 0) {
        throw new Error('Valid payment ID is required');
      }
      
      const response = await api.delete(`/CashPayments/${id}`);
      console.log('Payment deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error deleting payment:', error?.response?.data || error?.message || error);
      
      if (error?.response?.status === 404) {
        throw new Error('Payment not found');
      }
      
      throw new Error(error?.response?.data?.message || 'Failed to delete payment');
    }
  },
};