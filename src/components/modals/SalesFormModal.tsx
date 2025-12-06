// components/modals/SalesFormModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Plus, X, User, Calendar, Droplet, Percent, DollarSign, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type BuyerFormData = {
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
  rate: number;
  amount: number;
  amountReceived: number;
  revenueAccountId: number;
  date: string;
};

type RevenueAccount = {
  accountId: number;
  accountName: string;
  accountCode: string;
};

type BuyerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuyerFormData) => void;
  initialData?: Omit<BuyerFormData, 'amount' | 'netLiters'> & {
    amount?: number;
    netLiters?: number;
  };
  buyerName: string;
  buyerId: string;
  date: string;
  isAdmin: boolean;
  isFromAddedList: boolean;
  revenueAccounts: RevenueAccount[];
  formValues: {
    grossLiters: number;
    lr: number;
    fat: number;
    netLiters: number;
    rate: number;
    amount: number;
    amountReceived: number;
    revenueAccountId: number;
  };
  onInputChange: (field: string, value: number) => void;
};

export function SalesFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  buyerName,
  buyerId,
  date: initialDate,
  isAdmin,
  isFromAddedList,
  revenueAccounts,
  formValues,
  onInputChange
}: BuyerFormModalProps) {
  // Helper: show empty string instead of "0"
  const numToStr = (v?: number) => (typeof v === 'number' && v !== 0 ? v.toString() : '');

  const [formData, setFormData] = useState({
    grossLiters: numToStr(formValues.grossLiters),
    lr: numToStr(formValues.lr),
    fat: numToStr(formValues.fat),
    netLiters: numToStr(formValues.netLiters),
    rate: numToStr(formValues.rate),
    amount: numToStr(formValues.amount),
    amountReceived: numToStr(formValues.amountReceived),
    revenueAccountId: numToStr(formValues.revenueAccountId),
    date: initialDate
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isUpdateMode = isFromAddedList;

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false); // Reset loading state when modal opens
      setFormData({
        grossLiters: numToStr(formValues.grossLiters),
        lr: numToStr(formValues.lr),
        fat: numToStr(formValues.fat),
        netLiters: numToStr(formValues.netLiters),
        rate: numToStr(formValues.rate),
        amount: numToStr(formValues.amount),
        amountReceived: numToStr(formValues.amountReceived),
        revenueAccountId: numToStr(formValues.revenueAccountId),
        date: initialDate
      });
    }
  }, [isOpen, formValues, initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name !== 'revenueAccountId') {
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      onInputChange(name, numValue);
    } else {
      const id = parseInt(value, 10) || 0;
      onInputChange(name, id);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Validation
  //   const missing: string[] = [];
  //   if (formData.grossLiters.trim() === '') missing.push('Gross Liters');
  //   if (formData.lr.trim() === '') missing.push('LR');
  //   if (formData.fat.trim() === '') missing.push('Fat %');
  //   if (formData.netLiters.trim() === '') missing.push('Net Liters');
  //   if (isAdmin && formData.rate.trim() === '') missing.push('Rate per Liter');
  //   if (formData.revenueAccountId.trim() === '') missing.push('Revenue Account');
  //   if (formData.date.trim() === '') missing.push('Date');

  //   if (missing.length > 0) {
  //     alert('Please fill the following fields: ' + missing.join(', '));
  //     return;
  //   }

  //   const revenueAccountId = parseInt(formData.revenueAccountId, 10);
  //   if (isNaN(revenueAccountId)) return;

  //   setIsSubmitting(true);

  //   // Simulate a small delay if needed or just proceed. 
  //   // Since onSubmit is synchronous in props, we wrap it to ensure UI updates before processing if needed, 
  //   // but React batching usually handles it.
  //   // We try/catch just in case valid async logic is eventually added up stream.
  //   try {
  //     await onSubmit({
  //       grossLiters: formValues.grossLiters,
  //       lr: formValues.lr,
  //       fat: formValues.fat,
  //       netLiters: formValues.netLiters,
  //       rate: formValues.rate,
  //       amount: formValues.amount,
  //       amountReceived: formValues.amountReceived,
  //       revenueAccountId: revenueAccountId,
  //       date: formData.date
  //     });
  //     // The parent usually closes the modal on success (via onClose), so we don't need to manually setIsSubmitting(false) 
  //     // UNLESS the parent logic fails but keeps the modal, or if we want to be safe.
  //     // If the parent DOES NOT close the modal on success (unlikely), we'd want to stop spinning.
  //     // But typically, a successful submit unmounts this component.
  //   } catch (error) {
  //     console.error("Submission error", error);
  //     setIsSubmitting(false); // Stop spinning on error
  //     alert("Failed to save record. Please try again.");
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const missing: string[] = [];
    if (formData.grossLiters.trim() === '') missing.push('Gross Liters');
    if (formData.lr.trim() === '') missing.push('LR');
    if (formData.fat.trim() === '') missing.push('Fat %');
    if (formData.netLiters.trim() === '') missing.push('Net Liters');
    if (isAdmin && formData.rate.trim() === '') missing.push('Rate per Liter');
    if (formData.revenueAccountId.trim() === '') missing.push('Revenue Account');
    if (formData.date.trim() === '') missing.push('Date');

    if (missing.length > 0) {
      alert('Please fill the following fields: ' + missing.join(', '));
      return;
    }

    const revenueAccountId = parseInt(formData.revenueAccountId, 10);
    if (isNaN(revenueAccountId)) return;

    setIsSubmitting(true);

    try {
      // Call onSubmit and wait for it to complete
      await onSubmit({
        grossLiters: formValues.grossLiters,
        lr: formValues.lr,
        fat: formValues.fat,
        netLiters: formValues.netLiters,
        rate: formValues.rate,
        amount: formValues.amount,
        amountReceived: formValues.amountReceived,
        revenueAccountId: revenueAccountId,
        date: formData.date
      });
      // If successful, parent will close the modal
    } catch (error) {
      // If error, stop loading and keep modal open
      console.error("Submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100/50">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={clsx("p-1.5 rounded-xl", isUpdateMode ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")}>
              {isUpdateMode ? <CheckCircle size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {isUpdateMode ? 'Update Sale Record' : 'New Sale Entry'}
              </h3>
              <p className="text-[10px] text-gray-500">Enter daily milk collection details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Buyer Info Bar */}
        <div className="bg-gray-50/50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
              {buyerName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">{buyerName}</h4>
              <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1 py-0.5 rounded border border-blue-100">ID: {buyerId}</span>
            </div>
          </div>

          <div className="relative group">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 group-focus-within:text-blue-500" />
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="pl-6 pr-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Gross Liters</label>
              <div className="relative">
                <input
                  type="number"
                  name="grossLiters"
                  value={formData.grossLiters}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">L</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Expected LR</label>
              <div className="relative">
                <input
                  type="number"
                  name="lr"
                  value={formData.lr}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">LR</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Fat Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="w-full pl-3 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Net Liters</label>
              <div className="relative">
                <input
                  type="number"
                  name="netLiters"
                  value={formData.netLiters}
                  readOnly
                  className="w-full pl-3 pr-6 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-medium">Net</span>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-3 pt-1 border-t border-gray-50 animate-in slide-in-from-bottom-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Revenue Account</label>
              <select
                name="revenueAccountId"
                value={formData.revenueAccountId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all"
              >
                <option value="">Select Account</option>
                {revenueAccounts.map(account => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountName} ({account.accountCode})
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Rate / Liter</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[10px]">₨</span>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[10px]">₨</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      readOnly
                      className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Amount Received</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-[10px]">₨</span>
                <input
                  type="number"
                  name="amountReceived"
                  value={formData.amountReceived}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 bg-green-50/50 border border-green-200 rounded-lg text-base font-bold text-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-50 outline-none transition-all placeholder:text-green-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
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
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isUpdateMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isUpdateMode ? 'Update Record' : 'Save Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


