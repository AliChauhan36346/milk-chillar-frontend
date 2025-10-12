'use client';
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Wallet, CheckCircle } from 'lucide-react';
import { ParchiDto } from '@/lib/api/parchi';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';

interface PayParchiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cashAccountId: number, confirmationText: string) => Promise<void>;
  parchis: ParchiDto[];
  startDate: string;
  endDate: string;
}

export function PayParchiModal({
  isOpen,
  onClose,
  onConfirm,
  parchis,
  startDate,
  endDate
}: PayParchiModalProps) {
  const [cashAccountId, setCashAccountId] = useState<number>(0);
  const [cashAccounts, setCashAccounts] = useState<SearchAccountResult[]>([]);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const totalAmount = parchis.reduce((sum, p) => sum + p.parchiAmount, 0);
  const numberOfPayments = Math.ceil(parchis.length / 5);
  const REQUIRED_CONFIRMATION = 'CREATE PAYMENTS';

  useEffect(() => {
    if (isOpen) {
      loadCashAccounts();
      setConfirmationText('');
      setCashAccountId(0);
    }
  }, [isOpen]);

  const loadCashAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const accounts = await accountsApi.getAccountsByCodePrefix('110');
      setCashAccounts(accounts);
    } catch (error) {
      console.error('Failed to load cash accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleConfirm = async () => {
    if (!cashAccountId || confirmationText !== REQUIRED_CONFIRMATION) return;
    
    setLoading(true);
    try {
      await onConfirm(cashAccountId, confirmationText);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  const isConfirmEnabled = cashAccountId > 0 && confirmationText === REQUIRED_CONFIRMATION;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Parchi Payments</h2>
              <p className="text-blue-100 text-sm">Bulk payment creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Suppliers</div>
              <div className="text-2xl font-bold text-blue-900">{parchis.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">Payments to Create</div>
              <div className="text-2xl font-bold text-purple-900">{numberOfPayments}</div>
              <div className="text-xs text-purple-600 mt-1">5 suppliers per voucher</div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Payment Period</div>
            <div className="text-gray-900 font-semibold">
              {formatDate(startDate)} to {formatDate(endDate)}
            </div>
          </div>

          {/* Cash Account Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Select Cash Account <span className="text-red-500">*</span>
            </label>
            {loadingAccounts ? (
              <div className="text-sm text-gray-500">Loading accounts...</div>
            ) : (
              <select
                value={cashAccountId}
                onChange={(e) => setCashAccountId(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>-- Select Cash Account --</option>
                {cashAccounts.map(account => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountCode} - {account.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Supplier Preview */}
          <div>
            <div className="text-sm font-bold text-gray-900 mb-3">Suppliers to be Paid</div>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Supplier</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Khata</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parchis.map((parchi, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900">{parchi.accountName}</td>
                      <td className="px-3 py-2 text-gray-600">{parchi.khataNumber}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(parchi.parchiAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-amber-900 mb-1">Important Notice</div>
              <ul className="text-amber-800 space-y-1 list-disc list-inside">
                <li>This will create {numberOfPayments} cash payment voucher(s)</li>
                <li>Each voucher will contain up to 5 supplier accounts</li>
                <li>Journal entries will be created automatically</li>
                <li>This action cannot be undone automatically</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Type "{REQUIRED_CONFIRMATION}" to confirm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              placeholder={REQUIRED_CONFIRMATION}
              className={`w-full px-4 py-3 border-2 rounded-lg font-mono font-bold ${
                confirmationText === REQUIRED_CONFIRMATION
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            />
            {confirmationText && confirmationText !== REQUIRED_CONFIRMATION && (
              <p className="text-xs text-red-600 mt-1">Text doesn't match. Please type exactly as shown.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || loading}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              isConfirmEnabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create {numberOfPayments} Payment{numberOfPayments > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}