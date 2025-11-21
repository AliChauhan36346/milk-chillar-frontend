
// 'use client';
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { Milk, Sun, Moon, CheckCircle, User } from 'lucide-react';
// import { useAuth } from '@/lib/auth/AuthContext';
// import PurchaseModal from '@/components/modals/PurchaseModal';
// import { AddedList } from '@/components/ui/List/AddedList';
// import { RemainingList } from '@/components/ui/List/RemainingList';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import { DynamicLayout } from '@/components/layouts/DynamicLayout';
// import { BackButton } from '@/components/ui/BackButton';
// import { 
//   getPurchaseMetadata, 
//   createPurchase, 
//   updatePurchase,
//   type PurchaseMetadata, 
//   type Purchase, 
//   type ExpenseAccount 
// } from '@/lib/api/purchases';
// import { getEmployees, type Employee } from '@/lib/api/employees';
// import { fetchMyDodhiId } from '@/lib/api/reports';

// type ListItem = {
//   id: number;
//   name: string;
//   code: string;
//   time: 'morning' | 'evening';
//   quantity: number;
//   rate: number;
//   added: boolean;
//   purchaseId?: number;
// };

// export default function PurchasePage() {
//   const { user } = useAuth();
//   const isAdmin = user?.role === 'admin';
//   const isDodhi = user?.role === 'dodhi';
//   const today = new Date().toISOString().split('T')[0];

//   // Core state
//   const [metadata, setMetadata] = useState<PurchaseMetadata | null>(null);
//   const [selectedExpenseAccount, setSelectedExpenseAccount] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [date, setDate] = useState(today);
//   const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');

//   // Dodhi-related state
//   const [selectedDodhiId, setSelectedDodhiId] = useState<number | null>(null);
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [loadingDodhi, setLoadingDodhi] = useState(false);

//   // Modal state
//   const [showModal, setShowModal] = useState(false);
//   const [modalData, setModalData] = useState<{
//     supplier: { id: number; name: string; code: string; rate: number };
//     availableTimes: ('morning' | 'evening')[];
//     isUpdate: boolean;
//     updateData?: {
//       time: 'morning' | 'evening';
//       purchaseId: number;
//       currentQuantity: number;
//     };
//   } | null>(null);

//   // Load employees (dodhis) for admin
//   const loadEmployees = useCallback(async () => {
//     if (!isAdmin) return;
    
//     try {
//       const allEmployees = await getEmployees();
//       // Filter for dodhis only
//       const dodhis = allEmployees.filter(emp => emp.designation.toLowerCase().includes('dodhi'));
//       setEmployees(dodhis);
//     } catch (error) {
//       console.error('Failed to load employees:', error);
//     }
//   }, [isAdmin]);

//   // Get dodhi ID (either selected by admin or current user's ID)
//   const getDodhiId = useCallback(async (): Promise<number | null> => {
//     if (isAdmin) {
//       return selectedDodhiId;
//     }
    
//     if (isDodhi) {
//       try {
//         setLoadingDodhi(true);
//         const dodhiId = await fetchMyDodhiId();
//         return dodhiId;
//       } catch (error) {
//         console.error('Failed to fetch dodhi ID:', error);
//         return null;
//       } finally {
//         setLoadingDodhi(false);
//       }
//     }
    
//     return null;
//   }, [isAdmin, isDodhi, selectedDodhiId]);

//   // Load metadata
//   const loadMetadata = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       const dodhiId = await getDodhiId();
//       if (!dodhiId) {
//         if (isAdmin) {
//           // Admin hasn't selected a dodhi yet
//           setMetadata(null);
//           return;
//         } else {
//           throw new Error('Unable to get dodhi ID');
//         }
//       }

//       const data = await getPurchaseMetadata(date, timeFilter, dodhiId);
//       setMetadata(data);

//       // Auto-select expense account for dodhi
//       if (isDodhi && data.expenseAccounts.length > 0) {
//         const dodhiAccount = data.expenseAccounts.find(acc => acc.accountCode === '50001001');
//         if (dodhiAccount) {
//           setSelectedExpenseAccount(dodhiAccount.accountId);
//         }
//       }
//     } catch (error) {
//       console.error('Failed to load metadata:', error);
//       setMetadata(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [date, timeFilter, getDodhiId, isDodhi, isAdmin]);

