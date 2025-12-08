'use client';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useEffect, useState } from 'react';
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
import { FileText, TrendingUp, DollarSign, Droplet, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import { CenteredSpinner } from '@/components/ui/spinner';
import PurchaseModal from '@/components/modals/PurchaseModal';
import MilkCardModal from '@/components/modals/MilkCardModal';
import { getPurchaseById, Purchase, updatePurchase } from '@/lib/api/purchases';
import { getAccountsByComponent, SearchAccountResult } from '@/lib/api/accounts';
import { getDefaultDateRange } from '@/lib/utils/dateRange';

type ReportView = 'detailed' | 'summary';

export default function PurchaseReportPage() {
  const [view, setView] = useState<ReportView>('detailed');
  const [detailedReport, setDetailedReport] = useState<PagedPurchaseReport | null>(null);
  const [summaryReport, setSummaryReport] = useState<SupplierWisePurchaseReport | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Get default date range based on current date
  const defaultDateRange = getDefaultDateRange();

  // Filter states
  const [filters, setFilters] = useState<PurchaseReportQuery>({
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
    timeOfDay: undefined,
    dodhiId: undefined,
    chillarId: undefined,
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

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Report</h1>
            <p className="text-sm text-gray-600 mt-1">
              View detailed and summary purchase reports
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setView('detailed')}
              className={`px-6 py-3 font-medium transition-colors ${view === 'detailed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Detailed Report
            </button>
            <button
              onClick={() => setView('summary')}
              className={`px-6 py-3 font-medium transition-colors ${view === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Supplier Summary
            </button>
          </div>

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

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <SummaryCard
                title="Total Liters"
                value={summaryLoading ? '...' : summary.totalLiters.toFixed(2)}
                icon={<Droplet className="w-6 h-6" />}
                color="blue"
              />
              <SummaryCard
                title="Total Amount"
                value={summaryLoading ? '...' : formatCurrency(summary.totalAmount)}
                icon={<DollarSign className="w-6 h-6" />}
                color="green"
              />
              <SummaryCard
                title="Avg Rate"
                value={summaryLoading ? '...' : `${summary.averageRate.toFixed(2)}`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="purple"
              />
              <SummaryCard
                title="Transactions"
                value={summaryLoading ? '...' : summary.totalTransactions.toString()}
                icon={<FileText className="w-6 h-6" />}
                color="orange"
              />
              <SummaryCard
                title="Suppliers"
                value={summaryLoading ? '...' : summary.totalSuppliers.toString()}
                icon={<Users className="w-6 h-6" />}
                color="yellow"
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <CenteredSpinner message="Loading report..." />
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          )}

          {/* Detailed Report Table */}
          {!loading && !error && view === 'detailed' && detailedReport && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Purchase Details
                  {detailedReport.paginatedPurchases.totalCount > 0 && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Page {currentPage} of {detailedReport.paginatedPurchases.totalPages})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Time</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Supplier</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Dodhi</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Chillar</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Liters</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Rate</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedReport.paginatedPurchases.items.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center p-8 text-gray-500">
                            No purchases found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        detailedReport.paginatedPurchases.items.map((purchase) => (
                          <tr
                            key={purchase.purchaseId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 text-sm text-gray-700">{formatDate(purchase.date)}</td>
                            <td className="p-3 text-sm text-gray-700 capitalize">{purchase.timeOfDay}</td>
                            <td className="p-3 text-sm">
                              <div className="font-medium text-gray-900">{purchase.accountName}</div>
                              <div className="text-xs text-gray-500">{purchase.accountCode}</div>
                            </td>
                            <td className="p-3 text-sm text-gray-700">{purchase.dodhiName}</td>
                            <td className="p-3 text-sm text-gray-700">{purchase.chillarName}</td>
                            <td
                              className="p-3 text-sm text-right font-medium text-blue-600 cursor-pointer hover:underline"
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
                              {purchase.grossLiters.toFixed(2)}
                            </td>
                            <td className="p-3 text-sm text-right text-gray-700">
                              {formatCurrency(purchase.rate)}
                            </td>
                            <td className="p-3 text-sm text-right font-medium text-green-600">
                              {formatCurrency(purchase.totalAmount)}
                            </td>
                            <td className="p-3 text-sm text-right font-medium text-red-600">
                              {formatCurrency(purchase.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {detailedReport.paginatedPurchases.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                      {Math.min(currentPage * pageSize, detailedReport.paginatedPurchases.totalCount)} of{' '}
                      {detailedReport.paginatedPurchases.totalCount} purchases
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
                        disabled={currentPage === detailedReport.paginatedPurchases.totalPages}
                        className={`p-2 rounded-lg border transition-colors ${currentPage === detailedReport.paginatedPurchases.totalPages
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

          {/* Supplier Summary Table */}
          {!loading && !error && view === 'summary' && summaryReport && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier-wise Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Supplier Code</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Supplier Name</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Total Liters</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Total Amount</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Avg Rate</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Transactions</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryReport.supplierSummaries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-500">
                            No purchases found for the selected filters
                          </td>
                        </tr>
                      ) : (
                        summaryReport.supplierSummaries.map((supplier) => (
                          <tr
                            key={supplier.accountId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 text-sm font-medium text-gray-900">
                              {supplier.accountCode}
                            </td>
                            <td className="p-3 text-sm text-gray-700">{supplier.accountName}</td>
                            <td
                              className="p-3 text-sm text-right font-medium text-blue-600 cursor-pointer hover:underline"
                              onClick={() => handleSupplierClick(supplier.accountId, supplier.accountName)}
                              title="Click to view milk card"
                            >
                              {supplier.totalLiters.toFixed(2)}
                            </td>
                            <td className="p-3 text-sm text-right font-medium text-green-600">
                              {formatCurrency(supplier.totalAmount)}
                            </td>
                            <td className="p-3 text-sm text-right text-gray-700">
                              {formatCurrency(supplier.averageRate)}
                            </td>
                            <td className="p-3 text-sm text-right text-gray-700">
                              {supplier.transactionCount}
                            </td>
                            <td className="p-3 text-sm text-right font-medium text-red-600">
                              {formatCurrency(supplier.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
      </AdminLayout>
    </ProtectedRoute>
  );
}