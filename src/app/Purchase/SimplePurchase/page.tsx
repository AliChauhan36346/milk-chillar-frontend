
// app/purchase/page.tsx
'use client';
import { useState } from 'react';
import { Milk, Sun, Moon, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';

type Supplier = {
  id: string;
  name: string;
  rate: number;
  morning: { added: boolean; quantity: number };
  evening: { added: boolean; quantity: number };
};

type ListItem = {
  id: string;
  name: string;
  time: 'morning' | 'evening';
  quantity: number;
  rate: number;
  added: boolean;
};

export default function PurchasePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '001',
      name: 'Rajesh Dairy',
      rate: 42,
      morning: { added: false, quantity: 0 },
      evening: { added: false, quantity: 0 }
    },
    {
      id: '002',
      name: 'Ganesh Milk Farm',
      rate: 41,
      morning: { added: false, quantity: 0 },
      evening: { added: false, quantity: 0 }
    },
    {
      id: '003',
      name: 'Shivam Suppliers',
      rate: 43,
      morning: { added: false, quantity: 0 },
      evening: { added: false, quantity: 0 }
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [currentTime, setCurrentTime] = useState<'morning' | 'evening' | 'both'>('both');
  const [date, setDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');

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

  const handleFormSubmit = (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string
  }) => {
    if (!currentSupplier) return;

    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.id === currentSupplier.id) {
        return {
          ...supplier,
          rate: isAdmin ? (data.rate || supplier.rate) : supplier.rate,
          morning: {
            added: data.morningQuantity !== undefined,
            quantity: data.morningQuantity || 0
          },
          evening: {
            added: data.eveningQuantity !== undefined,
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
  };

  const prepareListItems = (isAdded: boolean): ListItem[] => {
    const result: ListItem[] = [];

    suppliers.forEach(supplier => {
      if ((timeFilter === 'morning' || timeFilter === 'both') &&
        supplier.morning.added === isAdded) {
        result.push({
          id: supplier.id,
          name: supplier.name,
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

  return (
    <ProtectedRoute allowedRoles={['admin', 'dodhi']}>
      <DynamicLayout allowedRoles={['admin', 'dodhi']}>
        <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex items-center justify-between mb-6">
              <BackButton />
              <h1 className="text-2xl font-semibold flex items-center gap-2 text-blue-600">
                <Milk className="w-6 h-6" />
                Milk Purchase
              </h1>
              <div className="w-10"></div> {/* Spacer for layout balance */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
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
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4 justify-center">
            <button
              onClick={() => setTimeFilter('morning')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'morning' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            >
              <Sun className="w-4 h-4" />
              Morning Only
            </button>
            <button
              onClick={() => setTimeFilter('evening')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'evening' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
            >
              <Moon className="w-4 h-4" />
              Evening Only
            </button>
            <button
              onClick={() => setTimeFilter('both')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${timeFilter === 'both' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
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