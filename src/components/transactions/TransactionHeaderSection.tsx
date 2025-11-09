// components/transactions/TransactionHeaderSection.tsx
'use client';
import { SearchAccountResult } from '@/lib/api/accounts';
import { TransactionType } from './TransactionTypeToggle';

interface TransactionHeaderSectionProps {
  transactionType: TransactionType;
  formData: {
    paymentDate: string;
    accountId: number;
    jobDescription: string;
    remarks: string;
    instrumentNo?: string;
    instrumentDate?: string;
  };
  accounts: SearchAccountResult[];
  errors: any;
  onFieldChange: (field: string, value: any) => void;
  accountLabel?: string;
}

export function TransactionHeaderSection({
  transactionType,
  formData,
  accounts,
  errors,
  onFieldChange,
  accountLabel = 'Account'
}: TransactionHeaderSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div>
          <label className="text-slate-700 font-semibold mb-2 block">
            Transaction Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) => onFieldChange('paymentDate', e.target.value)}
            className={`w-full p-3 border-2 rounded-lg text-sm font-medium shadow-sm ${
              errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
            } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
          />
        </div>

        <div>
          <label className="text-slate-700 font-semibold mb-2 block">
            {accountLabel} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.accountId || ''}
            onChange={(e) => onFieldChange('accountId', Number(e.target.value))}
            className={`w-full p-3 border-2 rounded-lg text-sm font-medium shadow-sm ${
              errors.accountId ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
            } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
          >
            <option value="">Select account...</option>
            {accounts.map(account => (
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
            onChange={(e) => onFieldChange('jobDescription', e.target.value)}
            className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="e.g., Office rent payment..."
          />
        </div>

        <div>
          <label className="text-slate-700 font-semibold mb-2 block">Remarks</label>
          <input
            type="text"
            value={formData.remarks}
            onChange={(e) => onFieldChange('remarks', e.target.value)}
            className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Optional remarks..."
          />
        </div>
      </div>

      {/* Bank-specific fields */}
      {transactionType === 'bank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-700 font-semibold mb-2 block">
              Instrument Number
            </label>
            <input
              type="text"
              value={formData.instrumentNo || ''}
              onChange={(e) => onFieldChange('instrumentNo', e.target.value)}
              className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="e.g., CHQ-12345..."
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold mb-2 block">
              Instrument Date
            </label>
            <input
              type="date"
              value={formData.instrumentDate || ''}
              onChange={(e) => onFieldChange('instrumentDate', e.target.value)}
              className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}