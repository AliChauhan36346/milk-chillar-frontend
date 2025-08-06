'use client';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  BookOpen, 
  Receipt, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CreditCard,
  TrendingUp,
  Eye
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
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      onClick: () => router.push('/Accounts/createAccount')
    },
    {
      title: 'Chart of Accounts',
      description: 'View and manage your chart of accounts',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      onClick: () => router.push('/Accounts/chartOfAccounts')
    },
    {
      title: 'Account Transactions',
      description: 'View and manage account transactions',
      icon: Receipt,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      onClick: () => router.push('/Accounts/accountTransactions')
    }
  ];

  return (
    <ProtectedRoute>
      <DynamicLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Accounts Dashboard</h1>
                <p className="text-slate-600">Manage your financial accounts and transactions</p>
              </div>
              <button
                onClick={() => router.push('/Accounts/createAccount')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                New Account
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <DollarSign className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Balance</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  Rs {accountSummary.totalBalance.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">+5.2%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                    <ArrowUpRight className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Income</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  Rs {accountSummary.totalIncome.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl">
                    <ArrowDownRight className="w-7 h-7 text-red-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Expenses</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  Rs {accountSummary.totalExpense.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 font-medium">+3.1%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <FileText className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Recent Transactions</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {accountSummary.recentTransactions}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">View all</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={action.onClick}
                    className={`${action.color} ${action.hoverColor} text-white rounded-2xl p-8 text-left transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 group`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      <ArrowUpRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-white/90 leading-relaxed">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Recent Activity</h2>
                  <p className="text-slate-600">Latest account transactions and updates</p>
                </div>
                <button
                  onClick={() => router.push('/Accounts/accountTransactions')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <span className="font-medium">View All</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-200 rounded-xl">
                      <ArrowUpRight className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Income from Sales</p>
                      <p className="text-sm text-slate-600">Account: Sales Revenue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 text-lg">+Rs 25,000</p>
                    <p className="text-sm text-slate-500">Today, 2:30 PM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-200 rounded-xl">
                      <ArrowDownRight className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Supplier Payment</p>
                      <p className="text-sm text-slate-600">Account: Accounts Payable</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700 text-lg">-Rs 15,000</p>
                    <p className="text-sm text-slate-500">Yesterday, 11:45 AM</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-200 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Bank Transfer</p>
                      <p className="text-sm text-slate-600">Account: Checking Account</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700 text-lg">Rs 50,000</p>
                    <p className="text-sm text-slate-500">2 days ago, 9:15 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}