'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

type BuyerStats = {
  totalBuyers: number;
  activeBuyers: number;
  totalCreditLimit: number;
  totalOutstanding: number;
  recentTransactions: {
    buyer_id: number;
    buyer_name: string;
    amount: number;
    type: 'credit' | 'debit';
    date: string;
  }[];
  lowCreditBuyers: {
    buyer_id: number;
    buyer_name: string;
    credit_limit: number;
    current_balance: number;
  }[];
};

export default function BuyersPage() {
  const router = useRouter();
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBuyerStats();
  }, []);

  const fetchBuyerStats = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/buyers/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch buyer statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching buyer statistics:', error);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Buyers Dashboard</h1>
            <button
              onClick={() => router.push('/Buyers/createBuyer')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Buyer
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search buyers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Buyers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Buyers</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.totalBuyers || 0}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {stats?.activeBuyers || 0} Active
                </span>
              </div>
            </div>

            {/* Total Credit Limit */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Credit Limit</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{stats?.totalCreditLimit.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Across all buyers
                </span>
              </div>
            </div>

            {/* Total Outstanding */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    ₹{stats?.totalOutstanding.toLocaleString() || 0}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Current balance
                </span>
              </div>
            </div>

            {/* Low Credit Alert */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Credit Alert</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.lowCreditBuyers.length || 0}
                  </h3>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  Buyers near limit
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {stats?.recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.buyer_name}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Credit Buyers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Low Credit Alert</h2>
              <div className="space-y-4">
                {stats?.lowCreditBuyers.map((buyer, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => router.push(`/Buyers/buyerDetail?id=${buyer.buyer_id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{buyer.buyer_name}</p>
                      <p className="text-xs text-gray-500">
                        Credit Limit: ₹{buyer.credit_limit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        ₹{buyer.current_balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round((buyer.current_balance / buyer.credit_limit) * 100)}% used
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
} 