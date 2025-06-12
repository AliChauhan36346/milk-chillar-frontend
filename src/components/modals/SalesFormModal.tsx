// components/modals/SalesFormModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Plus, X, User, Calendar, Droplet, Percent, IndianRupee, } from 'lucide-react';

type BuyerFormData = {
  grossLiters: number;
  lr: number;
  fat: number;
  rate: number;
  amount: number;
  date: string;
};

type BuyerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuyerFormData) => void;
  initialData?: Omit<BuyerFormData, 'amount'> & { amount?: number };
  buyerName: string;
  buyerId: string;
  date: string;
  isAdmin: boolean;
  isFromAddedList: boolean;
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
  isFromAddedList
}: BuyerFormModalProps) {
  const [formData, setFormData] = useState({
    grossLiters: initialData?.grossLiters.toString() || '',
    lr: initialData?.lr.toString() || '',
    fat: initialData?.fat.toString() || '',
    rate: initialData?.rate.toString() || '',
    amount: initialData?.amount?.toString() || '0',
    date: initialDate
  });

  const isUpdateMode = isFromAddedList;

  useEffect(() => {
    if (initialData) {
      setFormData({
        grossLiters: initialData.grossLiters.toString(),
        lr: initialData.lr.toString(),
        fat: initialData.fat.toString(),
        rate: initialData.rate.toString(),
        amount: initialData.amount?.toString() || calculateAmount(
          initialData.grossLiters.toString(),
          initialData.rate.toString()
        ),
        date: initialDate
      });
    } else {
      setFormData({
        grossLiters: '',
        lr: '',
        fat: '',
        rate: '',
        amount: '0',
        date: initialDate
      });
    }
  }, [initialData, initialDate]);

  const calculateAmount = (liters: string, rate: string) => {
    const litersNum = parseFloat(liters) || 0;
    const rateNum = parseFloat(rate) || 0;
    return (litersNum * rateNum).toFixed(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    if (name === 'grossLiters' || name === 'rate') {
      newFormData.amount = calculateAmount(
        name === 'grossLiters' ? value : formData.grossLiters,
        name === 'rate' ? value : formData.rate
      );
    }

    setFormData(newFormData);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, date: e.target.value});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      grossLiters: parseFloat(formData.grossLiters),
      lr: parseFloat(formData.lr),
      fat: parseFloat(formData.fat),
      rate: parseFloat(formData.rate),
      amount: parseFloat(formData.amount),
      date: formData.date
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header - Only colored for new sales */}
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

        {/* Buyer Info - Always white background for readability */}
        <div className="bg-white p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{buyerName}</h4>
              <p className="text-sm text-gray-600">ID: {buyerId}</p>
            </div>
          </div>

          {/* Editable Date Field */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Gross Liters */}
          <div className="space-y-.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplet className="w-4 h-4 text-blue-500" />
              Gross Liters
            </label>
            <input
              type="number"
              name="grossLiters"
              value={formData.grossLiters}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              step="0.01"
              placeholder="Enter liters"
            />
          </div>

          {/* LR and Fat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Percent className="w-4 h-4 text-green-500" />
                LR
              </label>
              <input
                type="number"
                name="lr"
                value={formData.lr}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                step="0.01"
                placeholder="Enter LR"
              />
            </div>
            <div className="space-y-.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Percent className="w-4 h-4 text-purple-500" />
                Fat %
              </label>
              <input
                type="number"
                name="fat"
                value={formData.fat}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                step="0.01"
                placeholder="Enter fat"
              />
            </div>
          </div>

          {/* Rate (admin only) */}
          {isAdmin && (
            <div className="space-y-.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <IndianRupee className="w-4 h-4 text-yellow-500" />
                Rate per Liter (Rs)
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                required
                step="0.01"
                placeholder="Enter rate"
              />
            </div>
          )}

          {/* Amount (readonly) */}
          <div className="space-y-.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <IndianRupee className="w-4 h-4 text-green-600" />
              Total Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-gray-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-2 bg-gray-100 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              className={`flex-1 py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors
                ${isUpdateMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isUpdateMode ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Update Sale
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
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