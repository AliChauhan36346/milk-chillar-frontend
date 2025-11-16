'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cashReceiptsApi, CashReceiptCreateUpdate } from '@/lib/api/cashReceipts';
import {
  createBankReceipt,
  updateBankReceipt,
  getBankReceiptById,
  getNextBankReceiptNumber,
  CreateBankTransactionRequest
} from '@/lib/api/bank-transactions';
import { Card } from '@/components/ui/card';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import {
  TransactionTypeToggle,
  TransactionFormHeader,
  TransactionHeaderSection,
  TransactionLinesTable,
  useTransactionForm,
  type TransactionType
} from '@/components/transactions';

export default function ReceiptForm() {
  const router = useRouter();
  const params = useParams();

  // Check both route params and query params for the id
  const id = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null;
  const isEditing = (params?.id !== 'create' && params?.id) || id;
  const receiptId = isEditing ? Number(params?.id || id) : null;

  const typeParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('type')
    : null;
  const initialType = (typeParam === 'bank' ? 'bank' : 'cash') as TransactionType;

  // Use our custom hook
  const {
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
    toast
  } = useTransactionForm({
  transactionId: receiptId,
  isEditing: !!isEditing,
  initialType: initialType, // ← Make sure this is passed
  onLoadTransaction: async (id: number, type: TransactionType) => {
    console.log('Receipt - Loading transaction:', id, 'Type:', type);
    if (type === 'cash') {
      return await cashReceiptsApi.getReceipt(id);
    } else {
      return await getBankReceiptById(id);
    }
  },
    onGetNextVoucher: async (type: TransactionType) => {
      if (type === 'cash') {
        return await cashReceiptsApi.getNextReceiptNumber();
      } else {
        return await getNextBankReceiptNumber();
      }
    }
  });

  // Keyboard shortcut for adding new line
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        addPaymentLine();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addPaymentLine]);

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
      const receiptDateTime = new Date(formData.paymentDate + 'T00:00:00.000Z').toISOString();

      if (transactionType === 'cash') {
        const validLines = formData.paymentLines
          .filter(line => line.accountId > 0 && line.amount > 0)
          .map(line => ({
            accountId: line.accountId,
            description: line.description || '',
            amount: Number(line.amount || 0)
          }));

        const submitData: CashReceiptCreateUpdate = {
          paymentDate: receiptDateTime,
          jobDescription: formData.jobDescription || '',
          cashAccountId: formData.accountId,
          totalAmount: Number(totalAmount.toFixed(2)),
          remarks: formData.remarks || '',
          paymentLines: validLines
        };

        if (!submitData.paymentLines || submitData.paymentLines.length === 0) {
          throw new Error('At least one valid receipt line with an account and amount is required');
        }

        console.log('Submitting cash receipt data:', JSON.stringify(submitData, null, 2));

        if (isEditing && receiptId) {
          await cashReceiptsApi.updateReceipt(receiptId, submitData);
          toast({
            title: 'Cash receipt updated successfully',
            variant: 'success'
          });
        } else {
          await cashReceiptsApi.createReceipt(submitData);
          toast({
            title: 'Cash receipt created successfully',
            variant: 'success'
          });
        }
      } else {
        const instrumentDateTime = formData.instrumentDate
          ? new Date(formData.instrumentDate + 'T00:00:00.000Z').toISOString()
          : undefined;

        const submitData: CreateBankTransactionRequest = {
          transactionDate: receiptDateTime,
          jobDescription: formData.jobDescription || undefined,
          bankAccountId: formData.accountId,
          instrumentNo: formData.instrumentNo || undefined,
          instrumentDate: instrumentDateTime,
          totalAmount: Number(totalAmount.toFixed(2)),
          remarks: formData.remarks || undefined,
          transactionLines: formData.paymentLines.map(line => ({
            accountId: line.accountId,
            description: line.description || undefined,
            amount: Number(line.amount.toFixed(2))
          }))
        };

        if (isEditing && receiptId) {
          await updateBankReceipt(receiptId, submitData);
          toast({
            title: 'Bank receipt updated successfully',
            variant: 'success'
          });
        } else {
          await createBankReceipt(submitData);
          toast({
            title: 'Bank receipt created successfully',
            variant: 'success'
          });
        }
      }

      router.push('/Accounts/transactions');
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);

      let errorMessage = 'An unexpected error occurred';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = Object.values(validationErrors).flat().join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Log the final error message for debugging
      console.error('Final error message:', errorMessage);

      toast({
        title: 'Failed to save receipt',
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

  const currentAccounts = transactionType === 'cash' ? cashAccounts : bankAccounts;

  return (
    <DynamicLayout allowedRoles={['Admin', 'manager']}>
      <div className="p-1 sm:p-4 max-w-6xl mx-auto">
        {/* Header using component */}
        <TransactionFormHeader
          title="Receipt"
          voucherNo={nextVoucherNo}
          totalAmount={totalAmount}
          linesCount={formData.paymentLines.length}
          isEditing={!!isEditing}
          isSaving={saving}
          backHref="/Accounts/transactions"
          onSave={handleSubmit}
        />

        <form className="mt-4">
          <Card className="border-2 border-slate-200 shadow-sm">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 p-4">
              {/* Type Toggle */}
              <div className="mb-4">
                <TransactionTypeToggle
                  value={transactionType}
                  onChange={handleTypeChange}
                  cashLabel="Cash Receipt"
                  bankLabel="Bank Receipt"
                  disabled={!!isEditing}
                />
              </div>

              {/* Form Fields */}
              <TransactionHeaderSection
                transactionType={transactionType}
                formData={formData}
                accounts={currentAccounts}
                errors={errors}
                onFieldChange={updateFormData}
                accountLabel={transactionType === 'cash' ? 'Cash Account' : 'Bank Account'}
              />
            </div>

            {/* Transaction Lines Table */}
            <TransactionLinesTable
              lines={formData.paymentLines}
              errors={errors}
              totalAmount={totalAmount}
              onAddLine={addPaymentLine}
              onUpdateLine={updatePaymentLine}
              onDeleteLine={removePaymentLine}
              tableTitle="Receipt Lines"
            />
          </Card>
        </form>
      </div>
    </DynamicLayout>
  );
}