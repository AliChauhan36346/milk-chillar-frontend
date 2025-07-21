'use client';
import { useState } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

type AccountFormData = {
  name: string;
  financial_statement_component?: string;
  main_account_code?: string;
};

type AccountFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  type: 'main' | 'sub';
  mainAccounts?: Array<{
    main_account_id: number;
    main_account_code: string;
    name: string;
  }>;
};

export function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  mainAccounts = []
}: AccountFormModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    financial_statement_component: '',
    main_account_code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New {type === 'main' ? 'Main Account' : 'Sub Account'}
            </h3>
            <button onClick={onClose} className="text-white hover:text-blue-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'main' && (
            <div>
              <Label htmlFor="financial_statement_component">Financial Statement Component</Label>
              <Select
                value={formData.financial_statement_component || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, financial_statement_component: value }))}
                options={[
                  { value: 'Assets', label: 'Assets' },
                  { value: 'Liabilities', label: 'Liabilities' },
                  { value: 'Equity', label: 'Equity' },
                  { value: 'Revenue', label: 'Revenue' },
                  { value: 'Expenses', label: 'Expenses' }
                ]}
                placeholder="Select component"
              />
            </div>
          )}

          {type === 'sub' && (
            <div>
              <Label htmlFor="main_account">Main Account</Label>
              <Select
                value={formData.main_account_code || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, main_account_code: value }))}
                options={mainAccounts.map(acc => ({
                  value: acc.main_account_code,
                  label: acc.name
                }))}
                placeholder="Select main account"
              />
            </div>
          )}

          <div>
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter account name"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 