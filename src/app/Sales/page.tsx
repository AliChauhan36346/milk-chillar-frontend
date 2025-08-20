// // app/sales/page.tsx
// 'use client';
// import { useState, useEffect } from 'react';
// import { Milk, Scale, ShoppingCart, CheckCircle, User } from 'lucide-react';
// import SummaryCard from '@/components/ui/SummaryCard';
// import MilkLoader from '@/components/ui/Loader';
// import { useAuth } from '@/lib/auth/AuthContext';
// import { DynamicLayout } from '@/components/layouts/DynamicLayout';
// import { AddedList } from '@/components/ui/List/AddedList';
// import { RemainingList } from '@/components/ui/List/RemainingList';
// import { SalesFormModal } from '@/components/modals/SalesFormModal';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import { getSalesMetadata, createSale, updateSale } from '@/lib/api/sales';
// import { BackButton } from '@/components/ui/BackButton';
// import { useRouter } from 'next/navigation';


// type Buyer = {
//   id: number;
//   accountId: number;
//   name: string;
//   accountCode: string;
//   added: boolean;
//   grossLiters: number;
//   lr: number;
//   fat: number;
//   netLiters: number;
//   rate: number;
//   amount: number;
//   amountReceived: number;
//   saleId?: number;
// };

// export default function SalesPage() {
//   const { user } = useAuth();
//   const isAdmin = user?.role === 'admin';
//   const [loading, setLoading] = useState(true);
//   const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
//   const [buyers, setBuyers] = useState<Buyer[]>([]);
//   const [chillarReceiveTotal, setChillarReceiveTotal] = useState(0);
//   const [modalBuyer, setModalBuyer] = useState<Buyer | null>(null);
//   const [chillarId, setChillarId] = useState<number | null>(null);
//   const [revenueAccounts, setRevenueAccounts] = useState<{ accountId: number, accountName: string, accountCode: string }[]>([]);

//   // Form state for live calculation
//   const [formValues, setFormValues] = useState({
//     grossLiters: 0,
//     lr: 0,
//     fat: 0,
//     netLiters: 0,
//     rate: 0,
//     amount: 0,
//     amountReceived: 0,
//     revenueAccountId: 0
//   });

//   const calculateNetLiters = (lr: number, fat: number, volume: number, tsStandard: number = 13): number => {
//     const fatOperations = 0.22 * fat + 0.72;
//     const lrOperations = lr / 4;
//     const snf = fatOperations + lrOperations;
//     const volumeOperations = (snf + fat) * volume;
//     const ts = volumeOperations / tsStandard;
//     return parseFloat(ts.toFixed(2));
//   };

//   // Calculate net liters and amount
//   const calculateValues = (gross: number, lr: number, fat: number, rate: number) => {
//     const netLiters = calculateNetLiters(lr, fat, gross);
//     const amount = netLiters * rate;
//     return {
//       netLiters: netLiters,
//       amount: parseFloat(amount.toFixed(2))
//     };
//   };

//   // Handle input changes and recalculate
//   const handleInputChange = (field: string, value: number) => {
//     const newValues = {
//       ...formValues,
//       [field]: value || 0,
//     };

//     const { netLiters, amount } = calculateValues(
//       field === 'grossLiters' ? value : newValues.grossLiters,
//       field === 'lr' ? value : newValues.lr,
//       field === 'fat' ? value : newValues.fat,
//       field === 'rate' ? value : newValues.rate
//     );

//     newValues.netLiters = netLiters;
//     newValues.amount = amount;
//     setFormValues(newValues);
//   };

//   // Fetch metadata on date change
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const meta = await getSalesMetadata(date);
//         setChillarId(meta.chillarId);
//         setRevenueAccounts(meta.revenueAccounts);

//         // For demo, we'll set a static chillar receive total
//         // In real app, you'd fetch this from your chillar receive API
//         setChillarReceiveTotal(385);

