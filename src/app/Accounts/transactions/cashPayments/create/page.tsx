
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, 
  Plus, 
  Trash2
} from 'lucide-react';
import { cashPaymentsApi, CashPaymentCreateUpdate } from '@/lib/api/cashPayments';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { AccountSearchInline } from '@/components/forms/AccountSearchInline';

interface FormData {
  paymentDate: string;
  jobDescription: string;
  cashAccountId: number;
  remarks: string;
  paymentLines: Array<{
    accountId: number;
    accountCode: string;
    accountName: string;
    description: string;
    amount: number;
  }>;
}

const INITIAL_FORM_DATA: FormData = {
  paymentDate: new Date().toISOString().split('T')[0],
  jobDescription: '',
  cashAccountId: 0,
  remarks: '',
  paymentLines: [
    { accountId: 0, accountCode: '', accountName: '', description: '', amount: 0 }
  ]
};

export default function CashPaymentForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  // Check both route params and query params for the id
  const id = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('id') 
    : null;
  const isEditing = (params?.id !== 'create' && params?.id) || id;
  const paymentId = isEditing ? Number(params?.id || id) : null;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nextVoucherNo, setNextVoucherNo] = useState<number | null>(null);
  const [cashAccounts, setCashAccounts] = useState<SearchAccountResult[]>([]);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<any>({});

  // Keyboard shortcut for adding new line
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to add new line
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addPaymentLine();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadCashAccounts = async () => {
      try {
        const accounts = await accountsApi.getAccountsByCodePrefix('110');
        setCashAccounts(accounts);
      } catch (error) {
        console.error('Failed to load cash accounts:', error);
        setCashAccounts([]);
      }
    };
    loadCashAccounts();
  }, []);

  useEffect(() => {
    if (isEditing && paymentId) {
      loadPayment();
    } else {
      loadNextVoucherNumber();
      setLoading(false);
    }
  }, [isEditing, paymentId]);

  const loadNextVoucherNumber = async () => {
    try {
      const response = await cashPaymentsApi.getNextVoucherNumber();
      setNextVoucherNo(response.nextVoucherNumber);
    } catch (error) {
      console.error('Failed to load next voucher number:', error);
    }
  };

  const loadPayment = async () => {
    try {
      setLoading(true);
      const payment = await cashPaymentsApi.getPayment(paymentId!);
      setFormData({
        paymentDate: payment.paymentDate.split('T')[0],
        jobDescription: payment.jobDescription,
        cashAccountId: payment.cashAccountId,
        remarks: payment.remarks,
        paymentLines: payment.paymentLines.map(line => ({
          accountId: line.accountId,
          accountCode: line.accountCode,
          accountName: line.accountName,
          description: line.description,
          amount: line.amount
        }))
      });
    } catch (error) {
      toast({
        title: 'Failed to load payment',
        variant: 'error'
      });
      router.push('/Accounts/transactions/cashPayments');
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
      
      // Clear any errors for this line
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
    if (!formData.cashAccountId) newErrors.cashAccountId = 'Required';
    if (totalAmount <= 0) newErrors.totalAmount = 'Add at least one line item';
    
    formData.paymentLines.forEach((line, index) => {
      if (!line.accountId) {
        newErrors[`line_${index}_account`] = 'Required';
      }
      if (line.amount <= 0) {
        newErrors[`line_${index}_amount`] = 'Required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      toast({
        title: 'Please fill all required fields',
        variant: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      const paymentDateTime = new Date(formData.paymentDate + 'T00:00:00.000Z').toISOString();
      
      const submitData: CashPaymentCreateUpdate = {
        paymentDate: paymentDateTime,
        jobDescription: formData.jobDescription || '',
        cashAccountId: formData.cashAccountId,
        totalAmount: Number(totalAmount.toFixed(2)),
        remarks: formData.remarks || '',
        paymentLines: formData.paymentLines.map(line => ({
          accountId: line.accountId,
          description: line.description || '',
          amount: Number(line.amount.toFixed(2))
        }))
      };
      
      if (isEditing && paymentId) {
        await cashPaymentsApi.updatePayment(paymentId, submitData);
        toast({
          title: 'Payment updated successfully',
          variant: 'success'
        });
      } else {
        await cashPaymentsApi.createPayment(submitData);
        toast({
          title: 'Payment created successfully',
          variant: 'success'
        });
      }
      
      router.push('/Accounts/transactions/cashPayments');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = Object.values(validationErrors).flat().join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Failed to save payment',
        description: errorMessage,
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DynamicLayout allowedRoles={['Admin', 'manager']}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout allowedRoles={['Admin', 'manager']}>
      <div className="p-1 sm:p-4 max-w-6xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BackButton href="/Accounts/transactions/cashPayments" />
            <h1 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Edit Cash Payment' : 'Cash Payment'}
              {!isEditing && nextVoucherNo && (
                <span className="ml-2 text-blue-600">#{nextVoucherNo}</span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">₨ {totalAmount.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{formData.paymentLines.length} lines</div>
            </div>
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <form className="mt-4">
          <Card className="border-2 border-slate-200 shadow-sm">
            {/* Top Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => updateFormData('paymentDate', e.target.value)}
                    className={`w-full p-3 border-2 rounded-lg text-sm font-medium shadow-sm ${
                      errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">
                    Cash Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cashAccountId || ''}
                    onChange={(e) => updateFormData('cashAccountId', Number(e.target.value))}
                    className={`w-full p-3 border-2 rounded-lg text-sm font-medium shadow-sm ${
                      errors.cashAccountId ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  >
                    <option value="">Select account...</option>
                    {cashAccounts.map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.accountCode} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">Job Description</label>
                  <input
                    type="text"
                    value={formData.jobDescription}
                    onChange={(e) => updateFormData('jobDescription', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., Office rent payment..."
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold mb-2 block">Remarks</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => updateFormData('remarks', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Optional remarks..."
                  />
                </div>
              </div>
            </div>

            {/* Transaction Lines */}
            {/* Table Section */}
            <div className="p-0">
              {/* Table Header */}
              <div className="border-b border-gray-300 bg-gray-100">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium text-gray-700">Payment Lines</span>
                  <button
                    type="button"
                    onClick={addPaymentLine}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Line
                  </button>
                </div>
                
                {/* Desktop Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-2 px-2 pb-2 text-xs font-medium text-gray-600">
                  <div className="col-span-4">Account Code & Name</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-3">Amount</div>
                  <div className="col-span-1">Action</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {formData.paymentLines.map((line, index) => (
                  <div key={index} className="p-2 hover:bg-gray-50">
                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <AccountSearchInline
                          value={line.accountId ? { 
                            accountId: line.accountId, 
                            accountCode: line.accountCode, 
                            accountName: line.accountName,
                            name: line.accountName 
                          } : null}
                          onChange={(account) => updatePaymentLine(index, 'account', account)}
                          error={errors[`line_${index}_account`]}
                          placeholder="Search account..."
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updatePaymentLine(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="Description..."
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₨</span>
                          <input
                            type="number"
                            value={line.amount || ''}
                            onChange={(e) => updatePaymentLine(index, 'amount', Number(e.target.value))}
                            className={`w-full pl-6 pr-2 py-2 border rounded text-sm text-right ${
                              errors[`line_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {formData.paymentLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePaymentLine(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Line {index + 1}</span>
                        {formData.paymentLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePaymentLine(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <AccountSearchInline
                        value={line.accountId ? { 
                          accountId: line.accountId, 
                          accountCode: line.accountCode, 
                          accountName: line.accountName,
                          name: line.accountName 
                        } : null}
                        onChange={(account) => updatePaymentLine(index, 'account', account)}
                        error={errors[`line_${index}_account`]}
                        placeholder="Search account..."
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updatePaymentLine(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="Description..."
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₨</span>
                          <input
                            type="number"
                            value={line.amount || ''}
                            onChange={(e) => updatePaymentLine(index, 'amount', Number(e.target.value))}
                            className={`w-full pl-6 pr-2 py-2 border rounded text-sm text-right ${
                              errors[`line_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="border-t-2 border-gray-300 bg-gray-50 p-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total ({formData.paymentLines.length} lines)
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₨ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </DynamicLayout>
  );
}


