// components/transactions/TransactionTypeToggle.tsx
'use client';

export type TransactionType = 'cash' | 'bank';

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
  cashLabel?: string;
  bankLabel?: string;
  disabled?: boolean;
}

export function TransactionTypeToggle({
  value,
  onChange,
  cashLabel = 'Cash',
  bankLabel = 'Bank',
  disabled = false
}: TransactionTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border-2 border-blue-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange('cash')}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          value === 'cash'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {cashLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('bank')}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
          value === 'bank'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {bankLabel}
      </button>
    </div>
  );
}