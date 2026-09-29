'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import { openingBalancesApi, OpeningBalance, OpeningBalanceFilters } from '@/lib/api/openingBalances';
import OpeningBalanceModal from '@/components/modals/OpeningBalanceModal';
import { useToast } from '@/hooks/useToast';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip } from '@/components/ui/StatStrip';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { CenteredSpinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/Select';

export default function OpeningBalancesPage() {
  // State
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [selectedBalance, setSelectedBalance] = useState<OpeningBalance | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OpeningBalanceFilters>({
    pageNumber: 1,
    pageSize: 15,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Load opening balances
  const loadOpeningBalances = async () => {
    try {
      setLoading(true);
      const response = await openingBalancesApi.getOpeningBalances(filters);
      setOpeningBalances(response?.items ?? []);
      setTotalPages(response?.totalPages ?? 1);
    } catch (error) {
      toast({
        title: 'Failed to load opening balances',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpeningBalances();
  }, [filters]);

  // Handle create/update
  const handleSubmit = async (
    data: {
      accountId: number;
      openingDate: string;
      debitOpening: number;
      creditOpening: number;
      description: string;
    },
    keepOpen: boolean
  ) => {
    try {
      if (selectedBalance) {
        await openingBalancesApi.updateOpeningBalance(selectedBalance.openingBalanceId, data);
        toast({
          title: 'Opening balance updated successfully',
          variant: 'success',
        });
        setShowModal(false);
      } else {
        await openingBalancesApi.createOpeningBalance(data);
        toast({
          title: 'Opening balance added successfully',
          variant: 'success',
        });
        if (!keepOpen) {
          setShowModal(false);
        }
      }
      loadOpeningBalances();
    } catch (error) {
      toast({
        title: 'Operation failed',
        variant: 'error',
      });
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this opening balance?')) return;

    try {
      await openingBalancesApi.deleteOpeningBalance(id);
      toast({
        title: 'Opening balance deleted successfully',
        description: `Opening balance with ID ${id} has been deleted`,
        variant: 'success',
      });
      loadOpeningBalances();
    } catch (error: any) {
      console.error('Delete Error:', error);
      toast({
        title: 'Failed to delete opening balance',
        description: error?.message || 'An unexpected error occurred',
        variant: 'error',
      });
    }
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Calculate stats
  const totals = useMemo(() => {
    return openingBalances.reduce(
      (acc, curr) => {
        acc.totalDebit += curr.debitOpening || 0;
        acc.totalCredit += curr.creditOpening || 0;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [openingBalances]);

  const netDifference = Math.abs(totals.totalDebit - totals.totalCredit);
  const isBalanced = netDifference < 1.0;

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4 max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Opening Balances"
            subtitle="Manage initial account balances and ledger migration figures"
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => loadOpeningBalances()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setSelectedBalance(undefined);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Opening Balance
                </button>
              </div>
            }
          />

          {/* Print Header */}
          <ReportPrintHeader
            title="Account Opening Balances Statement"
            subtitle="Initial Account Balances and Ledger Migration Figures"
          />

          {/* KPI StatStrip */}
          <StatStrip
            items={[
              {
                label: 'Recorded Accounts',
                value: openingBalances.length.toString(),
                subtext: `Page ${filters.pageNumber} of ${totalPages}`,
                color: 'info',
                icon: <Wallet className="w-4 h-4 text-blue-600" />,
              },
              {
                label: 'Total Debit Opening',
                value: formatCurrency(totals.totalDebit),
                color: 'success',
                icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
              },
              {
                label: 'Total Credit Opening',
                value: formatCurrency(totals.totalCredit),
                color: 'danger',
                icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
              },
              {
                label: 'Parity Status',
                value: isBalanced ? 'Balanced' : 'Imbalance',
                subtext: isBalanced ? 'Debits equal Credits' : `${formatCurrency(netDifference)} variance`,
                color: isBalanced ? 'success' : 'danger',
                icon: isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ),
              },
            ]}
          />

          {/* Compact Filter Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs space-y-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Search */}
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search code or account..."
                  value={filters.search || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value, pageNumber: 1 }))
                  }
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Balance Type Filter */}
              <div className="min-w-[150px]">
                <Select
                  value={
                    filters.hasDebitBalance
                      ? 'debit'
                      : filters.hasCreditBalance
                      ? 'credit'
                      : 'all'
                  }
                  onChange={(val) => {
                    if (val === 'debit') {
                      setFilters((prev) => ({
                        ...prev,
                        hasDebitBalance: true,
                        hasCreditBalance: false,
                        pageNumber: 1,
                      }));
                    } else if (val === 'credit') {
                      setFilters((prev) => ({
                        ...prev,
                        hasDebitBalance: false,
                        hasCreditBalance: true,
                        pageNumber: 1,
                      }));
                    } else {
                      setFilters((prev) => ({
                        ...prev,
                        hasDebitBalance: undefined,
                        hasCreditBalance: undefined,
                        pageNumber: 1,
                      }));
                    }
                  }}
                  options={[
                    { value: 'all', label: 'All Balance Types' },
                    { value: 'debit', label: 'Debit Balances' },
                    { value: 'credit', label: 'Credit Balances' },
                  ]}
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </button>
            </div>

            {/* Expandable Advanced Filters */}
            {showFilters && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Min Amount (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="Min amount..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    value={filters.minAmount || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minAmount: Number(e.target.value) || undefined,
                        pageNumber: 1,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Max Amount (PKR)
                  </label>
                  <input
                    type="number"
                    placeholder="Max amount..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    value={filters.maxAmount || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxAmount: Number(e.target.value) || undefined,
                        pageNumber: 1,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Table Container */}
          <TableContainer title="Opening Balance Records">
            <Table dense>
              <Table.Header sticky>
                <Table.Row>
                  <Table.Head className="whitespace-nowrap">Account Code</Table.Head>
                  <Table.Head className="whitespace-nowrap">Account Title</Table.Head>
                  <Table.Head align="right" className="whitespace-nowrap">Debit (PKR)</Table.Head>
                  <Table.Head align="right" className="whitespace-nowrap">Credit (PKR)</Table.Head>
                  <Table.Head align="right" className="whitespace-nowrap">Net Balance</Table.Head>
                  <Table.Head className="whitespace-nowrap">Created By</Table.Head>
                  <Table.Head className="whitespace-nowrap">Date</Table.Head>
                  <Table.Head align="center" className="whitespace-nowrap">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-12">
                      <CenteredSpinner message="Loading opening balances..." />
                    </Table.Cell>
                  </Table.Row>
                ) : openingBalances.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center py-10 text-xs text-slate-400">
                      No opening balances found matching the specified criteria
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  openingBalances.map((balance) => (
                    <Table.Row key={balance.openingBalanceId}>
                      <Table.Cell className="font-mono text-xs text-slate-600 font-semibold whitespace-nowrap">
                        {balance.accountCode}
                      </Table.Cell>
                      <Table.Cell className="text-xs font-medium text-slate-900 whitespace-nowrap">
                        {balance.accountName}
                      </Table.Cell>
                      <Table.Cell
                        align="right"
                        className="text-xs font-mono tabular-nums whitespace-nowrap text-emerald-700 font-medium"
                      >
                        {balance.debitOpening > 0 ? formatCurrency(balance.debitOpening) : '—'}
                      </Table.Cell>
                      <Table.Cell
                        align="right"
                        className="text-xs font-mono tabular-nums whitespace-nowrap text-rose-600 font-medium"
                      >
                        {balance.creditOpening > 0 ? formatCurrency(balance.creditOpening) : '—'}
                      </Table.Cell>
                      <Table.Cell
                        align="right"
                        className="text-xs font-mono tabular-nums font-semibold whitespace-nowrap"
                      >
                        <span
                          className={
                            balance.balanceType === 'Debit' ? 'text-emerald-700' : 'text-purple-700'
                          }
                        >
                          {formatCurrency(balance.absoluteBalance)}{' '}
                          <span className="text-[10px] uppercase font-normal text-slate-400">
                            {balance.balanceType}
                          </span>
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-slate-500 whitespace-nowrap">
                        {balance.addedByUsername || '—'}
                      </Table.Cell>
                      <Table.Cell className="text-xs text-slate-500 whitespace-nowrap">
                        {balance.createdAt
                          ? new Date(balance.createdAt).toLocaleDateString('en-PK', {
                              dateStyle: 'medium',
                            })
                          : '—'}
                      </Table.Cell>
                      <Table.Cell align="center" className="whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedBalance(balance);
                              setShowModal(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Opening Balance"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(balance.openingBalanceId)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Opening Balance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
              {/* Grand Totals Footer */}
              {!loading && openingBalances.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100/90 border-t border-slate-300 font-semibold text-xs text-slate-800">
                    <td colSpan={2} className="px-3.5 py-2.5 uppercase tracking-wider text-slate-700">
                      Total ({openingBalances.length} Records)
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-emerald-800 font-bold border-b-4 border-double border-slate-900">
                      {formatCurrency(totals.totalDebit)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-rose-800 font-bold border-b-4 border-double border-slate-900">
                      {formatCurrency(totals.totalCredit)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-900 font-bold border-b-4 border-double border-slate-900">
                      {formatCurrency(Math.abs(totals.totalDebit - totals.totalCredit))}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </Table>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
              <div>
                Showing <strong className="text-slate-800">{openingBalances.length}</strong> items
                (Page {filters.pageNumber} of {totalPages})
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      pageNumber: Math.max(1, (prev.pageNumber || 1) - 1),
                    }))
                  }
                  disabled={(filters.pageNumber || 1) <= 1 || loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors text-xs font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <span className="px-2 py-1 text-xs font-semibold text-slate-700">
                  {filters.pageNumber}
                </span>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      pageNumber: (prev.pageNumber || 1) + 1,
                    }))
                  }
                  disabled={(filters.pageNumber || 1) >= totalPages || loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors text-xs font-medium"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </TableContainer>
          <ReportPrintFooter />

          {/* Opening Balance Modal */}
          <OpeningBalanceModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedBalance(undefined);
            }}
            onSubmit={handleSubmit}
            initialData={selectedBalance}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}