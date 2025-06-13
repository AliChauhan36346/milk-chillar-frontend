'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import ProtectedRoute from '@/components/ProtectedRoutes';

type Transaction = {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed';
};

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
};

export default function AccountTransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'debit' | 'credit'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // TODO: Replace with actual API data
  const accounts: Account[] = [
    {
      id: '1',
      code: '1000',
      name: 'Cash Account',
      type: 'asset',
      balance: 500000
    },
    {
      id: '2',
      code: '2000',
      name: 'Accounts Receivable',
      type: 'asset',
      balance: 300000
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'TRX001',
      date: '2024-03-15',
      accountId: '1',
      accountName: 'Cash Account',
      type: 'credit',
      amount: 25000,
      description: 'Payment received from customer',
      reference: 'INV-001',
      status: 'completed'
    },
    {
      id: 'TRX002',
      date: '2024-03-14',
      accountId: '1',
      accountName: 'Cash Account',
      type: 'debit',
      amount: 15000,
      description: 'Payment to supplier',
      reference: 'PO-001',
      status: 'completed'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
    const matchesDate = new Date(transaction.date) >= new Date(dateRange.start) &&
                       new Date(transaction.date) <= new Date(dateRange.end);

    return matchesSearch && matchesAccount && matchesType && matchesStatus && matchesDate;
  });

  const calculateTotals = () => {
    return filteredTransactions.reduce(
      (acc, transaction) => ({
        totalDebits: acc.totalDebits + (transaction.type === 'debit' ? transaction.amount : 0),
        totalCredits: acc.totalCredits + (transaction.type === 'credit' ? transaction.amount : 0),
      }),
      { totalDebits: 0, totalCredits: 0 }
    );
  };

  const { totalDebits, totalCredits } = calculateTotals();

  return (
    <ProtectedRoute>
      <DynamicLayout allowedRoles={['admin']}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">Account Transactions</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Debits</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">
                ₹{totalDebits.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Credits</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                ₹{totalCredits.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Account</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Reference</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/Accounts/transactions/${transaction.id}`)}
                    >
                      <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{transaction.accountName}</td>
                      <td className="py-3 px-4">{transaction.description}</td>
                      <td className="py-3 px-4">{transaction.reference}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
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