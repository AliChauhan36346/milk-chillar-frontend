// components/transactions/TransactionLinesTable.tsx
'use client';
import { Plus } from 'lucide-react';
import { TransactionLineItem } from './TransactionLineItem';

interface TransactionLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
}

interface TransactionLinesTableProps {
  lines: TransactionLine[];
  errors: any;
  totalAmount: number;
  onAddLine: () => void;
  onUpdateLine: (index: number, field: string, value: any) => void;
  onDeleteLine: (index: number) => void;
  tableTitle?: string;
}

export function TransactionLinesTable({
  lines,
  errors,
  totalAmount,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  tableTitle = 'Transaction Lines'
}: TransactionLinesTableProps) {
  return (
    <div className="p-0">
      {/* Table Header */}
      <div className="border-b border-gray-300 bg-gray-100">
        <div className="flex items-center justify-between p-2">
          <span className="text-sm font-medium text-gray-700">{tableTitle}</span>
          <button
            type="button"
            onClick={onAddLine}
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
        {lines.map((line, index) => (
          <TransactionLineItem
            key={index}
            line={line}
            index={index}
            errors={errors}
            canDelete={lines.length > 1}
            onFieldChange={onUpdateLine}
            onDelete={onDeleteLine}
          />
        ))}
      </div>

      {/* Total Row */}
      <div className="border-t-2 border-gray-300 bg-gray-50 p-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total ({lines.length} lines)
          </span>
          <span className="text-lg font-bold text-gray-900">
            ₨ {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}