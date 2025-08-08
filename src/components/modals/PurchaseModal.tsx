// // components/modals/PurchaseModal.tsx
// 'use client';
// import { Sun, Moon, Save, UserPlus, Calendar, Edit } from 'lucide-react';
// import { useState, useEffect, useMemo } from 'react';
// import { ExpenseAccount } from '@/lib/api/purchases';

// type PurchaseModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: { 
//     morningQuantity?: number; 
//     eveningQuantity?: number;
//     rate?: number;
//     date: string;
//     expenseAccountId?: number;
//   }) => void;
//   supplier: {
//     id: number;
//     name: string;
//     code: string;
//     rate: number;
//   };
//   time: 'morning' | 'evening';
//   isAdmin: boolean;
//   expenseAccounts: ExpenseAccount[];
//   selectedExpenseAccount: number | null;
//   initialData?: {
//     morningQuantity?: number;
//     eveningQuantity?: number;
//     rate?: number;
//     date?: string;
//   };
// };

// export default function PurchaseModal({
//   isOpen,
//   onClose,
//   onSubmit,
//   supplier,
//   time,
//   isAdmin,
//   expenseAccounts,
//   selectedExpenseAccount,
//   initialData
// }: PurchaseModalProps) {
//   const [quantity, setQuantity] = useState<number | ''>('');
//   const [rate, setRate] = useState<number | ''>('');
//   const [expenseAccountId, setExpenseAccountId] = useState<number | null>(selectedExpenseAccount);
//   const [selectedDate, setSelectedDate] = useState(
//     initialData?.date || new Date().toISOString().split('T')[0]
//   );

//   // Determine if this is an update operation
//   const isEditing = useMemo(() => {
//     return Boolean(
//       (time === 'morning' && initialData?.morningQuantity) ||
//       (time === 'evening' && initialData?.eveningQuantity)
//     );
//   }, [time, initialData]);

//   // Initialize form values
//   useEffect(() => {
//     if (initialData) {
//       const initialQuantity = time === 'morning' 
//         ? initialData.morningQuantity 
//         : initialData.eveningQuantity;
      
//       setQuantity(initialQuantity || '');
//       setRate(initialData.rate || supplier.rate);
//       if (initialData.date) setSelectedDate(initialData.date);
//     } else {
//       setQuantity('');
//       setRate(supplier.rate);
//       setSelectedDate(new Date().toISOString().split('T')[0]);
//     }
//     setExpenseAccountId(selectedExpenseAccount);
//   }, [initialData, supplier.rate, selectedExpenseAccount, time]);

//   // Calculate total amount
//   const totalAmount = useMemo(() => {
//     const qty = Number(quantity) || 0;
//     const currentRate = Number(rate) || 0;
//     return qty * currentRate;
//   }, [quantity, rate]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!quantity || Number(quantity) <= 0) {
//       alert('Please enter a valid quantity');
//       return;
//     }

//     const submitData = {
//       date: selectedDate,
//       [time === 'morning' ? 'morningQuantity' : 'eveningQuantity']: Number(quantity),
//       rate: isAdmin ? Number(rate) || undefined : undefined,
//       expenseAccountId: expenseAccountId || undefined
//     };

//     onSubmit(submitData);
//   };

//   // Get modal title and icon
//   const { title, icon, colorClasses } = useMemo(() => {
//     const baseTitle = isEditing ? 'Update' : 'New';
//     const timeTitle = time === 'morning' ? 'Morning' : 'Evening';
    
//     return {
//       title: `${baseTitle} ${timeTitle} Purchase`,
//       icon: time === 'morning' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-500" />,
//       colorClasses: time === 'morning' 
//         ? 'border-blue-300 bg-blue-50 focus:ring-blue-500' 
//         : 'border-purple-300 bg-purple-50 focus:ring-purple-500'
//     };
//   }, [time, isEditing]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//         <div className="p-6">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             {icon}
//             {title}
//           </h2>