//   useEffect(() => {
//     loadEmployees();
//   }, [loadEmployees]);

//   useEffect(() => {
//     loadMetadata();
//   }, [loadMetadata]);

//   // Helper function to get available times for a supplier
//   const getAvailableTimesForSupplier = useCallback((supplierId: number) => {
//     if (!metadata) return [];
    
//     const addedTimes = metadata.addedPurchases
//       .filter(p => p.accountId === supplierId)
//       .map(p => p.timeOfDay);
    
//     const remainingTimes = metadata.remainingSuppliers
//       .filter(s => s.accountId === supplierId)
//       .map(s => s.timeOfDay);

//     return remainingTimes;
//   }, [metadata]);

//   // Memoized list items generation
//   const { addedItems, remainingItems } = useMemo(() => {
//     if (!metadata) return { addedItems: [], remainingItems: [] };

//     const added: ListItem[] = [];
//     const remaining: ListItem[] = [];

//     // Process added purchases
//     metadata.addedPurchases.forEach(purchase => {
//       if (timeFilter === 'both' || timeFilter === purchase.timeOfDay) {
//         added.push({
//           id: purchase.accountId,
//           name: purchase.accountName,
//           code: purchase.accountCode,
//           time: purchase.timeOfDay,
//           quantity: purchase.grossLiters,
//           rate: purchase.rate,
//           added: true,
//           purchaseId: purchase.purchaseId
//         });
//       }
//     });

//     // Process remaining suppliers
//     metadata.remainingSuppliers.forEach(supplier => {
//       if (timeFilter === 'both' || timeFilter === supplier.timeOfDay) {
//         remaining.push({
//           id: supplier.accountId,
//           name: supplier.accountName,
//           code: supplier.accountCode,
//           time: supplier.timeOfDay,
//           quantity: 0,
//           rate: supplier.rate,
//           added: false
//         });
//       }
//     });

//     return { addedItems: added, remainingItems: remaining };
//   }, [metadata, timeFilter]);

//   // Memoized totals calculation
//   const totals = useMemo(() => {
//     if (!metadata) return {
//       morningTotal: 0, eveningTotal: 0, combinedTotal: 0,
//       morningAmount: 0, eveningAmount: 0, combinedAmount: 0
//     };

//     let morningTotal = 0, eveningTotal = 0;
//     let morningAmount = 0, eveningAmount = 0;

//     metadata.addedPurchases.forEach(purchase => {
//       if (purchase.timeOfDay === 'morning') {
//         morningTotal += purchase.grossLiters;
//         morningAmount += purchase.totalAmount;
//       } else {
//         eveningTotal += purchase.grossLiters;
//         eveningAmount += purchase.totalAmount;
//       }
//     });

//     return {
//       morningTotal,
//       eveningTotal,
//       combinedTotal: morningTotal + eveningTotal,
//       morningAmount,
//       eveningAmount,
//       combinedAmount: morningAmount + eveningAmount
//     };
//   }, [metadata]);

//   const handleItemClick = useCallback((item: ListItem) => {
//     const availableTimes = getAvailableTimesForSupplier(item.id);
    
//     if (item.added) {
//       // For added items, always single update
//       setModalData({
//         supplier: {
//           id: item.id,
//           name: item.name,
//           code: item.code,
//           rate: item.rate
//         },
//         availableTimes: [item.time], // Only the specific time for update
//         isUpdate: true,
//         updateData: {
//           time: item.time,
//           purchaseId: item.purchaseId!,
//           currentQuantity: item.quantity
//         }
//       });
//     } else {
//       // For remaining items
//       if (timeFilter === 'both') {
//         // Show all available times when both filter is selected
//         setModalData({
//           supplier: {
//             id: item.id,
//             name: item.name,
//             code: item.code,
//             rate: item.rate
//           },
//           availableTimes,
//           isUpdate: false
//         });
//       } else {
//         // Show only the clicked time when specific filter is selected
//         setModalData({
//           supplier: {
//             id: item.id,
//             name: item.name,
//             code: item.code,
//             rate: item.rate
//           },
//           availableTimes: [item.time],
//           isUpdate: false
//         });
//       }
//     }
    
