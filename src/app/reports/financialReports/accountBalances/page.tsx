'use client';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useEffect, useState, useMemo } from 'react';
import {
  fetchAccountBalances,
  PagedAccountBalances,
  AccountBalanceDetail
} from '@/lib/api/reports';
import { ChevronLeft, ChevronRight, Users, TrendingUp, TrendingDown, Wallet, Search, Download, Landmark, DollarSign, Building } from 'lucide-react';
import { CenteredSpinner } from '@/components/ui/spinner';
import { StatStrip } from '@/components/ui/StatStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableContainer } from '@/components/ui/Table/Table';

type AccountType = 'Supplier' | 'Buyer' | 'Cash' | 'Bank';

export default function AccountBalancesPage() {
  const [activeTab, setActiveTab] = useState<AccountType>('Supplier');
  const [data, setData] = useState<PagedAccountBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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
    setCurrentPage(1);
    setSearchTerm('');
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

  const filteredBalances = useMemo(() => {
    if (!data?.balances) return [];
    if (!searchTerm.trim()) return data.balances;
    const term = searchTerm.toLowerCase();
    return data.balances.filter(
      b => b.accountName.toLowerCase().includes(term) || b.accountCode.toLowerCase().includes(term)
    );
  }, [data?.balances, searchTerm]);

  const handleExportCSV = () => {
    if (!data?.balances.length) return;
    const headers = ['Account Code', 'Account Name', 'Debit Total', 'Credit Total', 'Net Balance', 'Last Updated'];
    const rows = filteredBalances.map(b => [
      b.accountCode,
      `"${b.accountName}"`,
      b.debitTotal,
      b.creditTotal,
      b.balance,
      b.lastUpdated
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-balances-${activeTab.toLowerCase()}-page${currentPage}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSubtextForTab = (tab: AccountType, netBalance: number) => {
    switch (tab) {
      case 'Supplier':
        return netBalance >= 0 ? 'Payable to suppliers' : 'Advance to suppliers';
      case 'Buyer':
        return netBalance >= 0 ? 'Receivable from buyers' : 'Advance received';
      case 'Cash':
        return 'Available in cash accounts';
      case 'Bank':
        return 'Total bank balance';
      default:
        return undefined;
    }
  };

  const tabs: { key: AccountType; label: string; icon: React.ReactNode }[] = [
    { key: 'Supplier', label: 'Suppliers', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'Buyer', label: 'Buyers', icon: <Building className="w-3.5 h-3.5" /> },
    { key: 'Cash', label: 'Cash Accounts', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: 'Bank', label: 'Bank Accounts', icon: <Landmark className="w-3.5 h-3.5" /> },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Account Balances"
            subtitle="Real-time balances across suppliers, buyers, cash registers, and bank accounts"
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            actions={
              <button
                onClick={handleExportCSV}
                disabled={!data || data.balances.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            }
          />

          {/* Navigation Tabs & Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()} accounts...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Summary Stat Strip */}
          {data?.summary && (
            <StatStrip
              items={[
                {
                  label: `${activeTab} Accounts`,
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
                  subtext: getSubtextForTab(activeTab, data.summary.netBalance),
                  color: data.summary.netBalance >= 0 ? 'purple' : 'warning',
                  icon: <Wallet className="w-4 h-4 text-purple-600" />,
                },
              ]}
            />
          )}

          {/* Loading State */}
          {loading && (
            <CenteredSpinner message={`Loading ${activeTab.toLowerCase()} balances...`} />
          )}

          {/* Error State */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Table Container */}
          {!loading && !error && data && (
            <TableContainer title={`${activeTab} Account Balances`}>
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-700">{filteredBalances.length}</strong> accounts
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
                <span>
                  Page {currentPage} of {data.totalPages}
                </span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table dense>
                  <Table.Header sticky>
                    <Table.Row>
                      <Table.Head className="whitespace-nowrap">Code</Table.Head>
                      <Table.Head className="whitespace-nowrap">Account Name</Table.Head>
                      <Table.Head align="right" className="whitespace-nowrap">Debit</Table.Head>
                      <Table.Head align="right" className="whitespace-nowrap">Credit</Table.Head>
                      <Table.Head align="right" className="whitespace-nowrap">Net Balance</Table.Head>
                      <Table.Head align="center" className="whitespace-nowrap">Last Updated</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredBalances.length === 0 ? (
                      <Table.Row>
                        <td colSpan={6} className="text-center py-10 text-xs text-slate-400">
                          No {activeTab.toLowerCase()} accounts found
                        </td>
                      </Table.Row>
                    ) : (
                      filteredBalances.map((balance: AccountBalanceDetail) => (
                        <Table.Row key={balance.accountId}>
                          <Table.Cell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                            {balance.accountCode}
                          </Table.Cell>
                          <Table.Cell className="font-medium text-xs text-slate-800 whitespace-nowrap">
                            {balance.accountName}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs text-emerald-700 font-medium tabular-nums whitespace-nowrap">
                            {formatCurrency(balance.debitTotal)}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs text-rose-600 font-medium tabular-nums whitespace-nowrap">
                            {formatCurrency(balance.creditTotal)}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs font-semibold tabular-nums whitespace-nowrap">
                            <span
                              className={
                                balance.balance > 0
                                  ? 'text-emerald-700'
                                  : balance.balance < 0
                                    ? 'text-rose-600'
                                    : 'text-slate-600'
                              }
                            >
                              {formatCurrency(Math.abs(balance.balance))}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="center" className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(balance.lastUpdated)}
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-2 p-3">
                {filteredBalances.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No accounts found
                  </div>
                ) : (
                  filteredBalances.map((balance: AccountBalanceDetail) => (
                    <div key={balance.accountId} className="bg-slate-50/70 rounded-lg border border-slate-200/80 p-2.5 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{balance.accountName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">#{balance.accountCode}</div>
                        </div>
                        <span className={`font-semibold text-xs tabular-nums ${
                          balance.balance > 0 ? 'text-emerald-700' : balance.balance < 0 ? 'text-rose-600' : 'text-slate-600'
                        }`}>
                          {formatCurrency(Math.abs(balance.balance))}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
                        <span>Dr: <strong className="text-emerald-700 tabular-nums">{formatCurrency(balance.debitTotal)}</strong></span>
                        <span>Cr: <strong className="text-rose-600 tabular-nums">{formatCurrency(balance.creditTotal)}</strong></span>
                        <span>{formatDate(balance.lastUpdated)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <span className="text-xs text-slate-600">
                    Page {currentPage} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === data.totalPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </TableContainer>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}