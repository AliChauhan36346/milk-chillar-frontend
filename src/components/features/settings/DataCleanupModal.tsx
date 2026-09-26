'use client';

import React, { useState } from 'react';
import { BaseModal } from '@/components/ui/Modal/BaseModal';
import { AlertTriangle, Trash2, ShieldAlert, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import { DataCleanupRequest, DataCleanupResult, executeDataCleanup } from '@/lib/api/maintenance';
import { useToast } from '@/hooks/useToast';

interface DataCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DataCleanupRequest;
  selectedCategoriesSummary: string[];
  totalRecordsEstimate: number;
  onSuccess: (result: DataCleanupResult) => void;
}

export const DataCleanupModal: React.FC<DataCleanupModalProps> = ({
  isOpen,
  onClose,
  request,
  selectedCategoriesSummary,
  totalRecordsEstimate,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [confirmationWord, setConfirmationWord] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmationWord.trim().toUpperCase() === 'RESET';
  const canSubmit = isConfirmed && password.trim().length > 0 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await executeDataCleanup({
        ...request,
        confirmationText: confirmationWord.trim().toUpperCase(),
        password: password.trim(),
      });

      toast({
        title: 'Data Cleanup Completed',
        description: result.message,
        variant: 'success',
      });

      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Data cleanup failed.';
      setError(typeof msg === 'string' ? msg : 'Data cleanup failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Irreversible Data Cleanup"
      subtitle="Verify your administrator credentials before purging records"
      icon={<AlertTriangle className="w-5 h-5" />}
      iconClassName="bg-red-50 text-red-600"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>CAUTION: This action cannot be reversed!</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            You are about to purge records from your dairy database. Please ensure you have backed up any necessary reports prior to proceeding.
          </p>
        </div>

        {/* Scope Summary */}
        <div className="p-3 bg-gray-50 border border-gray-200/70 rounded-xl space-y-2">
          <div className="text-xs font-semibold text-gray-800 flex items-center justify-between">
            <span>Selected Categories to Clear:</span>
            <span className="text-[11px] text-gray-500 font-normal">~{totalRecordsEstimate} records</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCategoriesSummary.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-700"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Preserve Accounts Indicator */}
          <div className="pt-2 border-t border-gray-200/60 mt-2">
            {request.preserveAccounts ? (
              <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Accounts & Master Entities Preserved</strong>
                  <span className="text-[11px] text-emerald-700">
                    Chart of Accounts, Suppliers, Buyers, Staff, and Centers will NOT be deleted. Their ledger balances will reset to 0.00.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-800 bg-red-50/70 p-2 rounded-lg border border-red-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Complete Wipe (Accounts Deleted)</strong>
                  <span className="text-[11px] text-red-700">
                    All Suppliers, Buyers, Staff records, and Accounts will be permanently deleted. Only system logins & roles are kept.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Typed Confirmation Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Type <span className="font-mono text-red-600 font-bold">RESET</span> to confirm:
          </label>
          <input
            type="text"
            required
            value={confirmationWord}
            onChange={(e) => setConfirmationWord(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono uppercase"
            placeholder="Type RESET"
          />
        </div>

        {/* Administrator Password Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Current Administrator Password:
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none font-mono"
              placeholder="Enter your login password"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Permanently Clear Data
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
