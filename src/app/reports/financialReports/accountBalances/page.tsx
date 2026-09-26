'use client';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useEffect, useState } from 'react';
import {
  fetchAccountBalances,
  PagedAccountBalances,
  AccountBalanceDetail
} from '@/lib/api/reports';
import { ChevronLeft, ChevronRight, Users, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { CenteredSpinner } from '@/components/ui/spinner';
import { StatStrip } from '@/components/ui/StatStrip';

type AccountType = 'Supplier' | 'Buyer';

export default function AccountBalancesPage() {
  const [activeTab, setActiveTab] = useState<AccountType>('Supplier');
  const [data, setData] = useState<PagedAccountBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    loadAccountBalances(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const loadAccountBalances = async (type: AccountType, page: number) => {
    try {
      setLoading(true);
      const result = await fetchAccountBalances(type, page, pageSize);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error loading account balances:', err);
      setError('Failed to load account balances');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: AccountType) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Balances</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage supplier and buyer account balances
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('Supplier')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'Supplier'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => handleTabChange('Buyer')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'Buyer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Buyers
            </button>
          </div>

          {/* Summary Stat Strip */}
          {data?.summary && (
            <StatStrip
              items={[
                {
                  label: 'Total Accounts',
                  value: data.summary.accountCount.toString(),
                  color: 'info',
                  icon: <Users className="w-4 h-4 text-blue-600" />,
                },
                {
                  label: 'Total Debit',
                  value: formatCurrency(data.summary.totalDebit),
                  color: 'success',
                  icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
                },
                {
                  label: 'Total Credit',
                  value: formatCurrency(data.summary.totalCredit),
                  color: 'danger',
                  icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
                },
                {
                  label: 'Net Balance',
                  value: formatCurrency(Math.abs(data.summary.netBalance)),
                  subtext: activeTab === 'Supplier' ? 'We owe suppliers' : 'Buyers owe us',
                  color: data.summary.netBalance >= 0 ? 'purple' : 'warning',
                  icon: <Wallet className="w-4 h-4 text-purple-600" />,
                },
              ]}
            />
          )}

          {/* Loading State */}
          {loading && (
            <CenteredSpinner message="Loading balances..." />
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          )}

          {/* Table & Mobile Cards */}
          {!loading && !error && data && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab} Account Balances
                  <span className="text-xs font-normal text-slate-500 ml-2">
                    (Page {currentPage} of {data.totalPages})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-slate-700">
                        <th className="text-left p-2.5 font-semibold">Code</th>
                        <th className="text-left p-2.5 font-semibold">Account Name</th>
                        <th className="text-right p-2.5 font-semibold">Debit</th>
                        <th className="text-right p-2.5 font-semibold">Credit</th>
                        <th className="text-right p-2.5 font-semibold">Balance</th>
                        <th className="text-center p-2.5 font-semibold">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.balances.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-gray-500">
                            No account balances found
                          </td>
                        </tr>
                      ) : (
                        data.balances.map((balance: AccountBalanceDetail) => (
                          <tr
                            key={balance.accountId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-2.5 font-mono text-slate-600">
                              {balance.accountCode}
                            </td>
                            <td className="p-2.5 font-medium text-slate-800">
                              {balance.accountName}
                            </td>
                            <td className="p-2.5 text-right text-emerald-600 font-medium">
                              {formatCurrency(balance.debitTotal)}
                            </td>
                            <td className="p-2.5 text-right text-rose-600 font-medium">
                              {formatCurrency(balance.creditTotal)}
                            </td>
                            <td className="p-2.5 text-right font-bold">
                              <span
                                className={
                                  balance.balance > 0
                                    ? 'text-blue-600'
                                    : balance.balance < 0
                                      ? 'text-rose-600'
                                      : 'text-slate-600'
                                }
                              >
                                {formatCurrency(Math.abs(balance.balance))}
                              </span>
                            </td>
                            <td className="p-2.5 text-center text-slate-500">
                              {formatDate(balance.lastUpdated)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-2.5">
                  {data.balances.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No account balances found
                    </div>
                  ) : (
                    data.balances.map((balance: AccountBalanceDetail) => (
                      <div key={balance.accountId} className="bg-slate-50/70 rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                        <div className="flex items-start justify-between border-b border-slate-200/60 pb-2">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{balance.accountName}</h4>
                            <span className="text-[11px] text-slate-500 font-mono">#{balance.accountCode}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Balance</span>
                            <span className={`font-bold text-xs ${
                              balance.balance > 0 ? 'text-blue-600' : balance.balance < 0 ? 'text-rose-600' : 'text-slate-600'
                            }`}>
                              {formatCurrency(Math.abs(balance.balance))}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Debit</span>
                            <span className="text-emerald-600 font-medium">{formatCurrency(balance.debitTotal)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Credit</span>
                            <span className="text-rose-600 font-medium">{formatCurrency(balance.creditTotal)}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                          Last updated: {formatDate(balance.lastUpdated)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                      {Math.min(currentPage * pageSize, data.totalCount)} of{' '}
                      {data.totalCount} accounts
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border transition-colors ${currentPage === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                          let pageNum;
                          if (data.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= data.totalPages - 2) {
                            pageNum = data.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg border transition-colors ${currentPage === pageNum
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data.totalPages}
                        className={`p-2 rounded-lg border transition-colors ${currentPage === data.totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}