//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               {/* Supplier Details */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Details</label>
//                 <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
//                   <p className="font-bold text-lg">{supplier.name}</p>
//                   <p className="text-sm text-gray-700 font-medium">Code: {supplier.code}</p>
//                 </div>
//               </div>

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   Date
//                 </label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Quantity Input */}
//               <div className={`p-3 rounded-lg border ${colorClasses}`}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
//                   {icon}
//                   {time.charAt(0).toUpperCase() + time.slice(1)} Quantity (Ltrs)
//                   {isEditing && (
//                     <span className="text-xs text-blue-600 flex items-center gap-1">
//                       <Edit className="w-3 h-3" />
//                       Editing
//                     </span>
//                   )}
//                 </label>
//                 <input
//                   type="number"
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
//                   className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 ${colorClasses}`}
//                   required
//                   min="0"
//                   step="0.1"
//                   placeholder={isEditing ? "Current quantity" : "Enter quantity"}
//                 />
//               </div>

//               {/* Rate Input for Admin */}
//               {isAdmin && (
//                 <div className="p-3 rounded-lg border border-green-200 bg-green-50">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Rate per Liter (₹)
//                   </label>
//                   <input
//                     type="number"
//                     value={rate}
//                     onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
//                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                     required
//                     min="0"
//                     step="0.01"
//                   />
//                   {totalAmount > 0 && (
//                     <div className="mt-2 text-right">
//                       <p className="text-sm text-gray-600">Total Amount:</p>
//                       <p className="text-lg font-bold text-green-600">
//                         ₹{totalAmount.toFixed(2)}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Expense Account for Admin */}
//               {isAdmin && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expense Account
//                   </label>
//                   <select
//                     value={expenseAccountId || ''}
//                     onChange={(e) => setExpenseAccountId(Number(e.target.value))}
//                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     required
//                   >
//                     <option value="">Select Expense Account</option>
//                     {expenseAccounts.map(account => (
//                       <option key={account.accountId} value={account.accountId}>
//                         {account.accountCode} - {account.accountName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Editing Context */}
//               {isEditing && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
//                   <div className="flex items-center gap-2 text-amber-800">
//                     <Edit className="w-4 h-4" />
//                     <span className="text-sm font-medium">
//                       Updating existing {time} entry
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-6 flex gap-3">
//               <button
//                 type="submit"
//                 className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-white ${
//                   time === 'morning' 
//                     ? 'bg-blue-600 hover:bg-blue-700' 
//                     : 'bg-purple-600 hover:bg-purple-700'
//                 }`}
//               >
//                 {isEditing ? (
//                   <>
//                     <Save className="w-5 h-5" />
//                     Update
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="w-5 h-5" />
//                     Add
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


// components/modals/PurchaseModal.tsx
'use client';
import { Sun, Moon, Save, UserPlus, Calendar, Edit } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ExpenseAccount } from '@/lib/api/purchases';

type PurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    morningQuantity?: number; 
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => void;
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

  // Initialize form values
  useEffect(() => {
    if (isUpdate && updateData) {
      // For updates, only populate the specific time being updated
      if (updateData.time === 'morning') {
        setMorningQuantity(updateData.currentQuantity);
        setEveningQuantity('');
      } else {
        setEveningQuantity(updateData.currentQuantity);
        setMorningQuantity('');
      }
      setRate(supplier.rate);
    } else {
      // For new purchases, reset all values
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
  const { title, primaryColor, bgColor } = useMemo(() => {
    if (isUpdate && updateData) {
      const timeTitle = updateData.time === 'morning' ? 'Morning' : 'Evening';
      return {
        title: `Update ${timeTitle} Purchase`,
        primaryColor: updateData.time === 'morning' ? 'blue' : 'purple',
        bgColor: updateData.time === 'morning' ? 'bg-blue-50' : 'bg-purple-50'
      };
    }
    
    if (availableTimes.length === 1) {
      const timeTitle = availableTimes[0] === 'morning' ? 'Morning' : 'Evening';
      return {
        title: `New ${timeTitle} Purchase`,
        primaryColor: availableTimes[0] === 'morning' ? 'blue' : 'purple',
        bgColor: availableTimes[0] === 'morning' ? 'bg-blue-50' : 'bg-purple-50'
      };
    }
    
    return {
      title: 'New Purchase Entry',
      primaryColor: 'green',
      bgColor: 'bg-green-50'
    };
  }, [isUpdate, updateData, availableTimes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const morningQty = Number(morningQuantity) || 0;
    const eveningQty = Number(eveningQuantity) || 0;
    
    if (isUpdate) {
      // For updates, check only the specific time being updated
      const quantityToCheck = updateData?.time === 'morning' ? morningQty : eveningQty;
      if (!quantityToCheck || quantityToCheck <= 0) {
        alert('Please enter a valid quantity');
        return;
      }
    } else {
      // For new entries, check at least one quantity is provided
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

    onSubmit(submitData);
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
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[100vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {availableTimes.length === 1 ? (
              availableTimes[0] === 'morning' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-purple-500" />
              )
            ) : (
              <div className="flex gap-1">
                <Sun className="w-4 h-4 text-yellow-500" />
                <Moon className="w-4 h-4 text-purple-500" />
              </div>
            )}
            {title}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Supplier Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Details</label>
                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                  <p className="font-bold text-lg">{supplier.name}</p>
                  <p className="text-sm text-gray-700 font-medium">Code: {supplier.code}</p>
                  {isAdmin && (
                    <p className="text-sm text-gray-600">Default Rate: ₹{supplier.rate}/L</p>
                  )}
                </div>
              </div>

              {/* Date */}
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

              {/* Quantity Inputs - Side by Side */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Milk Quantities (Ltrs)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Morning Quantity */}
                  {availableTimes.includes('morning') && (
                    <div className={`p-2 rounded-lg border ${getInputColorClasses('morning')}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-yellow-500" />
                        Morning
                        {isUpdate && updateData?.time === 'morning' && (
                          <span className="text-xs text-blue-600 flex items-center gap-1 ml-1">
                            <Edit className="w-2 h-2" />
                            Edit
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={morningQuantity}
                        onChange={(e) => setMorningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 ${getInputColorClasses('morning')} text-sm`}
                        min="0"
                        step="0.1"
                        placeholder="Morning qty"
                        disabled={isUpdate && updateData?.time === 'evening'}
                      />
                      {isAdmin && totals.morningAmount > 0 && (
                        <div className="mt-2 text-center">
                          <p className="text-xs text-blue-600 font-medium">
                            ₹{totals.morningAmount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evening Quantity */}
                  {availableTimes.includes('evening') && (
                    <div className={`p-2 rounded-lg border ${getInputColorClasses('evening')}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-purple-500" />
                        Evening
                        {isUpdate && updateData?.time === 'evening' && (
                          <span className="text-xs text-purple-600 flex items-center gap-1 ml-1">
                            <Edit className="w-2 h-2" />
                            Edit
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={eveningQuantity}
                        onChange={(e) => setEveningQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 ${getInputColorClasses('evening')} text-sm`}
                        min="0"
                        step="0.1"
                        placeholder="Evening qty"
                        disabled={isUpdate && updateData?.time === 'morning'}
                      />
                      {isAdmin && totals.eveningAmount > 0 && (
                        <div className="mt-2 text-center">
                          <p className="text-xs text-purple-600 font-medium">
                            ₹{totals.eveningAmount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Placeholder for single time updates to maintain layout */}
                  {isUpdate && updateData && availableTimes.length === 1 && (
                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-50">
                      <label className="block text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        {updateData.time === 'morning' ? (
                          <>
                            <Moon className="w-3 h-3" />
                            Evening
                          </>
                        ) : (
                          <>
                            <Sun className="w-3 h-3" />
                            Morning
                          </>
                        )}
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-100"
                        placeholder="Not available"
                        disabled
                      />
                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-400">Not editing</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Input for Admin */}
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
                    required
                    min="0"
                    step="0.01"
                  />
                  {totals.totalAmount > 0 && (
                    <div className="mt-2 text-right">
                      <p className="text-sm text-gray-600">Total Amount:</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{totals.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Expense Account for Admin */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Account
                  </label>
                  <select
                    value={expenseAccountId || ''}
                    onChange={(e) => setExpenseAccountId(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Expense Account</option>
                    {expenseAccounts.map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.accountCode} - {account.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Update Context */}
              {isUpdate && updateData && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Updating existing {updateData.time} entry
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-white ${getButtonColorClasses()}`}
              >
                {isUpdate ? (
                  <>
                    <Save className="w-5 h-5" />
                    Update
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Add Purchase
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