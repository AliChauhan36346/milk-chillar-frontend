// hooks/useTransactionForm.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';

export type TransactionType = 'cash' | 'bank';
export type TransactionMode = 'payment' | 'receipt';

export interface TransactionLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
}

export interface TransactionFormData {
  paymentDate: string;
  jobDescription: string;
  accountId: number;
  instrumentNo?: string;
  instrumentDate?: string;
  remarks: string;
  paymentLines: TransactionLine[];
}

const INITIAL_FORM_DATA: TransactionFormData = {
  paymentDate: new Date().toISOString().split('T')[0],
  jobDescription: '',
  accountId: 0,
  instrumentNo: '',
  instrumentDate: '',
  remarks: '',
  paymentLines: [
    { accountId: 0, accountCode: '', accountName: '', description: '', amount: 0 }
  ]
};

interface UseTransactionFormOptions {
  transactionId?: number | null;
  isEditing: boolean;
  onLoadTransaction?: (id: number, type: TransactionType) => Promise<any>;
  onGetNextVoucher?: (type: TransactionType) => Promise<any>;
  initialType?: TransactionType;
}

export function useTransactionForm(options: UseTransactionFormOptions) {
  const { transactionId, isEditing, onLoadTransaction, onGetNextVoucher, initialType } = options;
  const router = useRouter();
  const { toast } = useToast();

  // Initialize transactionType directly from initialType
  const [transactionType, setTransactionType] = useState<TransactionType>(initialType || 'cash');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nextVoucherNo, setNextVoucherNo] = useState<number | null>(null);
  const [cashAccounts, setCashAccounts] = useState<SearchAccountResult[]>([]);
  const [bankAccounts, setBankAccounts] = useState<SearchAccountResult[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<any>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update transactionType when initialType changes
  useEffect(() => {
    if (initialType) {
      console.log('Setting transaction type from initialType:', initialType);
      setTransactionType(initialType);
    }
  }, [initialType]);

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [cash, bank] = await Promise.all([
          accountsApi.getAccountsByCodePrefix('110'),
          accountsApi.getAccountsByCodePrefix('120')
        ]);
        setCashAccounts(cash);
        setBankAccounts(bank);
      } catch (error) {
        console.error('Failed to load accounts:', error);
        setCashAccounts([]);
        setBankAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  // Load transaction or voucher number
  useEffect(() => {
    if (!isClient) return; // Wait for client-side mount

    const loadData = async () => {
      if (isEditing && transactionId && onLoadTransaction) {
        await loadTransaction();
      } else if (onGetNextVoucher) {
        await loadNextVoucherNumber();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [isClient, isEditing, transactionId, transactionType]); // Keep transactionType as dependency

  const loadNextVoucherNumber = async () => {
    if (!onGetNextVoucher) return;

    try {
      const response = await onGetNextVoucher(transactionType);
      setNextVoucherNo(response.nextVoucherNumber || response.nextReceiptNumber);
    } catch (error) {
      console.error('Failed to load next voucher number:', error);
    }
  };

  const loadTransaction = async () => {
    if (!onLoadTransaction || !transactionId) return;

    try {
      setLoading(true);
      // Use initialType if available, otherwise fall back to transactionType state
      const typeToUse = initialType || transactionType;
      console.log('Loading transaction:', transactionId, 'with type:', typeToUse);
      
      const data = await onLoadTransaction(transactionId, typeToUse);

      setFormData({
        paymentDate: (data.paymentDate || data.transactionDate || data.receiptDate).split('T')[0],
        jobDescription: data.jobDescription || '',
        accountId: data.cashAccountId || data.bankAccountId,
        instrumentNo: data.instrumentNo || data.chequeNo || '',
        instrumentDate: (data.instrumentDate || data.chequeDate)?.split('T')[0] || '',
        remarks: data.remarks || '',
        paymentLines: (data.paymentLines || data.transactionLines || data.receiptLines || []).map((line: any) => ({
          accountId: line.accountId,
          accountCode: line.accountCode || '',
          accountName: line.accountName || '',
          description: line.description || '',
          amount: line.amount
        }))
      });
    } catch (error) {
      console.error('Error loading transaction:', error);
      toast({
        title: 'Failed to load transaction',
        variant: 'error'
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.paymentLines.reduce((sum, line) => sum + (line.amount || 0), 0);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const updatePaymentLine = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newLines = [...prev.paymentLines];
      if (field === 'account') {
        newLines[index] = {
          ...newLines[index],
          accountId: value?.accountId || 0,
          accountCode: value?.accountCode || '',
          accountName: value?.accountName || value?.name || ''
        };
      } else {
        newLines[index] = { ...newLines[index], [field]: value };
      }

      if (errors[`line_${index}_account`] || errors[`line_${index}_amount`]) {
        setErrors((prev: Record<string, string | undefined>) => ({
          ...prev,
          [`line_${index}_account`]: undefined,
          [`line_${index}_amount`]: undefined
        }));
      }

      return { ...prev, paymentLines: newLines };
    });
  };

  const addPaymentLine = () => {
    setFormData(prev => ({
      ...prev,
      paymentLines: [
        ...prev.paymentLines,
        { accountId: 0, accountCode: '', accountName: '', description: '', amount: 0 }
      ]
    }));
  };

  const removePaymentLine = (index: number) => {
    if (formData.paymentLines.length > 1) {
      const newLines = formData.paymentLines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, paymentLines: newLines }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.paymentDate) newErrors.paymentDate = 'Required';
    if (!formData.accountId) newErrors.accountId = 'Required';

    // Check if any line has valid data
    const validLines = formData.paymentLines.filter(line =>
      line.accountId > 0 && line.amount > 0
    );

    if (validLines.length === 0) {
      newErrors.totalAmount = 'At least one valid line with account and amount is required';
    }

    // Still show individual line errors
    formData.paymentLines.forEach((line, index) => {
      if (!line.accountId) {
        newErrors[`line_${index}_account`] = 'Required';
      }
      if (!line.amount || line.amount <= 0) {
        newErrors[`line_${index}_amount`] = 'Amount must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setFormData(prev => ({ ...prev, accountId: 0 }));
    if (onGetNextVoucher) {
      loadNextVoucherNumber();
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
  };

  return {
    transactionType,
    loading,
    saving,
    setSaving,
    nextVoucherNo,
    cashAccounts,
    bankAccounts,
    formData,
    errors,
    totalAmount,
    updateFormData,
    updatePaymentLine,
    addPaymentLine,
    removePaymentLine,
    validateForm,
    handleTypeChange,
    resetForm,
    toast
  };
}