//         // app/sales/page.tsx
//         const remaining: Buyer[] = meta.remainingAccounts.map(account => ({
//           id: account.accountId,
//           accountId: account.accountId,
//           name: account.accountName,
//           accountCode: account.accountCode,
//           added: false,
//           grossLiters: 0,
//           lr: 0,
//           fat: 0,
//           netLiters: 0,
//           rate: account.rate, // Now properly typed
//           amount: 0,
//           amountReceived: 0
//         }));

//         const added: Buyer[] = meta.addedSales.map(sale => ({
//           id: sale.accountId,
//           accountId: sale.accountId,
//           name: sale.accountName,
//           accountCode: sale.accountCode,
//           added: true,
//           grossLiters: sale.grossLiters,
//           lr: sale.lr,
//           fat: sale.fat,
//           netLiters: sale.netLiters,
//           rate: sale.rate,
//           amount: sale.totalAmount,
//           amountReceived: sale.amountReceived ?? 0,
//           saleId: sale.saleId
//         }));

//         setBuyers([...remaining, ...added]);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [date]);

//   // Update form values when modal opens
//   useEffect(() => {
//     if (modalBuyer) {
//       setFormValues({
//         grossLiters: modalBuyer.grossLiters,
//         lr: modalBuyer.lr,
//         fat: modalBuyer.fat,
//         netLiters: modalBuyer.netLiters,
//         rate: modalBuyer.rate,
//         amount: modalBuyer.amount,
//         amountReceived: modalBuyer.amountReceived,
//         revenueAccountId: revenueAccounts[0]?.accountId || 0
//       });
//     } else {
//       setFormValues({
//         grossLiters: 0,
//         lr: 0,
//         fat: 0,
//         netLiters: 0,
//         rate: 0,
//         amount: 0,
//         amountReceived: 0,
//         revenueAccountId: revenueAccounts[0]?.accountId || 0
//       });
//     }
//   }, [modalBuyer, revenueAccounts]);

//   const openForm = (buyer: Buyer) => setModalBuyer(buyer);
//   const closeForm = () => setModalBuyer(null);

//   const onSubmit = async (formData: {
//     grossLiters: number;
//     lr: number;
//     fat: number;
//     netLiters: number;
//     rate: number;
//     amount: number;
//     amountReceived: number;
//     revenueAccountId: number;
//   }) => {
//     if (!modalBuyer || !chillarId) return;

//     const payload = {
//       date,
//       accountId: modalBuyer.accountId,
//       revenueAccountId: formData.revenueAccountId,
//       chillarId,
//       grossLiters: formData.grossLiters,
//       lr: formData.lr,
//       fat: formData.fat,
//       netLiters: formData.netLiters,
//       rate: formData.rate,
//       amountReceived: formData.amountReceived
//     };

//     try {
//       if (modalBuyer.added && modalBuyer.saleId) {
//         await updateSale(modalBuyer.saleId, payload);
//       } else {
//         await createSale(payload);
//       }

//       // Refresh data after successful submission
//       const meta = await getSalesMetadata(date);
//       const updatedRemaining = meta.remainingAccounts.map(account => ({
//         id: account.accountId,
//         accountId: account.accountId,
//         name: account.accountName,
//         accountCode: account.accountCode,
//         added: false,
//         grossLiters: 0,
//         lr: 0,
//         fat: 0,
//         netLiters: 0,
//         rate: account.rate,
//         amount: 0,
//         amountReceived: 0
//       }));

//       const updatedAdded = meta.addedSales.map(sale => ({
//         id: sale.accountId,
//         accountId: sale.accountId,
//         name: sale.accountName,
//         accountCode: sale.accountCode,
//         added: true,
//         grossLiters: sale.grossLiters,
//         lr: sale.lr,
//         fat: sale.fat,
//         netLiters: sale.netLiters,
//         rate: sale.rate,
//         amount: sale.totalAmount,
//         amountReceived: sale.amountReceived ?? 0,
//         saleId: sale.saleId
//       }));

