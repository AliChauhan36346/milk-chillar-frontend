// components/modals/ChillarReceiveModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Plus, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { BaseModal } from '@/components/ui/Modal/BaseModal';

type DodhiFormData = {
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
};

type DodhiFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DodhiFormData) => Promise<void> | void;
  initialData?: DodhiFormData;
  dodhiName: string;
  dodhiId: string;
  date: string;
  time: string;
  isFromAddedList: boolean;
  formValues: DodhiFormData;
  onInputChange: (field: string, value: number) => void;
};

export function DodhiFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  dodhiName,
  dodhiId,
  date,
  time,
  isFromAddedList,
  formValues,
  onInputChange
}: DodhiFormModalProps) {
  const isUpdateMode = isFromAddedList;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formValues);
      // Parent usually closes the modal, so we rely on that.
    } catch (error) {
      console.error("Submission error", error);
      alert("Failed to save record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdateMode ? 'Update Record' : 'Add New Record'}
      subtitle="Enter daily collection details"
      icon={isUpdateMode ? <CheckCircle size={18} /> : <Plus size={18} />}
      iconClassName={isUpdateMode ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}
    >
      {/* Info Bar */}
      <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
            {dodhiName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">{dodhiName}</h4>
            <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1 py-0.5 rounded border border-blue-100">ID: {dodhiId}</span>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 flex flex-col items-end font-medium">
          <div className="flex items-center gap-1 mb-0.5">
            <Calendar size={12} className="text-gray-400" />
            {new Date(date).toLocaleDateString()}
          </div>
          <span className={clsx("capitalize px-1.5 py-0.5 rounded text-[10px] border", time === 'morning' ? "bg-yellow-50 text-yellow-700 border-yellow-100" : "bg-purple-50 text-purple-700 border-purple-100")}>
            {time}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">

        {/* Gross Liters */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            Gross Liters
          </label>
          <div className="relative">
            <input
              type="number"
              value={formValues.grossLiters || ''}
              onChange={(e) => onInputChange('grossLiters', parseFloat(e.target.value) || 0)}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.00"
              className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">L</span>
          </div>
        </div>

        {/* LR and Fat */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">LR</label>
            <div className="relative">
              <input
                type="number"
                value={formValues.lr || ''}
                onChange={(e) => onInputChange('lr', parseFloat(e.target.value) || 0)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0.00"
                className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">LR</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fat %</label>
            <div className="relative">
              <input
                type="number"
                value={formValues.fat || ''}
                onChange={(e) => onInputChange('fat', parseFloat(e.target.value) || 0)}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="0.00"
                className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Net Liters */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Net Liters</label>
          <div className="relative">
            <input
              type="number"
              value={formValues.netLiters.toFixed(2)}
              readOnly
              className="w-full pl-3 pr-6 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">Net</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-xs transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              "py-2 rounded-lg font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2",
              isUpdateMode
                ? "bg-green-600 hover:bg-green-700 shadow-green-200 hover:shadow-green-300"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300",
              isSubmitting && "opacity-70 cursor-wait"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isUpdateMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isUpdateMode ? 'Update Record' : 'Save Record'
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
