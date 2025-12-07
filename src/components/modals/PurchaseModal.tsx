// components/modals/PurchaseModal.tsx
'use client';
import { Sun, Moon, Save, UserPlus, Calendar, Edit } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ExpenseAccount } from '@/lib/api/purchases';
import { BaseModal } from '@/components/ui/Modal/BaseModal';

type PurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => Promise<void> | void;
  supplier: {
    id: number;
    name: string;
    code: string;
    rate: number;
  };
  availableTimes: ('morning' | 'evening')[];
  isAdmin: boolean;
  expenseAccounts: ExpenseAccount[];
  selectedExpenseAccount: number | null;
  isUpdate: boolean;
  updateData?: {
    time: 'morning' | 'evening';
    purchaseId: number;
    currentQuantity: number;
  };
  initialDate: string;
};

export default function PurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  supplier,
  availableTimes,
  isAdmin,
  expenseAccounts,
  selectedExpenseAccount,
  isUpdate,
  updateData,
  initialDate
}: PurchaseModalProps) {
  const [morningQuantity, setMorningQuantity] = useState<number | ''>('');
  const [eveningQuantity, setEveningQuantity] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [expenseAccountId, setExpenseAccountId] = useState<number | null>(selectedExpenseAccount);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values
  useEffect(() => {
    if (isUpdate && updateData) {
      if (updateData.time === 'morning') {
        setMorningQuantity(updateData.currentQuantity);
        setEveningQuantity('');
      } else {
        setEveningQuantity(updateData.currentQuantity);
        setMorningQuantity('');
      }
      setRate(supplier.rate);
    } else {
      setMorningQuantity('');
      setEveningQuantity('');
      setRate(supplier.rate);
    }

    setSelectedDate(initialDate);
    setExpenseAccountId(selectedExpenseAccount);
  }, [isUpdate, updateData, supplier.rate, selectedExpenseAccount, initialDate]);

  // Calculate total amounts
  const totals = useMemo(() => {
    const currentRate = Number(rate) || 0;
    const morningQty = Number(morningQuantity) || 0;
    const eveningQty = Number(eveningQuantity) || 0;

    return {
      morningAmount: morningQty * currentRate,
      eveningAmount: eveningQty * currentRate,
      totalAmount: (morningQty + eveningQty) * currentRate
    };
  }, [morningQuantity, eveningQuantity, rate]);

  // Determine modal title and styling
  const { title, primaryColor, bgColor, icon } = useMemo(() => {
    let computedTitle = '';
    let computedColor = '';
    let computedBg = '';
    let computedIcon = null;

    if (isUpdate && updateData) {
      const timeTitle = updateData.time === 'morning' ? 'Morning' : 'Evening';
      computedTitle = `Update ${timeTitle} Purchase`;
      computedColor = updateData.time === 'morning' ? 'blue' : 'purple';
      computedBg = updateData.time === 'morning' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600';
      computedIcon = updateData.time === 'morning' ? <Sun size={18} /> : <Moon size={18} />;
    } else if (availableTimes.length === 1) {
      const timeTitle = availableTimes[0] === 'morning' ? 'Morning' : 'Evening';
      computedTitle = `New ${timeTitle} Purchase`;
      computedColor = availableTimes[0] === 'morning' ? 'blue' : 'purple';
      computedBg = availableTimes[0] === 'morning' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600';
      computedIcon = availableTimes[0] === 'morning' ? <Sun size={18} /> : <Moon size={18} />;
    } else {
      computedTitle = 'New Purchase Entry';
      computedColor = 'green';
      computedBg = 'bg-green-50 text-green-600';
      computedIcon = (
        <div className="flex gap-0.5">
          <Sun size={14} className="text-yellow-500" />
          <Moon size={14} className="text-purple-500" />
        </div>
      );
    }

    return { title: computedTitle, primaryColor: computedColor, bgColor: computedBg, icon: computedIcon };
  }, [isUpdate, updateData, availableTimes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const morningQty = Number(morningQuantity) || 0;
    const eveningQty = Number(eveningQuantity) || 0;

    if (isUpdate) {
      const quantityToCheck = updateData?.time === 'morning' ? morningQty : eveningQty;
      if (!quantityToCheck || quantityToCheck <= 0) {
        alert('Please enter a valid quantity');
        return;
      }
    } else {
      if (morningQty <= 0 && eveningQty <= 0) {
        alert('Please enter at least one valid quantity');
        return;
      }
    }

    const submitData = {
      date: selectedDate,
      morningQuantity: morningQty > 0 ? morningQty : undefined,
      eveningQuantity: eveningQty > 0 ? eveningQty : undefined,
      rate: isAdmin ? Number(rate) || undefined : undefined,
      expenseAccountId: expenseAccountId || undefined
    };

    try {
      setIsSubmitting(true);
      await onSubmit(submitData);
    } catch (error: any) {
      console.error('Error submitting purchase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputColorClasses = (time: 'morning' | 'evening') => {
    return time === 'morning'
      ? 'border-blue-300 bg-blue-50 focus:ring-blue-500'
      : 'border-purple-300 bg-purple-50 focus:ring-purple-500';
  };

  const getButtonColorClasses = () => {
    if (primaryColor === 'blue') return 'bg-blue-600 hover:bg-blue-700';
    if (primaryColor === 'purple') return 'bg-purple-600 hover:bg-purple-700';
    return 'bg-green-600 hover:bg-green-700';
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Enter purchase details"
      icon={icon}
      iconClassName={bgColor}
    >
      {/* Supplier Details */}
      <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="font-bold text-sm text-gray-900">{supplier.name}</p>
          <p className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-block mt-1">Code: {supplier.code}</p>
          {isAdmin && <span className="text-xs text-gray-500 ml-2">Rate: Rs{supplier.rate}/L</span>}
        </div>

        <div className="relative group">
          <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 group-focus-within:text-blue-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-6 pr-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            required
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Quantity Inputs - Side by Side */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Milk Quantities (Ltrs)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Morning Quantity */}
            {availableTimes.includes('morning') && (
              <div className={`p-2 rounded-xl border ${getInputColorClasses('morning')}`}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-yellow-500" />
                  Morning
                  {isUpdate && updateData?.time === 'morning' && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1 ml-auto bg-white px-1 rounded shadow-sm">
                      <Edit className="w-2 h-2" />
                      Edit
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={morningQuantity}
                  onChange={(e) => setMorningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all text-sm font-semibold`}
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  disabled={isUpdate && updateData?.time === 'evening'}
                />
                {isAdmin && totals.morningAmount > 0 && (
                  <div className="mt-1.5 text-right">
                    <p className="text-[10px] text-blue-800 font-bold bg-blue-100/50 inline-block px-1.5 py-0.5 rounded">
                      Rs{totals.morningAmount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Evening Quantity */}
            {availableTimes.includes('evening') && (
              <div className={`p-2 rounded-xl border ${getInputColorClasses('evening')}`}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Moon className="w-3 h-3 text-purple-500" />
                  Evening
                  {isUpdate && updateData?.time === 'evening' && (
                    <span className="text-[10px] text-purple-600 flex items-center gap-1 ml-auto bg-white px-1 rounded shadow-sm">
                      <Edit className="w-2 h-2" />
                      Edit
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={eveningQuantity}
                  onChange={(e) => setEveningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all text-sm font-semibold`}
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  disabled={isUpdate && updateData?.time === 'morning'}
                />
                {isAdmin && totals.eveningAmount > 0 && (
                  <div className="mt-1.5 text-right">
                    <p className="text-[10px] text-purple-800 font-bold bg-purple-100/50 inline-block px-1.5 py-0.5 rounded">
                      Rs{totals.eveningAmount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Placeholder for single time updates */}
            {isUpdate && updateData && availableTimes.length === 1 && (
              <div className="p-2 rounded-xl border border-gray-100 bg-gray-50/50 opacity-60">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                  {updateData.time === 'morning' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  {updateData.time === 'morning' ? 'Evening' : 'Morning'}
                </label>
                <input disabled className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-sm" placeholder="N/A" />
              </div>
            )}
          </div>
        </div>

        {/* Admin Fields */}
        {isAdmin && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Rate per Liter
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rs</span>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Expense Account
              </label>
              <select
                value={expenseAccountId || ''}
                onChange={(e) => setExpenseAccountId(Number(e.target.value))}
                className="w-full py-2 px-2 bg-white border border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
                required
              >
                <option value="">Select Account</option>
                {expenseAccounts.map(account => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountCode} - {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isAdmin && totals.totalAmount > 0 && (
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
            <span className="text-xs font-semibold text-gray-600">Total Amount</span>
            <span className="text-base font-bold text-green-600">Rs{totals.totalAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${getButtonColorClasses()} ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isUpdate ? 'Updating...' : 'Adding...'}
              </>
            ) : isUpdate ? (
              <>
                <Save className="w-4 h-4" />
                Update
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Purchase
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}