//     setShowModal(true);
//   }, [getAvailableTimesForSupplier, timeFilter]);

//   const handleModalSubmit = useCallback(async (data: {
//     morningQuantity?: number;
//     eveningQuantity?: number;
//     rate?: number;
//     date: string;
//     expenseAccountId?: number;
//   }) => {
//     if (!modalData || !metadata) return;

//     const expenseAccountId = data.expenseAccountId || selectedExpenseAccount;
//     if (!expenseAccountId) {
//       alert('Please select an expense account');
//       return;
//     }

//     try {
//       const rate = isAdmin ? (data.rate || modalData.supplier.rate) : modalData.supplier.rate;

//       if (modalData.isUpdate && modalData.updateData) {
//         // Handle single update
//         const quantity = modalData.updateData.time === 'morning' ? data.morningQuantity : data.eveningQuantity;
//         if (!quantity || quantity <= 0) {
//           alert('Please enter a valid quantity');
//           return;
//         }

//         const purchaseData = {
//           date: data.date,
//           timeOfDay: modalData.updateData.time,
//           accountId: modalData.supplier.id,
//           expenseAccountId,
//           dodhiId: metadata.dodhiId,
//           grossLiters: quantity,
//           rate,
//           balance: 0
//         };

//         await updatePurchase(modalData.updateData.purchaseId, purchaseData);
//       } else {
//         // Handle creation (single or batch)
//         const purchases = [];

//         // Add morning purchase if available and quantity provided
//         if (modalData.availableTimes.includes('morning') && data.morningQuantity && data.morningQuantity > 0) {
//           purchases.push({
//             date: data.date,
//             timeOfDay: 'morning' as const,
//             accountId: modalData.supplier.id,
//             expenseAccountId,
//             dodhiId: metadata.dodhiId,
//             grossLiters: data.morningQuantity,
//             rate,
//             balance: 0
//           });
//         }

//         // Add evening purchase if available and quantity provided
//         if (modalData.availableTimes.includes('evening') && data.eveningQuantity && data.eveningQuantity > 0) {
//           purchases.push({
//             date: data.date,
//             timeOfDay: 'evening' as const,
//             accountId: modalData.supplier.id,
//             expenseAccountId,
//             dodhiId: metadata.dodhiId,
//             grossLiters: data.eveningQuantity,
//             rate,
//             balance: 0
//           });
//         }

//         if (purchases.length === 0) {
//           alert('Please enter at least one valid quantity');
//           return;
//         }

//         // Create all purchases
//         await Promise.all(purchases.map(purchase => createPurchase(purchase)));
//       }

//       setShowModal(false);
//       setModalData(null);
//       setDate(data.date);
//       await loadMetadata();
//     } catch (error) {
//       console.error('Failed to save purchase:', error);
//       alert('Failed to save purchase. Please try again.');
//     }
//   }, [modalData, metadata, selectedExpenseAccount, isAdmin, loadMetadata]);

//   const handleModalClose = useCallback(() => {
//     setShowModal(false);
//     setModalData(null);
//   }, []);

//   if (loading || loadingDodhi) {
//     return (
//       <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
//         <DynamicLayout>
//           <div className="flex items-center justify-center min-h-screen">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading purchase data...</p>
//             </div>
//           </div>
//         </DynamicLayout>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
//       <DynamicLayout allowedRoles={['admin', 'dodhi']}>
//         <div className="max-w-6xl mx-auto p-1 space-y-6">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <BackButton />
//               <div className="flex items-center gap-2">
//                 <Milk className="w-8 h-8 text-blue-600" />
//                 <h1 className="text-3xl font-bold text-gray-900">Milk Purchase</h1>
//               </div>
//             </div>
//           </div>

//           {/* Dodhi Selection for Admin */}
//           {isAdmin && (
//             <div className="bg-white p-4 rounded-lg shadow border">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 <User className="w-4 h-4 inline mr-1" />
//                 Select Dodhi
//               </label>
//               <select
//                 value={selectedDodhiId || ''}
//                 onChange={(e) => setSelectedDodhiId(Number(e.target.value))}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="">Select Dodhi</option>
//                 {employees.map(employee => (
//                   <option key={employee.employeeId} value={employee.employeeId}>
//                     {employee.fullName} - {employee.chillarName}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Show message if admin hasn't selected dodhi */}
//           {isAdmin && !selectedDodhiId && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <p className="text-yellow-800 text-center">
//                 Please select a dodhi to view purchase data
//               </p>
//             </div>
//           )}