//       setBuyers([...updatedRemaining, ...updatedAdded]);
//       closeForm();
//     } catch (error) {
//       console.error('Error submitting sale:', error);
//       // Handle error (show toast, etc.)
//     }
//   };

//   // Calculate totals
//   const calculateTotals = () => {
//     const addedBuyers = buyers.filter(b => b.added);
//     return {
//       salesTotal: addedBuyers.reduce((sum, b) => sum + b.grossLiters, 0),
//       amountTotal: addedBuyers.reduce((sum, b) => sum + b.amount, 0),
//       stock: chillarReceiveTotal - addedBuyers.reduce((sum, b) => sum + b.grossLiters, 0),
//       count: addedBuyers.length
//     };
//   };

//   const { salesTotal, amountTotal, stock, count } = calculateTotals();

//   if (loading) return <MilkLoader />;

//   return (
//     <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
//       <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
//         <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen">
//           {/* Header Section */}
//           <div className="block items-center justify-between">
//             <div className="flex items-center gap-4">
//               <BackButton />
//               <div className="flex items-center gap-2">
//                 <ShoppingCart className="w-8 h-8 text-blue-600" />
//                 <h1 className="text-3xl font-bold text-blue-600">Milk Sales</h1>
//               </div>
//             </div>
//             <div className="flex flex-wrap gap-4 mt-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <input
//                   type="date"
//                   value={date}
//                   onChange={e => setDate(e.target.value)}
//                   className="p-2 border border-gray-300 rounded-lg mb-4"
//                 />
//               </div>
//             </div>
//           </div>
//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <SummaryCard
//               title="Total Sales"
//               value={`${salesTotal.toFixed(2)} Ltrs`}
//               icon={<Milk className="w-5 h-5" />}
//               color="blue"
//             />
//             <SummaryCard
//               title="Chillar Receive"
//               value={`${chillarReceiveTotal.toFixed(2)} Ltrs`}
//               icon={<Scale className="w-5 h-5" />}
//               color="green"
//             />
//             <SummaryCard
//               title="Current Stock"
//               value={`${stock.toFixed(2)} Ltrs`}
//               icon={<Milk className="w-5 h-5" />}
//               color={stock >= 0 ? 'purple' : 'red'}
//             />
//             {isAdmin && (
//               <SummaryCard
//                 title="Total Amount"
//                 value={`Rs${amountTotal.toFixed(2)}`}
//                 icon={<Scale className="w-5 h-5" />}
//                 color="yellow"
//               />
//             )}
//           </div>

//           {/* Buyers Lists */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <RemainingList
//               title="Remaining Buyers"
//               items={buyers.filter(b => !b.added)}
//               getKey={b => String(b.id)}
//               getName={b => b.name}
//               getId={b => b.accountCode}
//               getStatusLabel={b => (
//                 isAdmin ? (
//                   <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
//                     Rs{b.rate}/Ltr
//                   </span>
//                 ) : (
//                   <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
//                     Pending
//                   </span>
//                 )
//               )}
//               onItemClick={openForm}
//               icon={<User className="w-5 h-5" />}
//             />



//             <AddedList
//               title="Added Buyers"
//               items={buyers.filter(b => b.added)}
//               getKey={b => String(b.id)}
//               getName={b => b.name}
//               getId={b => b.accountCode}
//               getDetails={b => (
//                 <div className="text-right space-y-1">
//                   <p className="text-sm font-medium">{b.grossLiters.toFixed(2)} Ltrs</p>
//                   <div className="flex justify-between text-xs text-gray-600">
//                     <span>LR: {b.lr.toFixed(2)}</span>
//                     <span> Fat: {b.fat.toFixed(2)}</span>
//                     <span> Net: {b.netLiters.toFixed(2)}</span>
//                   </div>
//                   <p className="text-xs font-medium">Received: {b.amountReceived.toFixed(2)}</p>
//                   {isAdmin && (
//                     <p className="text-xs text-gray-600">Total: {b.amount.toFixed(2)}</p>
//                   )}
//                 </div>
//               )}
//               onItemClick={openForm}
//               icon={<CheckCircle className="w-5 h-5" />}
//             />
//           </div>

