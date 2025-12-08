

'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Milk, Sun, Moon, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import MilkLoader from '@/components/ui/Loader';
import { CenteredSpinner } from '@/components/ui/spinner';
import { BackButton } from '@/components/ui/BackButton';
import { InfiniteAddedList } from '@/components/ui/List/InfiniteAddedList';
import { InfiniteRemainingList } from '@/components/ui/List/InfiniteRemainingList';
import ProtectedRoute from '@/components/ProtectedRoutes';
import {
  createPurchase,
  updatePurchase,
  getPurchaseSummary,
  getRemainingSuppliers,
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

  const getAvailableTimesForSupplier = useCallback(async (supplierId: number, supplierCode: string, clickedTimeOfDay?: 'morning' | 'evening') => {
    if (timeFilter !== 'both') {
      return [timeFilter];
    }

    // When filter is "both", check which times are actually available for this supplier
    if (!selectedDodhiId) {
      // Fallback to clicked time if no dodhi selected
      return clickedTimeOfDay ? [clickedTimeOfDay] : ['morning', 'evening'];
    }

    try {
      // Fetch remaining suppliers using the supplier code for more accurate search
      const result = await getRemainingSuppliers(
        date,
        'both',
        selectedDodhiId,
        supplierCode, // Use supplier code to find this specific supplier
        1,
        100 // Get enough items to find this supplier
      );

      // Find all entries for this supplier (by accountId to be sure)
      const supplierEntries = result.items.filter(item => item.accountId === supplierId);
      const availableTimesSet = new Set<'morning' | 'evening'>();

      supplierEntries.forEach(entry => {
        availableTimesSet.add(entry.timeOfDay);
      });

      // If we found entries, return them; otherwise use the clicked time or default to both
      if (availableTimesSet.size > 0) {
        return Array.from(availableTimesSet);
      }

      // Fallback: if clicked item had a timeOfDay, use that; otherwise both
      return clickedTimeOfDay ? [clickedTimeOfDay] : ['morning', 'evening'];
    } catch (error) {
      console.error('Failed to fetch available times for supplier:', error);
      // Fallback to clicked time or both
      return clickedTimeOfDay ? [clickedTimeOfDay] : ['morning', 'evening'];
    }
  }, [timeFilter, selectedDodhiId, date]);

  const handleItemClick = useCallback(async (item: ListDataItem) => {
    const isPurchase = 'purchaseId' in item;
    const remainingSupplier = item as RemainingSupplier;

    const supplier = {
      id: item.accountId,
      name: item.accountName,
      code: item.accountCode,
      rate: isPurchase ? item.rate : remainingSupplier.rate
    };

    // For remaining suppliers, pass the timeOfDay to check available times
    const clickedTimeOfDay = isPurchase ? undefined : remainingSupplier.timeOfDay;
    const availableTimes = isPurchase
      ? [item.timeOfDay]
      : await getAvailableTimesForSupplier(item.accountId, item.accountCode, clickedTimeOfDay);

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
      throw error; // Re-throw to let modal handle the loading state
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
    return <MilkLoader />;
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
                {loadingSummary ? (
                  <div className="md:col-span-3">
                    <CenteredSpinner size="sm" />
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
                      <CenteredSpinner size="md" message="Loading added purchases..." />
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