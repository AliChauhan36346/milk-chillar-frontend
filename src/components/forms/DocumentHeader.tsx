import React from 'react';
import { Save, ArrowLeft } from 'lucide-react';

interface DocumentHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  documentNo?: string | number;
  totalAmount: number;
  itemsCount: number;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
  readOnly?: boolean;
}

export default function DocumentHeader({
  title,
  subtitle,
  documentNo,
  totalAmount,
  itemsCount,
  onCancel,
  onSave,
  saving = false,
  readOnly = false
}: DocumentHeaderProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PK', { minimumFractionDigits: 2 });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {title}
              {documentNo && (
                <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-base font-medium">
                  #{documentNo}
                </span>
              )}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-emerald-600">₨ {formatCurrency(totalAmount)}</div>
          <div className="text-sm text-slate-500">{itemsCount} line{itemsCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex gap-3 justify-end mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-white hover:border-slate-400 text-sm font-medium transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || totalAmount <= 0}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold transition-all duration-200 shadow-md"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}