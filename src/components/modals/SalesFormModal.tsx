// components/modals/SalesFormModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Plus, X, User, Calendar, Droplet, Percent, DollarSign } from 'lucide-react';

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

  const isUpdateMode = isFromAddedList;

  useEffect(() => {
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
  }, [formValues, initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update the string values in formData
    setFormData(prev => ({ ...prev, [name]: value }));

    // Only call onInputChange for numeric fields except revenueAccountId (handled as select)
    if (name !== 'revenueAccountId') {
      // If user clears the field, treat as empty -> send 0 to parent (keeps parent's numeric model consistent)
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      onInputChange(name, numValue);
    } else {
      // revenueAccountId comes from select: ensure number
      const id = parseInt(value, 10) || 0;
      onInputChange(name, id);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields are not empty (don't allow save when empty)
    const missing: string[] = [];
    if (formData.grossLiters.trim() === '') missing.push('Gross Liters');
    if (formData.lr.trim() === '') missing.push('LR');
    if (formData.fat.trim() === '') missing.push('Fat %');
    if (formData.netLiters.trim() === '') missing.push('Net Liters');
    if (isAdmin && formData.rate.trim() === '') missing.push('Rate per Liter');
    if (formData.revenueAccountId.trim() === '') missing.push('Revenue Account');
    if (formData.date.trim() === '') missing.push('Date');

    if (missing.length > 0) {
      alert('Please fill the following fields before saving: ' + missing.join(', '));
      return;
    }

    // Convert revenue account ID from string to number
    const revenueAccountId = parseInt(formData.revenueAccountId, 10);
    if (isNaN(revenueAccountId)) {
      console.error('Invalid revenue account ID');
      return;
    }

    onSubmit({
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-3 ${isUpdateMode ? 'bg-white' : 'bg-blue-600 text-white'}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isUpdateMode ? 'text-gray-800' : 'text-white'}`}>
              {isUpdateMode ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Update Sale
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Sale
                </>
              )}
            </h3>
            <button onClick={onClose} className={isUpdateMode ? "text-gray-500 hover:text-gray-700" : "text-white hover:text-blue-200"}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Buyer Info */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{buyerName}</h4>
              <p className="text-sm text-gray-600">ID: {buyerId}</p>
            </div>
          </div>

          {/* Compact Date Field */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="flex-1 p-1 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Compact Input Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Gross Liters */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Gross Liters</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="px-2 bg-gray-100 text-gray-500">
                  <Droplet className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  name="grossLiters"
                  value={formData.grossLiters}
                  onChange={handleChange}
                  className="flex-1 p-1 text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* LR */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">LR</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="px-2 bg-gray-100 text-gray-500">
                  <Percent className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  name="lr"
                  value={formData.lr}
                  onChange={handleChange}
                  className="flex-1 p-1 text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Fat %</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="px-2 bg-gray-100 text-gray-500">
                  <Percent className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  name="fat"
                  value={formData.fat}
                  onChange={handleChange}
                  className="flex-1 p-1 text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Net Liters */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Net Liters</label>
              <input
                type="number"
                name="netLiters"
                value={formData.netLiters}
                readOnly
                className="w-full p-1 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
            </div>
          </div>

          {/* Rate (admin only) */}
          {isAdmin && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Rate per Liter (PKR)</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="px-2 bg-gray-100 text-gray-500">Rs</span>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className="flex-1 p-1 text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Revenue Account */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Revenue Account</label>
            <select
              name="revenueAccountId"
              value={formData.revenueAccountId}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select account</option>
              {revenueAccounts.map(account => (
                <option key={account.accountId} value={account.accountId}>
                  {account.accountName} ({account.accountCode})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Amount Received (PKR)</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-2 bg-gray-100 text-gray-700 font-medium">Rs</span>
              <input
                type="number"
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleChange}
                className="flex-1 p-1 text-sm focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total Amount (Admin only) */}
          {isAdmin && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Total Amount (PKR)</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <span className="px-2 bg-gray-100 text-gray-700 font-medium">Rs</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  readOnly
                  className="flex-1 p-1 text-sm font-medium"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-2 bg-gray-100 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors
                ${isUpdateMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isUpdateMode ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



