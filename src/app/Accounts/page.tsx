'use client';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Receipt, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CreditCard
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function AccountsPage() {
  const router = useRouter();

  // TODO: Replace with actual API data
  const accountSummary = {
    totalBalance: 250000,
    totalIncome: 150000,
    totalExpense: 100000,
    recentTransactions: 5
  };

  const quickActions = [
    {
      title: 'Create Account',
      description: 'Add a new account to your chart of accounts',
      icon: Plus,
      color: 'blue',
      onClick: () => router.push('/Accounts/createAccount')
    },
    {
      title: 'Chart of Accounts',
      description: 'View and manage your chart of accounts',
      icon: BookOpen,
      color: 'green',
      onClick: () => router.push('/Accounts/chartOfAccounts')
    },
    {
      title: 'Account Transactions',
      description: 'View and manage account transactions',
      icon: Receipt,
      color: 'purple',
      onClick: () => router.push('/Accounts/accountTransactions')
    }
  ];

  return (
    <ProtectedRoute>
      <DynamicLayout allowedRoles={['admin']}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
            <button
              onClick={() => router.push('/Accounts/createAccount')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Account
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Balance</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                ₹{accountSummary.totalBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Income</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                ₹{accountSummary.totalIncome.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Total Expenses</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">
                ₹{accountSummary.totalExpense.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {accountSummary.recentTransactions}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className={`p-2 bg-${action.color}-100 rounded-lg w-fit mb-4`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <button
                onClick={() => router.push('/Accounts/accountTransactions')}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* TODO: Replace with actual recent transactions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Income from Sales</p>
                    <p className="text-sm text-gray-600">Account: Sales Revenue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+₹25,000</p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Supplier Payment</p>
                    <p className="text-sm text-gray-600">Account: Accounts Payable</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">-₹15,000</p>
                  <p className="text-sm text-gray-600">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
} 