'use client';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getDetailedPurchaseReport,
  getPurchaseReportSummary,
  getSupplierWisePurchaseReport,
  PagedPurchaseReport,
  SupplierWisePurchaseReport,
  PurchaseReportQuery,
  PurchaseReportSummary,
} from '@/lib/api/reports';
import { getEmployees } from '@/lib/api/employees';
import { PurchaseReportFilters } from '@/components/reports/PurchaseReportFilters';
import { FileText, TrendingUp, DollarSign, Droplet, Users, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { CenteredSpinner } from '@/components/ui/spinner';
import PurchaseModal from '@/components/modals/PurchaseModal';
import MilkCardModal from '@/components/modals/MilkCardModal';
import { getPurchaseById, Purchase, updatePurchase } from '@/lib/api/purchases';
import { getAccountsByComponent, SearchAccountResult } from '@/lib/api/accounts';
import { getCurrentMonthHalfDateRange } from '@/lib/utils/dateRange';

type ReportView = 'detailed' | 'summary';

function PurchaseReportContent() {
  const [view, setView] = useState<ReportView>('detailed');
  const [detailedReport, setDetailedReport] = useState<PagedPurchaseReport | null>(null);
  const [summaryReport, setSummaryReport] = useState<SupplierWisePurchaseReport | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Get default date range based on current month half
  const defaultDateRange = getCurrentMonthHalfDateRange();

  // Filter states
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<PurchaseReportQuery>({
    startDate: searchParams.get('startDate') || defaultDateRange.startDate,
    endDate: searchParams.get('endDate') || defaultDateRange.endDate,
    timeOfDay: undefined,
    dodhiId: undefined,
    chillarId: searchParams.get('chillarId') ? Number(searchParams.get('chillarId')) : undefined,
    supplierCode: undefined,
  });

  // Modal states
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showMilkCardModal, setShowMilkCardModal] = useState(false);
  const [expenseAccounts, setExpenseAccounts] = useState<SearchAccountResult[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [purchaseModalData, setPurchaseModalData] = useState<{
    supplier: { id: number; name: string; code: string; rate: number };
    availableTimes: ('morning' | 'evening')[];
    isUpdate: boolean;
    updateData?: {
      time: 'morning' | 'evening';
      purchaseId: number;
      currentQuantity: number;
    };
    initialDate: string;
    selectedExpenseAccount: number | null;
  } | null>(null);
  const [milkCardData, setMilkCardData] = useState<{
    accountId: number;
    accountName: string;
    date: string;
    transactionType: 'Purchase' | 'Sale';
  } | null>(null);

  const [dodhiOptions, setDodhiOptions] = useState<{ value: string; label: string }[]>([]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const summaryData = await getPurchaseReportSummary(filters);
      setPurchaseSummary(summaryData);
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      if (view === 'detailed') {
        // Load paginated data
        const data = await getDetailedPurchaseReport({
          ...filters,
          pageNumber: currentPage,
          pageSize: pageSize,
        });
        setDetailedReport(data);

        // Load summary separately
        loadSummary();
      } else {
        const data = await getSupplierWisePurchaseReport(filters);
        setSummaryReport(data);
      }
    } catch (err) {
      console.error('Error loading purchase report:', err);
      setError('Failed to load purchase report');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      timeOfDay: undefined,
      dodhiId: undefined,
      chillarId: undefined,
      supplierCode: undefined,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (detailedReport?.paginatedPurchases.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when view changes
    handleSearch();
  }, [view]);

  // Load dodhi options from employees list (employees with designation 'dodhi')
  useEffect(() => {
    const loadDodhis = async () => {
      try {
        const employees = await getEmployees();
        const dodhis = (employees || []).filter((e) =>
          String(e.designation || '').toLowerCase().includes('dodhi')
        );
        const opts = dodhis.map((d) => ({ value: d.employeeId.toString(), label: d.fullName }));
        setDodhiOptions(opts);
      } catch (err) {
        setDodhiOptions([]);
      }
    };

    loadDodhis();
  }, []);

  useEffect(() => {
    if (view === 'detailed') {
      handleSearch();
    }
  }, [currentPage]);

  const handlePurchaseClick = async (
    purchaseId: number,
    accountId: number,
    accountName: string,
    accountCode: string,
    date: string,
    timeOfDay: string
  ) => {
    try {
      const purchase = await getPurchaseById(purchaseId);
      setCurrentPurchase(purchase);

      // Ensure expense accounts are loaded
      if (expenseAccounts.length === 0) {
        const accounts = await getAccountsByComponent('expenses');
        setExpenseAccounts(accounts);
      }

      setPurchaseModalData({
        supplier: { id: accountId, name: accountName, code: accountCode, rate: purchase.rate },
        availableTimes: ['morning', 'evening'],
        isUpdate: true,
        updateData: {
          time: timeOfDay as 'morning' | 'evening',
          purchaseId: purchaseId,
          currentQuantity: purchase.grossLiters
        },
        initialDate: date.split('T')[0],
        selectedExpenseAccount: purchase.expenseAccountId || null
      });
      setShowPurchaseModal(true);
    } catch (err) {
      console.error('Error loading purchase:', err);
      setError('Failed to load purchase details');
    }
  };

  const handleSupplierClick = (accountId: number, accountName: string) => {
    setMilkCardData({
      accountId,
      accountName,
      date: filters.endDate || new Date().toISOString().split('T')[0],
      transactionType: 'Purchase'
    });
    setShowMilkCardModal(true);
  };

  const handlePurchaseSubmit = async (data: {
    date: string;
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    expenseAccountId?: number;
  }) => {
    if (!purchaseModalData?.updateData?.purchaseId || !currentPurchase) return;

    try {
      const time = purchaseModalData.updateData.time;
      const quantity = time === 'morning' ? data.morningQuantity : data.eveningQuantity;

      if (!quantity) {
        console.error("No quantity provided for update");
        return;
      }

      const rate = data.rate !== undefined ? data.rate : currentPurchase.rate;
      const balance = quantity * rate; // Calculate balance based on new quantity and rate

      const updatePayload = {
        date: data.date,
        timeOfDay: time,
        accountId: currentPurchase.accountId,
        expenseAccountId: data.expenseAccountId || currentPurchase.expenseAccountId,
        dodhiId: currentPurchase.dodhiId,
        grossLiters: quantity,
        rate: rate,
        balance: balance
      };

      await updatePurchase(purchaseModalData.updateData.purchaseId, updatePayload);

      setShowPurchaseModal(false);
      setPurchaseModalData(null);
      setCurrentPurchase(null);

      // Refresh data
      handleSearch();

    } catch (err) {
      console.error('Error updating purchase:', err);
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

  const summary = view === 'detailed' ? purchaseSummary : summaryReport?.overallSummary;

  const summaryStats: StatItem[] = summary ? [
    {
      label: 'Total Liters',
      value: `${summary.totalLiters.toFixed(2)} L`,
      color: 'primary',
      icon: <Droplet className="w-4 h-4 text-blue-600" />,
    },
    {
      label: 'Total Amount',
      value: formatCurrency(summary.totalAmount),
      color: 'success',
      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: 'Avg Rate',
      value: `${formatCurrency(summary.averageRate)}/L`,
      color: 'info',
      icon: <TrendingUp className="w-4 h-4 text-cyan-600" />,
    },
    {
      label: 'Transactions',
      value: summary.totalTransactions.toString(),
      color: 'warning',
      icon: <FileText className="w-4 h-4 text-amber-600" />,
    },
    {
      label: 'Suppliers',
      value: summary.totalSuppliers.toString(),
      color: 'default',
      icon: <Users className="w-4 h-4 text-slate-600" />,
    },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Purchase Report"
        subtitle="Detailed milk collection and supplier-wise aggregation"
        icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
        actions={
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setView('detailed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                view === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detailed Report
            </button>
            <button
              onClick={() => setView('summary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                view === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supplier Summary
            </button>
          </div>
        }
      />

      {/* Summary Ribbon */}
      {summary && <StatStrip items={summaryStats} loading={summaryLoading} />}

      {/* Filters */}
      <PurchaseReportFilters
        startDate={filters.startDate}
        endDate={filters.endDate}
        timeOfDay={filters.timeOfDay || ''}
        dodhiId={filters.dodhiId?.toString() || ''}
        chillarId={filters.chillarId?.toString() || ''}
        supplierCode={filters.supplierCode || ''}
        dodhiOptions={dodhiOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {/* Loading State */}
      {loading && (
        <CenteredSpinner message="Loading report..." />
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-slate-200">
          <div className="text-sm text-rose-600">{error}</div>
        </div>
      )}

      {/* Detailed Report Table */}
      {!loading && !error && view === 'detailed' && detailedReport && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TableContainer
              title={
                detailedReport.paginatedPurchases.totalCount > 0
                  ? `Purchase Details (Page ${currentPage} of ${detailedReport.paginatedPurchases.totalPages})`
                  : 'Purchase Details'
              }
            >
              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head>Date</Table.Head>
                    <Table.Head>Time</Table.Head>
                    <Table.Head>Supplier</Table.Head>
                    <Table.Head>Dodhi</Table.Head>
                    <Table.Head>Chillar</Table.Head>
                    <Table.Head className="text-right">Liters</Table.Head>
                    <Table.Head className="text-right">Rate</Table.Head>
                    <Table.Head className="text-right">Amount</Table.Head>
                    <Table.Head className="text-right">Balance</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {detailedReport.paginatedPurchases.items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-xs text-slate-500">
                        No purchases found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    detailedReport.paginatedPurchases.items.map((purchase) => (
                      <Table.Row key={purchase.purchaseId}>
                        <Table.Cell className="text-xs text-slate-700">{formatDate(purchase.date)}</Table.Cell>
                        <Table.Cell className="text-xs text-slate-700 capitalize">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            purchase.timeOfDay === 'morning' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {purchase.timeOfDay}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="font-medium text-xs text-slate-900">{purchase.accountName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{purchase.accountCode}</div>
                        </Table.Cell>
                        <Table.Cell className="text-xs text-slate-700">{purchase.dodhiName}</Table.Cell>
                        <Table.Cell className="text-xs text-slate-700">{purchase.chillarName}</Table.Cell>
                        <Table.Cell className="text-right">
                          <span
                            className="font-medium text-xs text-blue-600 cursor-pointer hover:underline tabular-nums"
                            onClick={() => handlePurchaseClick(
                              purchase.purchaseId,
                              purchase.accountId,
                              purchase.accountName,
                              purchase.accountCode,
                              purchase.date,
                              purchase.timeOfDay
                            )}
                            title="Click to edit purchase"
                          >
                            {purchase.grossLiters.toFixed(2)}L
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right text-xs text-slate-700 tabular-nums">
                          {formatCurrency(purchase.rate)}
                        </Table.Cell>
                        <Table.Cell className="text-right font-medium text-xs text-slate-900 tabular-nums">
                          {formatCurrency(purchase.totalAmount)}
                        </Table.Cell>
                        <Table.Cell className={`text-right font-medium text-xs tabular-nums ${purchase.balance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {formatCurrency(purchase.balance)}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Detailed Purchases */}
          <div className="md:hidden space-y-2.5">
            {detailedReport.paginatedPurchases.items.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No purchases found for the selected filters
              </div>
            ) : (
              detailedReport.paginatedPurchases.items.map((purchase) => (
                <div key={purchase.purchaseId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{purchase.accountName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{purchase.accountCode}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                          purchase.timeOfDay === 'morning' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {purchase.timeOfDay}
                        </span>
                        <span>•</span>
                        <span>{formatDate(purchase.date)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePurchaseClick(
                        purchase.purchaseId,
                        purchase.accountId,
                        purchase.accountName,
                        purchase.accountCode,
                        purchase.date,
                        purchase.timeOfDay
                      )}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-200"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Liters & Rate</span>
                      <span className="font-bold text-blue-600 block">{purchase.grossLiters.toFixed(2)} L</span>
                      <span className="text-slate-600 text-[11px] block">{formatCurrency(purchase.rate)}/L</span>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Financials</span>
                      <span className="font-bold text-emerald-600 block">{formatCurrency(purchase.totalAmount)}</span>
                      <span className="text-rose-600 font-medium text-[11px] block">Bal: {formatCurrency(purchase.balance)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Dodhi: <strong className="text-slate-700">{purchase.dodhiName}</strong></span>
                    <span>Chillar: <strong className="text-slate-700">{purchase.chillarName}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {detailedReport.paginatedPurchases.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500">
                Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                {Math.min(currentPage * pageSize, detailedReport.paginatedPurchases.totalCount)} of{' '}
                {detailedReport.paginatedPurchases.totalCount} purchases
              </div>

              <div className="flex items-center gap-1.5 self-center sm:self-auto overflow-x-auto">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Prev
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, detailedReport.paginatedPurchases.totalPages) }, (_, i) => {
                    let pageNum;
                    const totalPages = detailedReport.paginatedPurchases.totalPages;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === detailedReport.paginatedPurchases.totalPages}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Supplier Summary Table */}
      {!loading && !error && view === 'summary' && summaryReport && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TableContainer title="Supplier-wise Summary">
              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head>Supplier Code</Table.Head>
                    <Table.Head>Supplier Name</Table.Head>
                    <Table.Head className="text-right">Total Liters</Table.Head>
                    <Table.Head className="text-right">Total Amount</Table.Head>
                    <Table.Head className="text-right">Avg Rate</Table.Head>
                    <Table.Head className="text-right">Txns</Table.Head>
                    <Table.Head className="text-right">Balance</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {summaryReport.supplierSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                        No purchases found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    summaryReport.supplierSummaries.map((supplier) => (
                      <Table.Row key={supplier.accountId}>
                        <Table.Cell className="font-mono text-xs text-slate-600">
                          {supplier.accountCode}
                        </Table.Cell>
                        <Table.Cell className="font-medium text-xs text-slate-900">{supplier.accountName}</Table.Cell>
                        <Table.Cell className="text-right">
                          <span
                            className="font-medium text-xs text-blue-600 cursor-pointer hover:underline tabular-nums"
                            onClick={() => handleSupplierClick(supplier.accountId, supplier.accountName)}
                            title="Click to view milk card"
                          >
                            {supplier.totalLiters.toFixed(2)}L
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right font-medium text-xs text-slate-900 tabular-nums">
                          {formatCurrency(supplier.totalAmount)}
                        </Table.Cell>
                        <Table.Cell className="text-right text-xs text-slate-700 tabular-nums">
                          {formatCurrency(supplier.averageRate)}/L
                        </Table.Cell>
                        <Table.Cell className="text-right text-xs text-slate-700 font-mono tabular-nums">
                          {supplier.transactionCount}
                        </Table.Cell>
                        <Table.Cell className={`text-right font-medium text-xs tabular-nums ${supplier.balance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {formatCurrency(supplier.balance)}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Supplier Summary */}
          <div className="md:hidden space-y-2.5">
            {summaryReport.supplierSummaries.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No purchases found for the selected filters
              </div>
            ) : (
              summaryReport.supplierSummaries.map((supplier) => (
                <div key={supplier.accountId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{supplier.accountName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{supplier.accountCode} • {supplier.transactionCount} txns</div>
                    </div>
                    <button
                      onClick={() => handleSupplierClick(supplier.accountId, supplier.accountName)}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-200"
                    >
                      Milk Card
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Liters</span>
                      <span className="font-bold text-blue-600 block">{supplier.totalLiters.toFixed(2)} L</span>
                      <span className="text-slate-600 text-[11px] block">Avg: {formatCurrency(supplier.averageRate)}/L</span>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Financials</span>
                      <span className="font-bold text-emerald-600 block">{formatCurrency(supplier.totalAmount)}</span>
                      <span className="text-rose-600 font-semibold text-[11px] block">Bal: {formatCurrency(supplier.balance)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && purchaseModalData && expenseAccounts.length > 0 && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setPurchaseModalData(null);
            setCurrentPurchase(null);
          }}
          onSubmit={handlePurchaseSubmit}
          supplier={purchaseModalData.supplier}
          availableTimes={purchaseModalData.availableTimes}
          isAdmin={true}
          expenseAccounts={expenseAccounts}
          selectedExpenseAccount={purchaseModalData.selectedExpenseAccount}
          isUpdate={purchaseModalData.isUpdate}
          updateData={purchaseModalData.updateData}
          initialDate={purchaseModalData.initialDate}
        />
      )}

      {/* Milk Card Modal */}
      {showMilkCardModal && milkCardData && (
        <MilkCardModal
          isOpen={showMilkCardModal}
          onClose={() => {
            setShowMilkCardModal(false);
            setMilkCardData(null);
          }}
          accountId={milkCardData.accountId}
          accountName={milkCardData.accountName}
          date={milkCardData.date}
          transactionType={milkCardData.transactionType}
        />
      )}
    </div>
  );
}

export default function PurchaseReportPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <AdminLayout>
        <Suspense fallback={<CenteredSpinner message="Loading purchase report..." />}>
          <PurchaseReportContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}