
// app/purchase/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Milk, Sun, Moon, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { getPurchaseMetadata, createPurchase, type PurchaseMetadata, type Purchase, type RemainingSupplier, type ExpenseAccount } from '@/lib/api/purchases';

type Supplier = {
  id: number;
  name: string;
  code: string;
  rate: number;
  morning: { added: boolean; quantity: number };
  evening: { added: boolean; quantity: number };
};

type ListItem = {
  id: number;
  name: string;
  code: string;
  time: 'morning' | 'evening';
  quantity: number;
  rate: number;
  added: boolean;
};

export default function PurchasePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDodhi = user?.role === 'dodhi';
  const today = new Date().toISOString().split('T')[0];

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseMetadata, setPurchaseMetadata] = useState<PurchaseMetadata | null>(null);
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccount[]>([]);
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [currentTime, setCurrentTime] = useState<'morning' | 'evening' | 'both'>('both');
  const [date, setDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');

  // Load purchase metadata when component mounts or date/timeFilter changes
  useEffect(() => {
    loadPurchaseMetadata();
  }, [date, timeFilter]);

  // Auto-select expense account for dodhi users
  useEffect(() => {
    if (isDodhi && expenseAccounts.length > 0) {
      const dodhiAccount = expenseAccounts.find(acc => acc.accountCode === '50001001');
      if (dodhiAccount) {
        setSelectedExpenseAccount(dodhiAccount.accountId);
      }
    }
  }, [isDodhi, expenseAccounts]);

  const loadPurchaseMetadata = async () => {
    try {
      setLoading(true);
      const metadata = await getPurchaseMetadata(date, timeFilter);
      setPurchaseMetadata(metadata);
      setExpenseAccounts(metadata.expenseAccounts);
      
      // Convert remaining suppliers and added purchases to supplier format
      const suppliersMap = new Map<number, Supplier>();
      
      // Add remaining suppliers
      metadata.remainingSuppliers.forEach(supplier => {
        const existingSupplier = suppliersMap.get(supplier.accountId) || {
          id: supplier.accountId,
          name: supplier.accountName,
          code: supplier.accountCode,
          rate: supplier.rate,
          morning: { added: false, quantity: 0 },
          evening: { added: false, quantity: 0 }
        };
        
        if (supplier.timeOfDay === 'morning') {
          existingSupplier.morning = { added: false, quantity: 0 };
        } else {
          existingSupplier.evening = { added: false, quantity: 0 };
        }
        
        suppliersMap.set(supplier.accountId, existingSupplier);
      });
      
      // Add already added purchases
      metadata.addedPurchases.forEach(purchase => {
        const existingSupplier = suppliersMap.get(purchase.accountId) || {
          id: purchase.accountId,
          name: purchase.accountName,
          code: purchase.accountCode,
          rate: purchase.rate,
          morning: { added: false, quantity: 0 },
          evening: { added: false, quantity: 0 }
        };
        
        if (purchase.timeOfDay === 'morning') {
          existingSupplier.morning = { added: true, quantity: purchase.grossLiters };
        } else {
          existingSupplier.evening = { added: true, quantity: purchase.grossLiters };
        }
        
        suppliersMap.set(purchase.accountId, existingSupplier);
      });
      
      setSuppliers(Array.from(suppliersMap.values()));
    } catch (error) {
      console.error('Failed to load purchase metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let morningTotal = 0;
    let eveningTotal = 0;
    let morningAmount = 0;
    let eveningAmount = 0;

    suppliers.forEach(supplier => {
      if (supplier.morning.added) {
        morningTotal += supplier.morning.quantity;
        morningAmount += supplier.morning.quantity * supplier.rate;
      }
      if (supplier.evening.added) {
        eveningTotal += supplier.evening.quantity;
        eveningAmount += supplier.evening.quantity * supplier.rate;
      }
    });

    return {
      morningTotal,
      eveningTotal,
      combinedTotal: morningTotal + eveningTotal,
      morningAmount,
      eveningAmount,
      combinedAmount: morningAmount + eveningAmount
    };
  };

  const {
    morningTotal,
    eveningTotal,
    combinedTotal,
    morningAmount,
    eveningAmount,
    combinedAmount
  } = calculateTotals();

  const handleFormSubmit = async (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => {
    if (!currentSupplier || !purchaseMetadata) return;
    
    const expenseAccountId = data.expenseAccountId || selectedExpenseAccount;
    if (!expenseAccountId) {
      alert('Please select an expense account');
      return;
    }

    try {
      const purchases = [];
      
      // Create morning purchase if quantity provided
      if (data.morningQuantity !== undefined && data.morningQuantity > 0) {
        const morningPurchase = {
          date: data.date,
          timeOfDay: 'morning' as const,
          accountId: currentSupplier.id,
          expenseAccountId,
          dodhiId: purchaseMetadata.dodhiId,
          grossLiters: data.morningQuantity,
          rate: isAdmin ? (data.rate || currentSupplier.rate) : currentSupplier.rate,
          balance: 0 // You may want to calculate this based on your business logic
        };
        purchases.push(await createPurchase(morningPurchase));
      }
      
      // Create evening purchase if quantity provided
      if (data.eveningQuantity !== undefined && data.eveningQuantity > 0) {
        const eveningPurchase = {
          date: data.date,
          timeOfDay: 'evening' as const,
          accountId: currentSupplier.id,
          expenseAccountId,
          dodhiId: purchaseMetadata.dodhiId,
          grossLiters: data.eveningQuantity,
          rate: isAdmin ? (data.rate || currentSupplier.rate) : currentSupplier.rate,
          balance: 0 // You may want to calculate this based on your business logic
        };
        purchases.push(await createPurchase(eveningPurchase));
      }
      
      // Update local state to reflect the changes
      const updatedSuppliers = suppliers.map(supplier => {
        if (supplier.id === currentSupplier.id) {
          return {
            ...supplier,
            rate: isAdmin ? (data.rate || supplier.rate) : supplier.rate,
            morning: {
              added: data.morningQuantity !== undefined && data.morningQuantity > 0,
              quantity: data.morningQuantity || 0
            },
            evening: {
              added: data.eveningQuantity !== undefined && data.eveningQuantity > 0,
              quantity: data.eveningQuantity || 0
            }
          };
        }
        return supplier;
      });

      setSuppliers(updatedSuppliers);
      setShowModal(false);
      setCurrentSupplier(null);
      setDate(data.date);
      
      // Reload metadata to get updated data
      await loadPurchaseMetadata();
    } catch (error) {
      console.error('Failed to create purchase:', error);
      alert('Failed to create purchase. Please try again.');
    }
  };

  const prepareListItems = (isAdded: boolean): ListItem[] => {
    const result: ListItem[] = [];

    suppliers.forEach(supplier => {
      if ((timeFilter === 'morning' || timeFilter === 'both') &&
        supplier.morning.added === isAdded) {
        result.push({
          id: supplier.id,
          name: supplier.name,
          code: supplier.code,
          time: 'morning',
          quantity: supplier.morning.quantity,
          rate: supplier.rate,
          added: supplier.morning.added
        });
      }

      if ((timeFilter === 'evening' || timeFilter === 'both') &&
        supplier.evening.added === isAdded) {
        result.push({
          id: supplier.id,
          name: supplier.name,
          code: supplier.code,
          time: 'evening',
          quantity: supplier.evening.quantity,
          rate: supplier.rate,
          added: supplier.evening.added
        });
      }
    });

    return result;
  };

  const handleSupplierClick = (item: ListItem) => {
    const supplier = suppliers.find(s => s.id === item.id);
    if (!supplier) return;

    setCurrentSupplier(supplier);

    // Determine if we should show both fields
    const showBoth = timeFilter === 'both' &&
      !supplier.morning.added &&
      !supplier.evening.added;

    setCurrentTime(showBoth ? 'both' : item.time);
    setShowModal(true);
  };

  const remainingItems = prepareListItems(false);
  const addedItems = prepareListItems(true);

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <Milk className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Milk Purchase</h1>
              </div>
            </div>
          </div>

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

          {/* Date Selection */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Summary Cards */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg ${timeFilter === 'morning' || timeFilter === 'both' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Morning Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{morningTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">₹{morningAmount.toFixed(2)}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg ${timeFilter === 'evening' || timeFilter === 'both' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <Moon className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Evening Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{eveningTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">₹{eveningAmount.toFixed(2)}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg ${timeFilter === 'both' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Combined Total</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{combinedTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">₹{combinedAmount.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Time Filter */}
          <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 justify-center">
            <button
              onClick={() => setTimeFilter('morning')}
              className={`px-1 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              <Sun className="w-4 h-4" />
              Morning Only
            </button>
            <button
              onClick={() => setTimeFilter('evening')}
              className={`px-1 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'evening' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
            >
              <Moon className="w-4 h-4" />
              Evening Only
            </button>
            <button
              onClick={() => setTimeFilter('both')}
              className={`px-1 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'both' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
            >
              <CheckCircle className="w-4 h-4" />
              Both
            </button>
          </div>

          {/* Suppliers Lists */}
          <div className="grid md:grid-cols-2 gap-6">
            <RemainingList
              title="Remaining Suppliers"
              items={remainingItems}
              getKey={(item) => `${item.id}-${item.time}`}
              getName={(item) => item.name}
              getId={(item) => item.id}
              getStatusLabel={(item) => {
                const timeClass = item.time === 'morning' ?
                  'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800';

                return (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        ₹{item.rate}/L
                      </span>
                    )}
                    <span className={`${timeClass} px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                      {item.time === 'morning' ? (
                        <Sun className="w-3 h-3" />
                      ) : (
                        <Moon className="w-3 h-3" />
                      )}
                      {item.time}
                    </span>
                  </div>
                );
              }}
              onItemClick={handleSupplierClick}
              icon={<CheckCircle className="w-5 h-5" />}
            />

            <AddedList
              title="Added Suppliers"
              items={addedItems}
              getKey={(item) => `${item.id}-${item.time}`}
              getName={(item) => item.name}
              getId={(item) => item.id}
              getDetails={(item) => (
                <div className="flex items-center gap-2">
                  <span className={`${item.time === 'morning' ?
                    'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                    } px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                    {item.time === 'morning' ? (
                      <Sun className="w-3 h-3" />
                    ) : (
                      <Moon className="w-3 h-3" />
                    )}
                    {item.time}
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {item.quantity} Ltrs
                    {isAdmin && (
                      <span className="block text-xs">
                        ₹{(item.quantity * item.rate).toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>
              )}
              onItemClick={handleSupplierClick}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Purchase Modal */}
          <PurchaseModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleFormSubmit}
            supplier={currentSupplier}
            time={currentTime}
            isAdmin={isAdmin}
            expenseAccounts={expenseAccounts}
            selectedExpenseAccount={selectedExpenseAccount}
            initialData={currentSupplier ? {
              morningQuantity: currentSupplier.morning.added ? currentSupplier.morning.quantity : undefined,
              eveningQuantity: currentSupplier.evening.added ? currentSupplier.evening.quantity : undefined,
              rate: isAdmin ? currentSupplier.rate : undefined,
              date: date
            } : undefined}
          />
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}