// app/sales/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Milk, Scale, ShoppingCart, CheckCircle, User } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import { useAuth } from '@/lib/auth/AuthContext'; // Replace next-auth with your auth
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { AddedList } from '@/components/ui/List/AddedList';
import { RemainingList } from '@/components/ui/List/RemainingList';
import { SalesFormModal } from '@/components/modals/SalesFormModal'; // We'll create this
import ProtectedRoute from '@/components/ProtectedRoutes'; // Ensure this is set up correctly

type Buyer = {
  id: string;
  name: string;
  added: boolean;
  grossLiters: number;
  lr: number;
  fat: number;
  rate: number;
  amount: number;
};

export default function SalesPage() {
  const { user } = useAuth(); // Use your custom auth hook
  const isAdmin = user?.role === 'admin'; // Check role from your auth system
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState<Buyer | null>(null);

  // ... rest of your existing code ...

  // Sample data - replace with API calls
  const [buyers, setBuyers] = useState<Buyer[]>([
    { id: 'B001', name: 'Milk Depot 1', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 42, amount: 0 },
    { id: 'B002', name: 'Local Shop', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 40, amount: 0 },
    { id: 'B003', name: 'Hotel Grand', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 45, amount: 0 },
  ]);

  const [chillarReceiveTotal, setChillarReceiveTotal] = useState(385); // Sample data
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate totals
  const calculateTotals = () => {
    const addedBuyers = buyers.filter(b => b.added);
    return {
      salesTotal: addedBuyers.reduce((sum, b) => sum + b.grossLiters, 0),
      amountTotal: addedBuyers.reduce((sum, b) => sum + b.amount, 0),
      stock: chillarReceiveTotal - addedBuyers.reduce((sum, b) => sum + b.grossLiters, 0),
      count: addedBuyers.length
    };
  };

  const { salesTotal, amountTotal, stock, count } = calculateTotals();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = (formData: Omit<Buyer, 'id' | 'name' | 'added' | 'rate'> & { rate?: number }) => {
    if (!currentBuyer) return;

    const updatedBuyers = buyers.map(buyer =>
      buyer.id === currentBuyer.id
        ? {
          ...buyer,
          added: true,
          grossLiters: formData.grossLiters,
          lr: formData.lr,
          fat: formData.fat,
          amount: formData.amount,
          ...(isAdmin && formData.rate ? { rate: formData.rate } : {})
        }
        : buyer
    );

    setBuyers(updatedBuyers);
    setShowModal(false);
    setCurrentBuyer(null);
  };

  const handleBuyerClick = (buyer: Buyer) => {
    setCurrentBuyer(buyer);
    setShowModal(true);
  };

  const calculateNetLiters = (gross: number, lr: number, fat: number) => {
    return gross - (lr * fat * 0.01);
  };

  if (isLoading) return <MilkLoader />;

  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      
    <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
      <div className="max-w-6xl mx-auto p-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
            <ShoppingCart className="w-6 h-6" />
            Milk Sales
          </h1>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Total Sales"
            value={`${salesTotal.toFixed(2)} Ltrs`}
            icon={<Milk className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            title="Chillar Receive"
            value={`${chillarReceiveTotal.toFixed(2)} Ltrs`}
            icon={<Scale className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            title="Current Stock"
            value={`${stock.toFixed(2)} Ltrs`}
            icon={<Milk className="w-5 h-5" />}
            color={stock >= 0 ? 'purple' : 'red'}
          />
          {isAdmin && (
            <SummaryCard
              title="Total Amount"
              value={`₹${amountTotal.toFixed(2)}`}
              icon={<Scale className="w-5 h-5" />}
              color="yellow"
            />
          )}
        </div>

        {/* Buyers Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RemainingList
            title="Remaining Buyers"
            items={buyers.filter(b => !b.added)}
            getKey={(item) => item.id}
            getName={(item) => item.name}
            getId={(item) => item.id}
            getStatusLabel={(item) => (
              isAdmin ? (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  ₹{item.rate}/Ltr
                </span>
              ) : (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              )
            )}
            onItemClick={handleBuyerClick}
            icon={<User className="w-5 h-5" />}
          />

          <AddedList
            title="Added Buyers"
            items={buyers.filter(b => b.added)}
            getKey={(item) => item.id}
            getName={(item) => item.name}
            getId={(item) => item.id}
            getDetails={(item) => (
              <div className="text-right">
                <p className="text-sm font-medium">{item.grossLiters} Ltrs</p>
                {isAdmin && (
                  <p className="text-xs text-gray-600">₹{item.amount.toFixed(2)}</p>
                )}
              </div>
            )}
            onItemClick={handleBuyerClick}
            icon={<CheckCircle className="w-5 h-5" />}
          />
        </div>

        {/* We'll implement the modal here in the next step */}

        // In your SalesPage component, add the modal at the bottom:
        <SalesFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setCurrentBuyer(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={currentBuyer ? {
            grossLiters: currentBuyer.grossLiters,
            lr: currentBuyer.lr,
            fat: currentBuyer.fat,
            rate: currentBuyer.rate,
            amount: currentBuyer.amount,
            date: date
          } : undefined}
          buyerName={currentBuyer?.name || ''}
          buyerId={currentBuyer?.id || ''}
          date={date}
          isAdmin={isAdmin}
          isFromAddedList={currentBuyer?.added || false}
        />
      </div>
    </DynamicLayout>
    </ProtectedRoute>
  );
}