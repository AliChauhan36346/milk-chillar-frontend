
// app/purchase/page.tsx
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Milk, Sun, Moon, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { 
  getPurchaseMetadata, 
  createPurchase, 
  updatePurchase,
  type PurchaseMetadata, 
  type Purchase, 
  type ExpenseAccount 
} from '@/lib/api/purchases';

type ListItem = {
  id: number;
  name: string;
  code: string;
  time: 'morning' | 'evening';
  quantity: number;
  rate: number;
  added: boolean;
  purchaseId?: number;
};

export default function PurchasePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDodhi = user?.role === 'dodhi';
  const today = new Date().toISOString().split('T')[0];

  // Core state
  const [metadata, setMetadata] = useState<PurchaseMetadata | null>(null);
  const [selectedExpenseAccount, setSelectedExpenseAccount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');

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

  // Load metadata
  const loadMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPurchaseMetadata(date, timeFilter);
      setMetadata(data);

      // Auto-select expense account for dodhi
      if (isDodhi && data.expenseAccounts.length > 0) {
        const dodhiAccount = data.expenseAccounts.find(acc => acc.accountCode === '50001001');
        if (dodhiAccount) {
          setSelectedExpenseAccount(dodhiAccount.accountId);
        }
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
    } finally {
      setLoading(false);
    }
  }, [date, timeFilter, isDodhi]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  // Helper function to get available times for a supplier
  const getAvailableTimesForSupplier = useCallback((supplierId: number) => {
    if (!metadata) return [];
    
    const addedTimes = metadata.addedPurchases
      .filter(p => p.accountId === supplierId)
      .map(p => p.timeOfDay);
    
    const remainingTimes = metadata.remainingSuppliers
      .filter(s => s.accountId === supplierId)
      .map(s => s.timeOfDay);

    return remainingTimes;
  }, [metadata]);

  // Memoized list items generation
  const { addedItems, remainingItems } = useMemo(() => {
    if (!metadata) return { addedItems: [], remainingItems: [] };

    const added: ListItem[] = [];
    const remaining: ListItem[] = [];

    // Process added purchases
    metadata.addedPurchases.forEach(purchase => {
      if (timeFilter === 'both' || timeFilter === purchase.timeOfDay) {
        added.push({
          id: purchase.accountId,
          name: purchase.accountName,
          code: purchase.accountCode,
          time: purchase.timeOfDay,
          quantity: purchase.grossLiters,
          rate: purchase.rate,
          added: true,
          purchaseId: purchase.purchaseId
        });
      }
    });

    // Process remaining suppliers
    metadata.remainingSuppliers.forEach(supplier => {
      if (timeFilter === 'both' || timeFilter === supplier.timeOfDay) {
        remaining.push({
          id: supplier.accountId,
          name: supplier.accountName,
          code: supplier.accountCode,
          time: supplier.timeOfDay,
          quantity: 0,
          rate: supplier.rate,
          added: false
        });
      }
    });

    return { addedItems: added, remainingItems: remaining };
  }, [metadata, timeFilter]);

  // Memoized totals calculation
  const totals = useMemo(() => {
    if (!metadata) return {
      morningTotal: 0, eveningTotal: 0, combinedTotal: 0,
      morningAmount: 0, eveningAmount: 0, combinedAmount: 0
    };

    let morningTotal = 0, eveningTotal = 0;
    let morningAmount = 0, eveningAmount = 0;

    metadata.addedPurchases.forEach(purchase => {
      if (purchase.timeOfDay === 'morning') {
        morningTotal += purchase.grossLiters;
        morningAmount += purchase.totalAmount;
      } else {
        eveningTotal += purchase.grossLiters;
        eveningAmount += purchase.totalAmount;
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
  }, [metadata]);

  const handleItemClick = useCallback((item: ListItem) => {
    const availableTimes = getAvailableTimesForSupplier(item.id);
    
    if (item.added) {
      // For added items, always single update
      setModalData({
        supplier: {
          id: item.id,
          name: item.name,
          code: item.code,
          rate: item.rate
        },
        availableTimes: [item.time], // Only the specific time for update
        isUpdate: true,
        updateData: {
          time: item.time,
          purchaseId: item.purchaseId!,
          currentQuantity: item.quantity
        }
      });
    } else {
      // For remaining items
      if (timeFilter === 'both') {
        // Show all available times when both filter is selected
        setModalData({
          supplier: {
            id: item.id,
            name: item.name,
            code: item.code,
            rate: item.rate
          },
          availableTimes,
          isUpdate: false
        });
      } else {
        // Show only the clicked time when specific filter is selected
        setModalData({
          supplier: {
            id: item.id,
            name: item.name,
            code: item.code,
            rate: item.rate
          },
          availableTimes: [item.time],
          isUpdate: false
        });
      }
    }
    
    setShowModal(true);
  }, [getAvailableTimesForSupplier, timeFilter]);

  const handleModalSubmit = useCallback(async (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => {
    if (!modalData || !metadata) return;

    const expenseAccountId = data.expenseAccountId || selectedExpenseAccount;
    if (!expenseAccountId) {
      alert('Please select an expense account');
      return;
    }

    try {
      const rate = isAdmin ? (data.rate || modalData.supplier.rate) : modalData.supplier.rate;

      if (modalData.isUpdate && modalData.updateData) {
        // Handle single update
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
          dodhiId: metadata.dodhiId,
          grossLiters: quantity,
          rate,
          balance: 0
        };

        await updatePurchase(modalData.updateData.purchaseId, purchaseData);
      } else {
        // Handle creation (single or batch)
        const purchases = [];

        // Add morning purchase if available and quantity provided
        if (modalData.availableTimes.includes('morning') && data.morningQuantity && data.morningQuantity > 0) {
          purchases.push({
            date: data.date,
            timeOfDay: 'morning' as const,
            accountId: modalData.supplier.id,
            expenseAccountId,
            dodhiId: metadata.dodhiId,
            grossLiters: data.morningQuantity,
            rate,
            balance: 0
          });
        }

        // Add evening purchase if available and quantity provided
        if (modalData.availableTimes.includes('evening') && data.eveningQuantity && data.eveningQuantity > 0) {
          purchases.push({
            date: data.date,
            timeOfDay: 'evening' as const,
            accountId: modalData.supplier.id,
            expenseAccountId,
            dodhiId: metadata.dodhiId,
            grossLiters: data.eveningQuantity,
            rate,
            balance: 0
          });
        }

        if (purchases.length === 0) {
          alert('Please enter at least one valid quantity');
          return;
        }

        // Create all purchases
        await Promise.all(purchases.map(purchase => createPurchase(purchase)));
      }

      setShowModal(false);
      setModalData(null);
      setDate(data.date);
      await loadMetadata();
    } catch (error) {
      console.error('Failed to save purchase:', error);
      alert('Failed to save purchase. Please try again.');
    }
  }, [modalData, metadata, selectedExpenseAccount, isAdmin, loadMetadata]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setModalData(null);
  }, []);

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

          {/* Expense Account Selection for Admin */}
          {isAdmin && metadata && (
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
                {metadata.expenseAccounts.map(account => (
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
              <p className="text-2xl font-bold text-blue-600">{totals.morningTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">₹{totals.morningAmount.toFixed(2)}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg ${timeFilter === 'evening' || timeFilter === 'both' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <Moon className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Evening Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{totals.eveningTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">₹{totals.eveningAmount.toFixed(2)}</p>
              )}
            </div>

            <div className={`p-3 rounded-lg ${timeFilter === 'both' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-gray-700 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Combined Total</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{totals.combinedTotal} Ltrs</p>
              {isAdmin && (
                <p className="text-sm text-gray-600">{totals.combinedAmount.toFixed(2)}</p>
              )}
            </div>
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
            <RemainingList
              title="Remaining Suppliers"
              items={remainingItems}
              getKey={(item) => `${item.id}-${item.time}`}
              getName={(item) => item.name}
              getId={(item) => item.code}
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
              onItemClick={handleItemClick}
              icon={<CheckCircle className="w-5 h-5" />}
            />

            <AddedList
              title="Added Suppliers"
              items={addedItems}
              getKey={(item) => `${item.id}-${item.time}`}
              getName={(item) => item.name}
              getId={(item) => item.code}
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
              onItemClick={handleItemClick}
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>

          {/* Purchase Modal */}
          {modalData && (
            <PurchaseModal
              isOpen={showModal}
              onClose={handleModalClose}
              onSubmit={handleModalSubmit}
              supplier={modalData.supplier}
              availableTimes={modalData.availableTimes}
              isAdmin={isAdmin}
              expenseAccounts={metadata?.expenseAccounts || []}
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