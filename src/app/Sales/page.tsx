// app/sales/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Milk, Scale, ShoppingCart, User, CheckCircle, Plus } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import MilkLoader from '@/components/ui/Loader';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include the role property
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // Add the role property
    };
  }
}

export default function SalesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(true);
  const grossLitersRef = useRef<HTMLInputElement>(null);
  
  // Sample data - replace with API calls
  const [buyers, setBuyers] = useState([
    { id: 'B001', name: 'Milk Depot 1', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 42, amount: 0 },
    { id: 'B002', name: 'Local Shop', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 40, amount: 0 },
    { id: 'B003', name: 'Hotel Grand', added: false, grossLiters: 0, lr: 0, fat: 0, rate: 45, amount: 0 },
  ]);

  const [chillarReceiveTotal, setChillarReceiveTotal] = useState(385); // Sample data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    buyerId: '',
    buyerName: '',
    grossLiters: '',
    lr: '',
    fat: '',
    netLiters: '',
    rate: '',
    amount: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBuyers = buyers.map(buyer => 
      buyer.id === formData.buyerId
        ? { 
            ...buyer, 
            added: true,
            grossLiters: parseFloat(formData.grossLiters),
            lr: parseFloat(formData.lr),
            fat: parseFloat(formData.fat),
            amount: parseFloat(formData.amount)
          }
        : buyer
    );

    setBuyers(updatedBuyers);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      buyerId: '',
      buyerName: '',
      grossLiters: '',
      lr: '',
      fat: '',
      netLiters: '',
      rate: '',
      amount: ''
    });
  };

  const handleBuyerClick = (buyer: any) => {
    setFormData({
      ...formData,
      buyerId: buyer.id,
      buyerName: buyer.name,
      grossLiters: buyer.added ? buyer.grossLiters.toString() : '',
      lr: buyer.added ? buyer.lr.toString() : '',
      fat: buyer.added ? buyer.fat.toString() : '',
      rate: buyer.rate.toString(),
      netLiters: buyer.added ? calculateNetLiters(buyer.grossLiters, buyer.lr, buyer.fat) : '',
      amount: buyer.added ? buyer.amount.toString() : ''
    });
    
    setTimeout(() => grossLitersRef.current?.focus(), 100);
  };

  const calculateNetLiters = (gross: string | number, lr: string | number, fat: string | number) => {
    const grossNum = typeof gross === 'string' ? parseFloat(gross) || 0 : gross;
    const lrNum = typeof lr === 'string' ? parseFloat(lr) || 0 : lr;
    const fatNum = typeof fat === 'string' ? parseFloat(fat) || 0 : fat;
    
    // Replace with your actual net liters calculation formula
    const net = grossNum - (lrNum * fatNum * 0.01);
    return net.toFixed(2);
  };

  const calculateAmount = (netLiters: string, rate: string) => {
    const net = parseFloat(netLiters) || 0;
    const rateNum = parseFloat(rate) || 0;
    return (net * rateNum).toFixed(2);
  };

  if (isLoading) return <MilkLoader />;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
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
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          {formData.buyerId ? 'Update Sale' : 'Record New Sale'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer ID</label>
            <input
              type="text"
              value={formData.buyerId}
              onChange={(e) => setFormData({...formData, buyerId: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              readOnly={!!formData.buyerId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
            <input
              type="text"
              value={formData.buyerName}
              onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              readOnly={!!formData.buyerId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gross Liters</label>
            <input
              type="number"
              ref={grossLitersRef}
              value={formData.grossLiters}
              onChange={(e) => setFormData({
                ...formData, 
                grossLiters: e.target.value,
                netLiters: calculateNetLiters(e.target.value, formData.lr, formData.fat),
                amount: calculateAmount(
                  calculateNetLiters(e.target.value, formData.lr, formData.fat),
                  formData.rate
                )
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LR</label>
            <input
              type="number"
              value={formData.lr}
              onChange={(e) => setFormData({
                ...formData, 
                lr: e.target.value,
                netLiters: calculateNetLiters(formData.grossLiters, e.target.value, formData.fat),
                amount: calculateAmount(
                  calculateNetLiters(formData.grossLiters, e.target.value, formData.fat),
                  formData.rate
                )
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fat</label>
            <input
              type="number"
              value={formData.fat}
              onChange={(e) => setFormData({
                ...formData, 
                fat: e.target.value,
                netLiters: calculateNetLiters(formData.grossLiters, formData.lr, e.target.value),
                amount: calculateAmount(
                  calculateNetLiters(formData.grossLiters, formData.lr, e.target.value),
                  formData.rate
                )
              })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Net Liters</label>
            <input
              type="number"
              value={formData.netLiters}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          {isAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹/Ltr)</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({
                    ...formData, 
                    rate: e.target.value,
                    amount: calculateAmount(formData.netLiters, e.target.value)
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium
                       flex items-center justify-center gap-2"
            >
              {formData.buyerId ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {formData.buyerId ? 'Update Sale' : 'Record Sale'}
            </button>
            
            {formData.buyerId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Buyers Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Remaining Buyers */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
            <User className="w-5 h-5" />
            Remaining Buyers ({buyers.filter(b => !b.added).length})
          </h3>
          <div className="space-y-2">
            {buyers.filter(b => !b.added).map((buyer) => (
              <div 
                key={buyer.id}
                className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-red-50 transition-colors"
                onClick={() => handleBuyerClick(buyer)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{buyer.name}</p>
                    <p className="text-sm text-gray-600">ID: {buyer.id}</p>
                  </div>
                  {isAdmin && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      ₹{buyer.rate}/Ltr
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Added Buyers */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Added Buyers ({buyers.filter(b => b.added).length})
          </h3>
          <div className="space-y-2">
            {buyers.filter(b => b.added).map((buyer) => (
              <div 
                key={buyer.id}
                className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => handleBuyerClick(buyer)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{buyer.name}</p>
                    <p className="text-sm text-gray-600">ID: {buyer.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{buyer.grossLiters} Ltrs</p>
                    {isAdmin && (
                      <p className="text-xs text-gray-600">₹{buyer.amount.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}