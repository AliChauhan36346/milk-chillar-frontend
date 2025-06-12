// components/modals/PurchaseModal.tsx
'use client';
import { Sun, Moon, Milk, Save, UserPlus, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

type PurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    morningQuantity?: number; 
    eveningQuantity?: number;
    rate?: number;
    date: string 
  }) => void;
  supplier?: {
    id: string;
    name: string;
  } | null;
  time: 'morning' | 'evening' | 'both';
  isAdmin: boolean;
  initialData?: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date?: string;
  };
};

export default function PurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  supplier,
  time,
  isAdmin,
  initialData
}: PurchaseModalProps) {
  const [morningQuantity, setMorningQuantity] = useState<number | ''>('');
  const [eveningQuantity, setEveningQuantity] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );

  // Determine if we're editing an existing entry
  const isEditing = Boolean(initialData?.morningQuantity !== undefined || 
                          initialData?.eveningQuantity !== undefined);

  useEffect(() => {
    if (initialData) {
      setMorningQuantity(initialData.morningQuantity || '');
      setEveningQuantity(initialData.eveningQuantity || '');
      setRate(initialData.rate || '');
      if (initialData.date) setSelectedDate(initialData.date);
    } else {
      setMorningQuantity('');
      setEveningQuantity('');
      setRate('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      date: selectedDate,
      morningQuantity: time !== 'evening' ? Number(morningQuantity) || 0 : undefined,
      eveningQuantity: time !== 'morning' ? Number(eveningQuantity) || 0 : undefined,
      rate: isAdmin ? Number(rate) || 0 : undefined
    };

    onSubmit(submitData);
  };

  const calculateTotal = () => {
    const morning = time !== 'evening' ? Number(morningQuantity) || 0 : 0;
    const evening = time !== 'morning' ? Number(eveningQuantity) || 0 : 0;
    const currentRate = Number(rate) || 0;
    return (morning + evening) * currentRate;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {time === 'morning' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : time === 'evening' ? (
              <Moon className="w-5 h-5 text-purple-500" />
            ) : (
              <>
                <Sun className="w-5 h-5 text-yellow-500" />
                <Moon className="w-5 h-5 text-purple-500" />
              </>
            )}
            {isEditing ? 'Update Purchase' : 'New Purchase'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {supplier && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Details</label>
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="font-bold text-lg">{supplier.name}</p>
                    <p className="text-sm text-gray-700 font-medium">ID: {supplier.id}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {time !== 'evening' && (
                  <div className={`p-3 rounded-lg border ${time === 'morning' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Morning (Ltrs)
                    </label>
                    <input
                      type="number"
                      value={morningQuantity}
                      onChange={(e) => setMorningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required={time === 'morning' || time === 'both'}
                      min="0"
                      step="0.1"
                    />
                  </div>
                )}

                {time !== 'morning' && (
                  <div className={`p-3 rounded-lg border ${time === 'evening' ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Moon className="w-4 h-4 text-purple-500" />
                      Evening (Ltrs)
                    </label>
                    <input
                      type="number"
                      value={eveningQuantity}
                      onChange={(e) => setEveningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={time === 'evening' || time === 'both'}
                      min="0"
                      step="0.1"
                    />
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate per Liter (₹)
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required={isAdmin}
                    min="0"
                    step="0.01"
                  />
                  {rate !== '' && (
                    <div className="mt-2 text-right">
                      <p className="text-sm text-gray-600">Total Amount:</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  time === 'morning' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : time === 'evening'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-5 h-5" />
                    Update
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Add
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}