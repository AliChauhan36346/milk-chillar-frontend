// components/transactions/TransactionFormHeader.tsx
'use client';
import { Save } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';

interface TransactionFormHeaderProps {
  title: string;
  voucherNo?: number | null;
  totalAmount: number;
  linesCount: number;
  isEditing: boolean;
  isSaving: boolean;
  backHref: string;
  onSave: () => void;
}

export function TransactionFormHeader({
  title,
  voucherNo,
  totalAmount,
  linesCount,
  isEditing,
  isSaving,
  backHref,
  onSave
}: TransactionFormHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <BackButton href={backHref} />
        <h1 className="text-lg font-bold text-gray-900">
          {isEditing ? `Edit ${title}` : title}
          {!isEditing && voucherNo && (
            <span className="ml-2 text-blue-600">#{voucherNo}</span>
          )}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">₨ {totalAmount.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{linesCount} lines</div>
        </div>
        <Button 
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}