//           {/* Only show the rest if we have metadata or are not admin */}
//           {(metadata || !isAdmin) && (
//             <>
//               {/* Expense Account Selection for Admin */}
//               {isAdmin && metadata && (
//                 <div className="bg-white p-4 rounded-lg shadow border">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Expense Account
//                   </label>
//                   <select
//                     value={selectedExpenseAccount || ''}
//                     onChange={(e) => setSelectedExpenseAccount(Number(e.target.value))}
//                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     required
//                   >
//                     <option value="">Select Expense Account</option>
//                     {metadata.expenseAccounts.map(account => (
//                       <option key={account.accountId} value={account.accountId}>
//                         {account.accountCode} - {account.accountName}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               {/* Date Selection */}
//               <div className="bg-white p-4 rounded-lg shadow border">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
//                 <input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Summary Cards */}
//               {metadata && (
//                 <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className={`p-3 rounded-lg ${timeFilter === 'morning' || timeFilter === 'both' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
//                     <div className="flex items-center gap-2 text-gray-700 mb-1">
//                       <Sun className="w-4 h-4 text-yellow-500" />
//                       <span className="font-medium">Morning Total</span>
//                     </div>
//                     <p className="text-2xl font-bold text-blue-600">{totals.morningTotal.toFixed(2)} Ltrs</p>
//                     {isAdmin && (
//                       <p className="text-sm text-gray-600">Rs-{totals.morningAmount.toFixed(2)}</p>
//                     )}
//                   </div>

//                   <div className={`p-3 rounded-lg ${timeFilter === 'evening' || timeFilter === 'both' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
//                     <div className="flex items-center gap-2 text-gray-700 mb-1">
//                       <Moon className="w-4 h-4 text-purple-500" />
//                       <span className="font-medium">Evening Total</span>
//                     </div>
//                     <p className="text-2xl font-bold text-purple-600">{totals.eveningTotal.toFixed(2)} Ltrs</p>
//                     {isAdmin && (
//                       <p className="text-sm text-gray-600">Rs-{totals.eveningAmount.toFixed(2)}</p>
//                     )}
//                   </div>

//                   <div className={`p-3 rounded-lg ${timeFilter === 'both' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
//                     <div className="flex items-center gap-2 text-gray-700 mb-1">
//                       <CheckCircle className="w-4 h-4 text-green-500" />
//                       <span className="font-medium">Combined Total</span>
//                     </div>
//                     <p className="text-2xl font-bold text-green-600">{totals.combinedTotal.toFixed(2)} Ltrs</p>
//                     {isAdmin && (
//                       <p className="text-sm text-gray-600">Rs-{totals.combinedAmount.toFixed(2)}</p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Time Filter */}
//               <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 justify-center">
//                 <button
//                   onClick={() => setTimeFilter('morning')}
//                   className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
//                 >
//                   <Sun className="w-4 h-4" />
//                   Morning Only
//                 </button>
//                 <button
//                   onClick={() => setTimeFilter('evening')}
//                   className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'evening' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
//                 >
//                   <Moon className="w-4 h-4" />
//                   Evening Only
//                 </button>
//                 <button
//                   onClick={() => setTimeFilter('both')}
//                   className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'both' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   Both
//                 </button>
//               </div>

//               {/* Suppliers Lists */}
//               {metadata && (
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <RemainingList
//                     title="Remaining Suppliers"
//                     items={remainingItems}
//                     getKey={(item) => `remaining-${item.id}-${item.time}`}
//                     getName={(item) => item.name}
//                     getId={(item) => item.code}
//                     getStatusLabel={(item) => {
//                       const timeClass = item.time === 'morning' ?
//                         'bg-yellow-100 text-yellow-800' :
//                         'bg-purple-100 text-purple-800';

