// components/modals/PayParchiModal.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wallet, CheckCircle } from 'lucide-react';
import { ParchiDto } from '@/lib/api/parchi';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';
import { BaseModal } from '@/components/ui/Modal/BaseModal';

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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Parchi Payments"
      subtitle="Bulk payment creation"
      icon={<Wallet size={18} />}
      iconClassName="bg-blue-600 text-white"
      maxWidth="max-w-2xl"
    >
      {/* Content */}
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Suppliers</div>
            <div className="text-2xl font-bold text-blue-900">{parchis.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">Payments</div>
            <div className="text-2xl font-bold text-purple-900">{numberOfPayments}</div>
            <div className="text-xs text-purple-600 mt-1 font-medium bg-purple-100/50 inline-block px-1.5 rounded">5 suppliers / voucher</div>
          </div>
        </div>

        {/* Period Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Payment Period</span>
          <span className="text-gray-900 font-bold bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
            {formatDate(startDate)} <span className="text-gray-400 font-normal px-2">to</span> {formatDate(endDate)}
          </span>
        </div>

        {/* Cash Account Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Select Cash Account <span className="text-red-500">*</span>
          </label>
          {loadingAccounts ? (
            <div className="text-sm text-gray-500 italic">Loading accounts...</div>
          ) : (
            <select
              value={cashAccountId}
              onChange={(e) => setCashAccountId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700 bg-white shadow-sm"
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
          <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-gray-50/50">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Supplier</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Khata</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parchis.map((parchi, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 bg-white">
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{parchi.accountName}</td>
                    <td className="px-4 py-2.5 text-gray-600">{parchi.khataNumber}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                      {formatCurrency(parchi.parchiAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold text-amber-900 mb-1">Important Notice</div>
            <ul className="text-amber-800 space-y-1 list-disc list-inside text-xs font-medium">
              <li>This will create {numberOfPayments} cash payment voucher(s)</li>
              <li>Each voucher will contain up to 5 supplier accounts</li>
              <li>Journal entries will be created automatically</li>
              <li>This action cannot be undone automatically</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Type "{REQUIRED_CONFIRMATION}" to confirm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
            placeholder={REQUIRED_CONFIRMATION}
            className={`w-full px-4 py-3 border-2 rounded-xl font-mono font-bold transition-all ${confirmationText === REQUIRED_CONFIRMATION
                ? 'border-green-500 bg-green-50 text-green-900 focus:ring-green-500'
                : 'border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:ring-2 outline-none`}
          />
          {confirmationText && confirmationText !== REQUIRED_CONFIRMATION && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <AlertTriangle size={12} />
              Text doesn't match. Please type exactly as shown.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isConfirmEnabled || loading}
          className={`px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md text-sm ${isConfirmEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
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
    </BaseModal>
  );
}