//           {/* Modal */}
//           <SalesFormModal
//             isOpen={!!modalBuyer}
//             onClose={closeForm}
//             onSubmit={onSubmit}
//             initialData={
//               modalBuyer
//                 ? {
//                   grossLiters: modalBuyer.grossLiters,
//                   lr: modalBuyer.lr,
//                   fat: modalBuyer.fat,
//                   netLiters: modalBuyer.netLiters,
//                   rate: modalBuyer.rate,
//                   amount: modalBuyer.amount,
//                   amountReceived: modalBuyer.amountReceived,
//                   revenueAccountId: formValues.revenueAccountId,
//                   date: date // Add date here
//                 }
//                 : undefined
//             }
//             buyerName={modalBuyer?.name || ''}
//             buyerId={modalBuyer?.accountCode || ''}
//             date={date}
//             isAdmin={isAdmin}
//             isFromAddedList={modalBuyer?.added || false}
//             revenueAccounts={revenueAccounts}
//             formValues={formValues}
//             onInputChange={handleInputChange}
//           />
//         </div>
//       </DynamicLayout>
//     </ProtectedRoute>
//   );
// }

// app/sales/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Milk, Scale, ShoppingCart, CheckCircle, User, TrendingUp, Calculator } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import { useAuth } from '@/lib/auth/AuthContext';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import { SalesFormModal } from '@/components/modals/SalesFormModal';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getSalesMetadata, createSale, updateSale } from '@/lib/api/sales';
import { BackButton } from '@/components/ui/BackButton';
import { useRouter } from 'next/navigation';


type Buyer = {
  id: number;
  accountId: number;
  name: string;
  accountCode: string;
  added: boolean;
  grossLiters: number;
  lr: number;
  fat: number;
  netLiters: number;
  rate: number;
  amount: number;
  amountReceived: number;
  saleId?: number;
};

