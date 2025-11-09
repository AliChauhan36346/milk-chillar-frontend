// components/transactions/TransactionLineItem.tsx
'use client';
import { Trash2 } from 'lucide-react';
import { AccountSearchInline } from '@/components/forms/AccountSearchInline';

interface TransactionLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
}

interface TransactionLineItemProps {
  line: TransactionLine;
  index: number;
  errors: any;
  canDelete: boolean;
  onFieldChange: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
}

export function TransactionLineItem({
  line,
  index,
  errors,
  canDelete,
  onFieldChange,
  onDelete
}: TransactionLineItemProps) {
  return (
    <div className="p-2 hover:bg-gray-50">
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
            onChange={(account) => onFieldChange(index, 'account', account)}
            error={errors[`line_${index}_account`]}
            placeholder="Search account..."
          />
        </div>
        <div className="col-span-4">
          <input
            type="text"
            value={line.description}
            onChange={(e) => onFieldChange(index, 'description', e.target.value)}
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
              onChange={(e) => onFieldChange(index, 'amount', Number(e.target.value))}
              className={`w-full pl-6 pr-2 py-2 border rounded text-sm text-right ${
                errors[`line_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        <div className="col-span-1 flex justify-center">
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(index)}
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
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(index)}
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
          onChange={(account) => onFieldChange(index, 'account', account)}
          error={errors[`line_${index}_account`]}
          placeholder="Search account..."
        />
        
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={line.description}
            onChange={(e) => onFieldChange(index, 'description', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Description..."
          />
          <div className="relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₨</span>
            <input
              type="number"
              value={line.amount || ''}
              onChange={(e) => onFieldChange(index, 'amount', Number(e.target.value))}
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
  );
}