//                       return (
//                         <div className="flex items-center gap-2">
//                           {isAdmin && (
//                             <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
//                               Rs{item.rate}/L
//                             </span>
//                           )}
//                           <span className={`${timeClass} px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
//                             {item.time === 'morning' ? (
//                               <Sun className="w-3 h-3" />
//                             ) : (
//                               <Moon className="w-3 h-3" />
//                             )}
//                             {item.time}
//                           </span>
//                         </div>
//                       );
//                     }}
//                     onItemClick={handleItemClick}
//                     icon={<CheckCircle className="w-5 h-5" />}
//                   />

//                   <AddedList
//                     title="Added Suppliers"
//                     items={addedItems}
//                     getKey={(item) => `added-${item.id}-${item.time}-${item.purchaseId || 'new'}`}
//                     getName={(item) => item.name}
//                     getId={(item) => item.code}
//                     getDetails={(item) => (
//                       <div className="flex items-center gap-2">
//                         <span className={`${item.time === 'morning' ?
//                           'bg-yellow-100 text-yellow-800' :
//                           'bg-purple-100 text-purple-800'
//                           } px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
//                           {item.time === 'morning' ? (
//                             <Sun className="w-3 h-3" />
//                           ) : (
//                             <Moon className="w-3 h-3" />
//                           )}
//                           {item.time}
//                         </span>
//                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
//                           {item.quantity} Ltrs
//                           {isAdmin && (
//                             <span className="block text-xs">
//                               Rs{(item.quantity * item.rate).toFixed(2)}
//                             </span>
//                           )}
//                         </span>
//                       </div>
//                     )}
//                     onItemClick={handleItemClick}
//                     icon={<CheckCircle className="w-5 h-5" />}
//                   />
//                 </div>
//               )}
//             </>
//           )}

//           {/* Purchase Modal */}
//           {modalData && metadata && (
//             <PurchaseModal
//               isOpen={showModal}
//               onClose={handleModalClose}
//               onSubmit={handleModalSubmit}
//               supplier={modalData.supplier}
//               availableTimes={modalData.availableTimes}
//               isAdmin={isAdmin}
//               expenseAccounts={metadata.expenseAccounts || []}
//               selectedExpenseAccount={selectedExpenseAccount}
//               isUpdate={modalData.isUpdate}
//               updateData={modalData.updateData}
//               initialDate={date}
//             />
//           )}
//         </div>
//       </DynamicLayout>
//     </ProtectedRoute>
//   );
// }



'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Milk, Sun, Moon, CheckCircle, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { InfiniteAddedList } from '@/components/ui/List/InfiniteAddedList';
import { InfiniteRemainingList } from '@/components/ui/List/InfiniteRemainingList';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { 
  createPurchase, 
  updatePurchase,
  getPurchaseSummary,
  type Purchase, 
  type RemainingSupplier,
  type PurchaseSummary
} from '@/lib/api/purchases'; 
import { getEmployees, type Employee } from '@/lib/api/employees';
import { fetchMyDodhiId } from '@/lib/api/reports';
import { getAccountsByComponent, type SearchAccountResult } from '@/lib/api/accounts'; 

type ExpenseAccount = SearchAccountResult;
type ListDataItem = Purchase | RemainingSupplier;

