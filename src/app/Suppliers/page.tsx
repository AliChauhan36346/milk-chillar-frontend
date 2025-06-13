'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, List, Plus, Search, CreditCard, AlertCircle } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

type SupplierStats = {
  total_suppliers: number;
  active_suppliers: number;
  total_credit_limit: number;
  total_outstanding: number;
  recent_transactions: {
    id: number;
    supplier_name: string;
    amount: number;
    date: string;
    type: 'credit' | 'debit';
  }[];
  low_credit_suppliers: {
    id: number;
    name: string;
    credit_limit: number;
    outstanding: number;
  }[];
};

export default function SuppliersPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/suppliers/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch supplier stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/Suppliers/supplierList')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <List className="w-5 h-5" />
                View All Suppliers
              </button>
              <button
                onClick={() => router.push('/Suppliers/createSupplier')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Supplier
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <button
              onClick={() => router.push('/Suppliers/supplierList')}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-gray-500">Total Suppliers</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_suppliers || 0}</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/Suppliers/supplierList?status=active')}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-gray-500">Active Suppliers</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats?.active_suppliers || 0}</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/Suppliers/supplierList?sort=credit')}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-gray-500">Total Credit Limit</h3>
                <p className="text-2xl font-semibold text-gray-900">₨{(stats?.total_credit_limit || 0).toFixed(2)}</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/Suppliers/supplierList?sort=outstanding')}
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
                <p className="text-2xl font-semibold text-gray-900">₨{(stats?.total_outstanding || 0).toFixed(2)}</p>
              </div>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
              <button
                onClick={() => router.push('/Suppliers/supplierList?view=transactions')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.recent_transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/Suppliers/supplierDetail?id=${transaction.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {transaction.supplier_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₨{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Credit Suppliers */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Low Credit Suppliers</h2>
              <button
                onClick={() => router.push('/Suppliers/supplierList?view=low-credit')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Supplier</th>
                    <th className="px-6 py-3">Credit Limit</th>
                    <th className="px-6 py-3">Outstanding</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.low_credit_suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {supplier.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₨{supplier.credit_limit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₨{supplier.outstanding.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Credit
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
} 