import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AccountSearch from './AccountSearch';

export interface TransactionLine {
  accountId: number;
  accountCode: string;
  accountName: string;
  description: string;
  amount: number;
}

interface TransactionLinesProps {
  lines: TransactionLine[];
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onUpdateLine: (index: number, field: string, value: any) => void;
  errors?: { [key: string]: string };
  accountFilter?: {
    codePrefix?: string;
    type?: string;
  };
  readOnly?: boolean;
}

export default function TransactionLines({
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  errors = {},
  accountFilter,
  readOnly = false
}: TransactionLinesProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PK', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50">
        <div className="flex items-center justify-between p-3">
          <span className="text-base font-bold text-slate-800">Transaction Lines</span>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:block">
                Ctrl+Enter to add line
              </span>
              <button
                type="button"
                onClick={onAddLine}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Line
              </button>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 pb-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
          <div className="col-span-4">Account</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Amount</div>
          <div className="col-span-1 text-center">Action</div>
        </div>
      </div>

      {/* Lines */}
      <div className="divide-y divide-gray-200">
        {lines.map((line, index) => (
          <div key={index} className="p-2 hover:bg-gray-50">
            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <AccountSearch
                  value={line.accountId ? { 
                    accountId: line.accountId, 
                    accountCode: line.accountCode, 
                    accountName: line.accountName,
                    name: line.accountName 
                  } : null}
                  onChange={(account) => onUpdateLine(index, 'account', account)}
                  error={errors[`line_${index}_account`]}
                  placeholder="Search account..."
                  filter={accountFilter}
                />
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) => onUpdateLine(index, 'description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Description..."
                  readOnly={readOnly}
                />
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₨</span>
                  <input
                    type="number"
                    value={line.amount || ''}
                    onChange={(e) => onUpdateLine(index, 'amount', Number(e.target.value))}
                    className={`w-full pl-6 pr-2 py-2 border rounded text-sm text-right ${
                      errors[`line_${index}_amount`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    readOnly={readOnly}
                  />
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                {!readOnly && lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLine(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between bg-slate-100 -m-3 p-3 rounded-t-lg">
                <span className="text-sm font-bold text-slate-700">Line {index + 1}</span>
                {!readOnly && lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveLine(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <AccountSearch
                value={line.accountId ? { 
                  accountId: line.accountId, 
                  accountCode: line.accountCode, 
                  accountName: line.accountName,
                  name: line.accountName 
                } : null}
                onChange={(account) => onUpdateLine(index, 'account', account)}
                error={errors[`line_${index}_account`]}
                placeholder="Search account..."
                filter={accountFilter}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) => onUpdateLine(index, 'description', e.target.value)}
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Description..."
                  readOnly={readOnly}
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">₨</span>
                  <input
                    type="number"
                    value={line.amount || ''}
                    onChange={(e) => onUpdateLine(index, 'amount', Number(e.target.value))}
                    className={`w-full pl-8 pr-3 py-3 border-2 rounded-lg text-sm text-right font-bold shadow-sm ${
                      errors[`line_${index}_amount`] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                    } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`}
                    placeholder="0.00"
                    step="0.01"
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-slate-600">
              Total ({lines.length} line{lines.length !== 1 ? 's' : ''})
            </span>
            <div className="text-xs text-slate-500 mt-1">
              All amounts in PKR
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-emerald-700">
              ₨ {formatCurrency(lines.reduce((sum, line) => sum + (line.amount || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}