export default function PurchasePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDodhi = user?.role === 'dodhi';
  const today = new Date().toISOString().split('T')[0];

  // Core state
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccount[]>([]);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummary | null>(null);
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState<number | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingAddedList, setLoadingAddedList] = useState(true); 
  const [date, setDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');
  const [searchCode, setSearchCode] = useState(''); 

  // Dodhi-related state
  const [selectedDodhiId, setSelectedDodhiId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingDodhi, setLoadingDodhi] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    supplier: { id: number; name: string; code: string; rate: number };
    availableTimes: ('morning' | 'evening')[];
    isUpdate: boolean;
    updateData?: {
      time: 'morning' | 'evening';
      purchaseId: number;
      currentQuantity: number;
    };
  } | null>(null);

  /* ------------------- DATA LOADING LOGIC ------------------- */

  // 1. Load employees for Admin
  const loadEmployees = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const allEmployees = await getEmployees();
      const dodhis = allEmployees.filter(emp => emp.designation.toLowerCase().includes('dodhi'));
      setEmployees(dodhis);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  }, [isAdmin]);

  // 2. NEW: Effect to fetch and SET the ID for Dodhi users immediately
  useEffect(() => {
    const initDodhiId = async () => {
      if (isDodhi && !selectedDodhiId) {
        try {
          // Note: We keep loadingInitial = true while this happens
          const id = await fetchMyDodhiId();
          setSelectedDodhiId(id);
        } catch (error) {
          console.error('Failed to fetch dodhi ID:', error);
          setLoadingInitial(false); // Stop loading if we fail so we don't get stuck
        }
      }
    };
    initDodhiId();
  }, [isDodhi, selectedDodhiId]);

  // Helper to get ID (mostly for modal/logic reuse, now state is the primary source)
  const getDodhiId = useCallback(async (): Promise<number | null> => {
    if (selectedDodhiId) return selectedDodhiId;
    if (isDodhi) return await fetchMyDodhiId(); // Fallback
    return null;
  }, [selectedDodhiId, isDodhi]);


  // 3. Load Metadata (Accounts & Summary)
  const loadInitialMetadataAndSummary = useCallback(async () => {
    setLoadingInitial(true);
    setLoadingSummary(true);
    setLoadingAddedList(true); 

    const dodhiId = await getDodhiId();
    
    if (!dodhiId) {
      setExpenseAccounts([]);
      setPurchaseSummary(null);
      setLoadingInitial(false);
      setLoadingSummary(false);
      setLoadingAddedList(false);
      return;
    }

    try {
      // Fetch Expense Accounts
      const accounts = await getAccountsByComponent('expenses');
      setExpenseAccounts(accounts as ExpenseAccount[]);

      // Auto-select expense account for dodhi
      if (isDodhi && accounts.length > 0) {
        const dodhiAccount = accounts.find(acc => acc.accountCode === '50001001');
        if (dodhiAccount) {
          setSelectedExpenseAccount(dodhiAccount.accountId);
        }
      }

      // Load Summary
      const summaryData = await getPurchaseSummary(date, dodhiId);
      setPurchaseSummary(summaryData);

      setLoadingSummary(false); 
      
      // Staggered Load for Added List
      setTimeout(() => {
        setLoadingAddedList(false); 
      }, 2000);

    } catch (error) {
      console.error('Failed to load initial data:', error);
      setExpenseAccounts([]);
      setPurchaseSummary(null);
      setLoadingAddedList(false);
    } finally {
      setLoadingInitial(false);
    }
  }, [date, getDodhiId, isDodhi]);

  // 4. Trigger Initial Loads
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Main Data Loading Trigger
  useEffect(() => {
    // If we have a selectedDodhiId (set by Admin selection OR the Dodhi ID effect), load data
    if (selectedDodhiId) {
        loadInitialMetadataAndSummary();
    } else if (isAdmin) {
        // If Admin and no ID selected, stop loading to show dropdown
        setLoadingInitial(false);
    }
    // Note: If isDodhi is true but selectedDodhiId is null, we do nothing here.
    // We wait for the 'initDodhiId' effect to set the state, which will trigger this effect again.
  }, [selectedDodhiId, isAdmin, loadInitialMetadataAndSummary]);


  /* ------------------- MODAL & INTERACTION LOGIC ------------------- */
  
  const getAvailableTimesForSupplier = useCallback(async (supplierId: number) => {
    if (timeFilter !== 'both') {
      return [timeFilter];
    }
    return ['morning', 'evening'];
  }, [timeFilter]);

  const handleItemClick = useCallback(async (item: ListDataItem) => {
    const isPurchase = 'purchaseId' in item; 
    
    const supplier = {
      id: item.accountId,
      name: item.accountName,
      code: item.accountCode,
      rate: isPurchase ? item.rate : (item as RemainingSupplier).rate
    };
    
    const availableTimes = isPurchase ? [item.timeOfDay] : await getAvailableTimesForSupplier(item.accountId);
    
    if (isPurchase) {
      const purchaseItem = item as Purchase;
      setModalData({
        supplier,
        availableTimes: [purchaseItem.timeOfDay],
        isUpdate: true,
        updateData: {
          time: purchaseItem.timeOfDay,
          purchaseId: purchaseItem.purchaseId,
          currentQuantity: purchaseItem.grossLiters
        }
      });
    } else {
      setModalData({
        supplier,
        availableTimes: availableTimes as ('morning' | 'evening')[],
        isUpdate: false
      });
    }
    
    setShowModal(true);
  }, [getAvailableTimesForSupplier]);

  const handleModalSubmit = useCallback(async (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => {
    if (!modalData) return;

    const expenseAccountId = data.expenseAccountId || selectedExpenseAccount;
    const dodhiId = await getDodhiId();
    if (!expenseAccountId || !dodhiId) {
      alert('Missing required fields: Expense Account or Dodhi ID.');
      return;
    }

    try {
      const rate = isAdmin ? (data.rate || modalData.supplier.rate) : modalData.supplier.rate;

      if (modalData.isUpdate && modalData.updateData) {
        const quantity = modalData.updateData.time === 'morning' ? data.morningQuantity : data.eveningQuantity;
        if (!quantity || quantity <= 0) {
          alert('Please enter a valid quantity');
          return;
        }

        const purchaseData = {
          date: data.date,
          timeOfDay: modalData.updateData.time,
          accountId: modalData.supplier.id,
          expenseAccountId,
          dodhiId,
          grossLiters: quantity,
          rate,
          balance: 0
        };

        await updatePurchase(modalData.updateData.purchaseId, purchaseData);
      } else {
        const purchases = [];

        if (modalData.availableTimes.includes('morning') && data.morningQuantity && data.morningQuantity > 0) {
          purchases.push({
            date: data.date,
            timeOfDay: 'morning' as const,
            accountId: modalData.supplier.id,
            expenseAccountId,
            dodhiId,
            grossLiters: data.morningQuantity,
            rate,
            balance: 0
          });
        }

        if (modalData.availableTimes.includes('evening') && data.eveningQuantity && data.eveningQuantity > 0) {
          purchases.push({
            date: data.date,
            timeOfDay: 'evening' as const,
            accountId: modalData.supplier.id,
            expenseAccountId,
            dodhiId,
            grossLiters: data.eveningQuantity,
            rate,
            balance: 0
          });
        }

        if (purchases.length === 0) {
          alert('Please enter at least one valid quantity');
          return;
        }

        await Promise.all(purchases.map(purchase => createPurchase(purchase)));
      }

      setShowModal(false);
      setModalData(null);
      setDate(data.date);
      await loadInitialMetadataAndSummary(); 
    } catch (error) {
      console.error('Failed to save purchase:', error);
      alert('Failed to save purchase. Please try again.');
    }
  }, [modalData, selectedExpenseAccount, isAdmin, getDodhiId, loadInitialMetadataAndSummary]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setModalData(null);
  }, []);


  const totals = useMemo(() => {
    if (!purchaseSummary) return {
      morningTotal: 0, eveningTotal: 0, combinedTotal: 0,
      morningAmount: 0, eveningAmount: 0, combinedAmount: 0
    };

    const morningTotal = purchaseSummary.morning.totalLiters;
    const eveningTotal = purchaseSummary.evening.totalLiters;
    const morningAmount = purchaseSummary.morning.totalAmount;
    const eveningAmount = purchaseSummary.evening.totalAmount;

    return {
      morningTotal,
      eveningTotal,
      combinedTotal: morningTotal + eveningTotal,
      morningAmount,
      eveningAmount,
      combinedAmount: morningAmount + eveningAmount
    };
  }, [purchaseSummary]);


  if (loadingInitial || loadingDodhi) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchase data...</p>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
      <DynamicLayout allowedRoles={['admin', 'dodhi']}>
        <div className="max-w-6xl mx-auto p-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <Milk className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Milk Purchase</h1>
              </div>
            </div>
          </div>

          {/* Dodhi Selection for Admin */}
          {isAdmin && (
            <div className="bg-white p-4 rounded-lg shadow border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Select Dodhi
              </label>
              <select
                value={selectedDodhiId || ''}
                onChange={(e) => setSelectedDodhiId(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Dodhi</option>
                {employees.map(employee => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.fullName} - {employee.chillarName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Show message if admin hasn't selected dodhi */}
          {isAdmin && !selectedDodhiId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-center">
                Please select a dodhi to view purchase data
              </p>
            </div>
          )}

          {/* Only show the rest if a Dodhi is selected/available */}
          {selectedDodhiId && (
            <>
              {/* Expense Account Selection for Admin */}
              {isAdmin && (
                <div className="bg-white p-4 rounded-lg shadow border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Account
                  </label>
                  <select
                    value={selectedExpenseAccount || ''}
                    onChange={(e) => setSelectedExpenseAccount(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={expenseAccounts.length === 0} 
                  >
                    <option value="">Select Expense Account</option>
                    {expenseAccounts.map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.accountCode} - {account.name}
                      </option>
                    ))}
                  </select>
                  {expenseAccounts.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">No expense accounts found (Code 500).</p>
                  )}
                </div>
              )}

              {/* Date Selection and Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow border">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                </div>
                
              </div>

              {/* Summary Cards */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {loadingSummary ? (
                    <div className="md:col-span-3 flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <>
                        <div className={`p-3 rounded-lg ${timeFilter === 'morning' || timeFilter === 'both' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                                <Sun className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">Morning Total</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{totals.morningTotal.toFixed(2)} Ltrs</p>
                            {isAdmin && (
                                <p className="text-sm text-gray-600">Rs-{totals.morningAmount.toFixed(2)}</p>
                            )}
                        </div>

                        <div className={`p-3 rounded-lg ${timeFilter === 'evening' || timeFilter === 'both' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                                <Moon className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">Evening Total</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{totals.eveningTotal.toFixed(2)} Ltrs</p>
                            {isAdmin && (
                                <p className="text-sm text-gray-600">Rs-{totals.eveningAmount.toFixed(2)}</p>
                            )}
                        </div>

                        <div className={`p-3 rounded-lg ${timeFilter === 'both' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 text-gray-700 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Combined Total</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{totals.combinedTotal.toFixed(2)} Ltrs</p>
                            {isAdmin && (
                                <p className="text-sm text-gray-600">Rs-{totals.combinedAmount.toFixed(2)}</p>
                            )}
                        </div>
                    </>
                )}
              </div>

              {/* Time Filter */}
              <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 justify-center">
                <button
                  onClick={() => setTimeFilter('morning')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                >
                  <Sun className="w-4 h-4" />
                  Morning Only
                </button>
                <button
                  onClick={() => setTimeFilter('evening')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'evening' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
                >
                  <Moon className="w-4 h-4" />
                  Evening Only
                </button>
                <button
                  onClick={() => setTimeFilter('both')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timeFilter === 'both' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Both
                </button>
              </div>

              {/* Suppliers Lists */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Remaining Suppliers */}
                <InfiniteRemainingList
                  title="Remaining Suppliers"
                  dodhiId={selectedDodhiId}
                  date={date}
                  timeFilter={timeFilter}
                  
                  isAdmin={isAdmin}
                  onItemClick={handleItemClick}
                  icon={<CheckCircle className="w-5 h-5" />}
                  colorClass="red"
                />

                {/* Added Suppliers */}
                {loadingAddedList ? (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex justify-center items-center" style={{ maxHeight: '70vh' }}>
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            <p className="mt-2 text-gray-600">Loading added purchases...</p>
                        </div>
                    </div>
                ) : (
                    <InfiniteAddedList
                        title="Added Suppliers"
                        dodhiId={selectedDodhiId}
                        date={date}
                        timeFilter={timeFilter}
                        
                        isAdmin={isAdmin}
                        onItemClick={handleItemClick}
                        icon={<CheckCircle className="w-5 h-5" />}
                        colorClass="green"
                    />
                )}
              </div>
            </>
          )}

          {/* Purchase Modal */}
          {modalData && expenseAccounts.length > 0 && (
            <PurchaseModal
              isOpen={showModal}
              onClose={handleModalClose}
              onSubmit={handleModalSubmit}
              supplier={modalData.supplier}
              availableTimes={modalData.availableTimes}
              isAdmin={isAdmin}
              expenseAccounts={expenseAccounts}
              selectedExpenseAccount={selectedExpenseAccount}
              isUpdate={modalData.isUpdate}
              updateData={modalData.updateData}
              initialDate={date}
            />
          )}
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}