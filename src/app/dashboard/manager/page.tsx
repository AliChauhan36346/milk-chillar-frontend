// app/dashboard/manager/page.tsx
'use client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function ManagerDashboard() {
  // Sample data - replace with real data
  const metrics = {
    purchase: 385, // liters
    receive: 375, // liters
    sales: 275, // liters
    currentStock: 220, // liters
    payments: 125000, // rupees
    receipts: 150000 // rupees
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount).replace('PKR', 'Rs.');
  };

  return (
    <DashboardLayout role="manager">
      {/* Big Action Buttons - Simple Navigation */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/reports/saleReport" className="bg-blue-100 hover:bg-blue-200 p-4 rounded-lg text-center">
          <div className="text-blue-600 text-2xl mb-2">📊</div>
          <p className="font-medium">Sales Report</p>
        </Link>
        
        <Link href="/reports/dodhiPurchaseReport" className="bg-green-100 hover:bg-green-200 p-4 rounded-lg text-center">
          <div className="text-green-600 text-2xl mb-2">🛒</div>
          <p className="font-medium">Purchase Report</p>
        </Link>
        
        <Link href="/reports/receive" className="bg-purple-100 hover:bg-purple-200 p-4 rounded-lg text-center">
          <div className="text-purple-600 text-2xl mb-2">🚚</div>
          <p className="font-medium">Receive Report</p>
        </Link>
        
        <Link href="/reports/accounts" className="bg-yellow-100 hover:bg-yellow-200 p-4 rounded-lg text-center">
          <div className="text-yellow-600 text-2xl mb-2">💰</div>
          <p className="font-medium">Accounts Ledger</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/Accounts/transactions/cashPayments/create" 
            className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-center border border-blue-100"
          >
            <p className="font-medium text-blue-600">Add Payment</p>
          </Link>
          <Link 
            href="/receipts/add" 
            className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-center border border-green-100"
          >
            <p className="font-medium text-green-600">Add Receipt</p>
          </Link>
        </div>
      </div>

      {/* Key Metrics - Simplified */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Milk Purchased</p>
            <p className="text-xl font-bold text-blue-600">{metrics.purchase} Ltrs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Chillar Received</p>
            <p className="text-xl font-bold text-green-600">{metrics.receive} Ltrs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Milk Sold</p>
            <p className="text-xl font-bold text-purple-600">{metrics.sales} Ltrs</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
            <p className="text-xl font-bold text-yellow-600">{metrics.currentStock} Ltrs</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-4">Money Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total Payments</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(metrics.payments)}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total Receipts</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(metrics.receipts)}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}