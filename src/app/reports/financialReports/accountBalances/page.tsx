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
import { ChevronLeft, ChevronRight, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { CenteredSpinner } from '@/components/ui/spinner';

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

          {/* Summary Cards */}
          {data?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Accounts</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {data.summary.accountCount}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Debit</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(data.summary.totalDebit)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Credit</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(data.summary.totalCredit)}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`${data.summary.netBalance >= 0 ? 'bg-purple-50' : 'bg-orange-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Net Balance</p>
                      <p className={`text-2xl font-bold ${data.summary.netBalance >= 0 ? 'text-purple-600' : 'text-orange-600'
                        }`}>
                        {formatCurrency(Math.abs(data.summary.netBalance))}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeTab === 'Supplier'
                          ? 'We owe suppliers'
                          : 'Buyers owe us'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

          {/* Table */}
          {!loading && !error && data && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab} Account Balances
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Page {currentPage} of {data.totalPages})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">
                          Code
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">
                          Account Name
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">
                          Debit
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">
                          Credit
                        </th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">
                          Balance
                        </th>
                        <th className="text-center p-3 text-sm font-semibold text-gray-700">
                          Last Updated
                        </th>
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
                            <td className="p-3 text-sm font-medium text-gray-900">
                              {balance.accountCode}
                            </td>
                            <td className="p-3 text-sm text-gray-700">
                              {balance.accountName}
                            </td>
                            <td className="p-3 text-sm text-right text-green-600 font-medium">
                              {formatCurrency(balance.debitTotal)}
                            </td>
                            <td className="p-3 text-sm text-right text-red-600 font-medium">
                              {formatCurrency(balance.creditTotal)}
                            </td>
                            <td className="p-3 text-sm text-right font-bold">
                              <span
                                className={
                                  balance.balance > 0
                                    ? 'text-blue-600'
                                    : balance.balance < 0
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                }
                              >
                                {formatCurrency(Math.abs(balance.balance))}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-center text-gray-600">
                              {formatDate(balance.lastUpdated)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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