export default function SalesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [modalBuyer, setModalBuyer] = useState<Buyer | null>(null);
  const [chillarId, setChillarId] = useState<number | null>(null);
  const [revenueAccounts, setRevenueAccounts] = useState<{ accountId: number, accountName: string, accountCode: string }[]>([]);

  // Form state for live calculation
  const [formValues, setFormValues] = useState({
    grossLiters: 0,
    lr: 0,
    fat: 0,
    netLiters: 0,
    rate: 0,
    amount: 0,
    amountReceived: 0,
    revenueAccountId: 0
  });

  const calculateNetLiters = (lr: number, fat: number, volume: number, tsStandard: number = 13): number => {
    const fatOperations = 0.22 * fat + 0.72;
    const lrOperations = lr / 4;
    const snf = fatOperations + lrOperations;
    const volumeOperations = (snf + fat) * volume;
    const ts = volumeOperations / tsStandard;
    return parseFloat(ts.toFixed(2));
  };

  // Calculate net liters and amount
  const calculateValues = (gross: number, lr: number, fat: number, rate: number) => {
    const netLiters = calculateNetLiters(lr, fat, gross);
    const amount = netLiters * rate;
    return {
      netLiters: netLiters,
      amount: parseFloat(amount.toFixed(2))
    };
  };

  // Handle input changes and recalculate
  const handleInputChange = (field: string, value: number) => {
    const newValues = {
      ...formValues,
      [field]: value || 0,
    };

    const { netLiters, amount } = calculateValues(
      field === 'grossLiters' ? value : newValues.grossLiters,
      field === 'lr' ? value : newValues.lr,
      field === 'fat' ? value : newValues.fat,
      field === 'rate' ? value : newValues.rate
    );

    newValues.netLiters = netLiters;
    newValues.amount = amount;
    setFormValues(newValues);
  };

  // Fetch metadata on date change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const meta = await getSalesMetadata(date);
        setChillarId(meta.chillarId);
        setRevenueAccounts(meta.revenueAccounts);

        // app/sales/page.tsx
        const remaining: Buyer[] = meta.remainingAccounts.map(account => ({
          id: account.accountId,
          accountId: account.accountId,
          name: account.accountName,
          accountCode: account.accountCode,
          added: false,
          grossLiters: 0,
          lr: 0,
          fat: 0,
          netLiters: 0,
          rate: account.rate, // Now properly typed
          amount: 0,
          amountReceived: 0
        }));

        const added: Buyer[] = meta.addedSales.map(sale => ({
          id: sale.accountId,
          accountId: sale.accountId,
          name: sale.accountName,
          accountCode: sale.accountCode,
          added: true,
          grossLiters: sale.grossLiters,
          lr: sale.lr,
          fat: sale.fat,
          netLiters: sale.netLiters,
          rate: sale.rate,
          amount: sale.totalAmount,
          amountReceived: sale.amountReceived ?? 0,
          saleId: sale.saleId
        }));

        setBuyers([...remaining, ...added]);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);

  // Update form values when modal opens
  useEffect(() => {
    if (modalBuyer) {
      setFormValues({
        grossLiters: modalBuyer.grossLiters,
        lr: modalBuyer.lr,
        fat: modalBuyer.fat,
        netLiters: modalBuyer.netLiters,
        rate: modalBuyer.rate,
        amount: modalBuyer.amount,
        amountReceived: modalBuyer.amountReceived,
        revenueAccountId: revenueAccounts[0]?.accountId || 0
      });
    } else {
      setFormValues({
        grossLiters: 0,
        lr: 0,
        fat: 0,
        netLiters: 0,
        rate: 0,
        amount: 0,
        amountReceived: 0,
        revenueAccountId: revenueAccounts[0]?.accountId || 0
      });
    }
  }, [modalBuyer, revenueAccounts]);

  const openForm = (buyer: Buyer) => setModalBuyer(buyer);
  const closeForm = () => setModalBuyer(null);

  const onSubmit = async (formData: {
    grossLiters: number;
    lr: number;
    fat: number;
    netLiters: number;
    rate: number;
    amount: number;
    amountReceived: number;
    revenueAccountId: number;
  }) => {
    if (!modalBuyer || !chillarId) return;

    const payload = {
      date,
      accountId: modalBuyer.accountId,
      revenueAccountId: formData.revenueAccountId,
      chillarId,
      grossLiters: formData.grossLiters,
      lr: formData.lr,
      fat: formData.fat,
      netLiters: formData.netLiters,
      rate: formData.rate,
      amountReceived: formData.amountReceived
    };

    try {
      if (modalBuyer.added && modalBuyer.saleId) {
        await updateSale(modalBuyer.saleId, payload);
      } else {
        await createSale(payload);
      }

      // Refresh data after successful submission
      const meta = await getSalesMetadata(date);
      const updatedRemaining = meta.remainingAccounts.map(account => ({
        id: account.accountId,
        accountId: account.accountId,
        name: account.accountName,
        accountCode: account.accountCode,
        added: false,
        grossLiters: 0,
        lr: 0,
        fat: 0,
        netLiters: 0,
        rate: account.rate,
        amount: 0,
        amountReceived: 0
      }));

      const updatedAdded = meta.addedSales.map(sale => ({
        id: sale.accountId,
        accountId: sale.accountId,
        name: sale.accountName,
        accountCode: sale.accountCode,
        added: true,
        grossLiters: sale.grossLiters,
        lr: sale.lr,
        fat: sale.fat,
        netLiters: sale.netLiters,
        rate: sale.rate,
        amount: sale.totalAmount,
        amountReceived: sale.amountReceived ?? 0,
        saleId: sale.saleId
      }));

      setBuyers([...updatedRemaining, ...updatedAdded]);
      closeForm();
    } catch (error) {
      console.error('Error submitting sale:', error);
      // Handle error (show toast, etc.)
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const addedBuyers = buyers.filter(b => b.added);
    const totalSales = addedBuyers.reduce((sum, b) => sum + b.grossLiters, 0);
    const totalNetLiters = addedBuyers.reduce((sum, b) => sum + b.netLiters, 0);
    const difference = totalSales - totalNetLiters; // Difference between gross and net liters
    
    return {
      salesTotal: totalSales,
      netLitersTotal: totalNetLiters,
      difference: difference,
      amountTotal: addedBuyers.reduce((sum, b) => sum + b.amount, 0),
      count: addedBuyers.length
    };
  };

  const { salesTotal, netLitersTotal, difference, amountTotal, count } = calculateTotals();

  if (loading) return <MilkLoader />;

  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
        <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="block items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-blue-600">Milk Sales</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mb-4"
                />
              </div>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total Sales (Gross)"
              value={`${salesTotal.toFixed(2)} Ltrs`}
              icon={<Milk className="w-5 h-5" />}
              color="blue"
            />
            <SummaryCard
              title="Net Liters"
              value={`${netLitersTotal.toFixed(2)} Ltrs`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <SummaryCard
              title="Difference (Loss)"
              value={`${difference.toFixed(2)} Ltrs`}
              icon={<Calculator className="w-5 h-5" />}
              color={difference > 0 ? 'purple' : 'red'}
            />
            {isAdmin && (
              <SummaryCard
                title="Total Amount"
                value={`Rs${amountTotal.toFixed(2)}`}
                icon={<Scale className="w-5 h-5" />}
                color="yellow"
              />
            )}
          </div>

          {/* Buyers Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RemainingList
              title="Remaining Buyers"
              items={buyers.filter(b => !b.added)}
              getKey={b => String(b.id)}
              getName={b => b.name}
              getId={b => b.accountCode}
              getStatusLabel={b => (
                isAdmin ? (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    Rs{b.rate}/Ltr
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Pending
                  </span>
                )
              )}
              onItemClick={openForm}
              icon={<User className="w-5 h-5" />}
            />

            <AddedList
              title="Added Buyers"
              items={buyers.filter(b => b.added)}
              getKey={b => String(b.id)}
              getName={b => b.name}
              getId={b => b.accountCode}
              getDetails={b => (
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">{b.grossLiters.toFixed(2)} Ltrs</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>LR: {b.lr.toFixed(2)}</span>
                    <span> Fat: {b.fat.toFixed(2)}</span>
                    <span> Net: {b.netLiters.toFixed(2)}</span>
                  </div>
                  <p className="text-xs font-medium">Received: {b.amountReceived.toFixed(2)}</p>
                  {isAdmin && (
                    <p className="text-xs text-gray-600">Total: {b.amount.toFixed(2)}</p>
                  )}
                </div>
              )}
              onItemClick={openForm}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Modal */}
          <SalesFormModal
            isOpen={!!modalBuyer}
            onClose={closeForm}
            onSubmit={onSubmit}
            initialData={
              modalBuyer
                ? {
                  grossLiters: modalBuyer.grossLiters,
                  lr: modalBuyer.lr,
                  fat: modalBuyer.fat,
                  netLiters: modalBuyer.netLiters,
                  rate: modalBuyer.rate,
                  amount: modalBuyer.amount,
                  amountReceived: modalBuyer.amountReceived,
                  revenueAccountId: formValues.revenueAccountId,
                  date: date // Add date here
                }
                : undefined
            }
            buyerName={modalBuyer?.name || ''}
            buyerId={modalBuyer?.accountCode || ''}
            date={date}
            isAdmin={isAdmin}
            isFromAddedList={modalBuyer?.added || false}
            revenueAccounts={revenueAccounts}
            formValues={formValues}
            onInputChange={handleInputChange}
          />
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}