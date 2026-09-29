'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Download,
  RefreshCw,
  Eye,
  Receipt,
  TrendingUp,
  Users,
  DollarSign,
  Milk,
  Scale,
  Filter,
  Droplet,
  Printer
} from 'lucide-react';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import { FullPageSpinner, CenteredSpinner } from '@/components/ui/spinner';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import {
  getSalesReport,
  getBuyerWiseSalesReport,
  getSalesReportSummary,
  SalesRecord,
  BuyerWiseSalesReport,
  SalesReportSummary
} from '@/lib/api/reports';
import { getMyChillar } from '@/lib/api/chillarReceive';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { SalesFormModal } from '@/components/modals/SalesFormModal';
import MilkCardModal from '@/components/modals/MilkCardModal';
import { getSaleById, SaleDto, updateSale } from '@/lib/api/sales';
import { getAccountsByComponent, SearchAccountResult } from '@/lib/api/accounts';
import { getCurrentMonthHalfDateRange } from '@/lib/utils/dateRange';

type ReportView = 'detailed' | 'summary';

function SalesReportContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [view, setView] = useState<ReportView>('detailed');
  const defaultDateRange = getCurrentMonthHalfDateRange();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || defaultDateRange.startDate,
    endDate: searchParams.get('endDate') || defaultDateRange.endDate
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [buyerSummaryData, setBuyerSummaryData] = useState<BuyerWiseSalesReport | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesReportSummary | null>(null);
  const [userChillarId, setUserChillarId] = useState<number | null>(null);
  const [chillars, setChillars] = useState<Chillar[]>([]);
  const [selectedChillarId, setSelectedChillarId] = useState<number | undefined>(
    searchParams.get('chillarId') ? Number(searchParams.get('chillarId')) : undefined
  );
  const [showFilters, setShowFilters] = useState(false);

  // Missing state definitions
  const [currentSale, setCurrentSale] = useState<SaleDto | null>(null);
  const [salesModalData, setSalesModalData] = useState<{
    buyer: { id: number; name: string; code: string };
    initialDate: string;
    selectedRevenueAccount: number | null;
    saleId: number;
  } | null>(null);
  const [revenueAccounts, setRevenueAccounts] = useState<SearchAccountResult[]>([]);
  const [salesFormValues, setSalesFormValues] = useState({
    grossLiters: 0,
    lr: 0,
    fat: 0,
    netLiters: 0,
    rate: 0,
    amount: 0,
    amountReceived: 0,
    revenueAccountId: 0
  });
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showMilkCardModal, setShowMilkCardModal] = useState(false);
  const [milkCardData, setMilkCardData] = useState<{
    accountId: number;
    accountName: string;
    date: string;
    transactionType: 'Sale';
  } | null>(null);

  // Load chillars for admin
  useEffect(() => {
    const loadChillars = async () => {
      if (isAdmin) {
        try {
          const chillarData = await getChillars();
          setChillars(chillarData);
        } catch (error) {
          console.error('Failed to fetch chillars:', error);
        }
      }
    };

    loadChillars();
  }, [isAdmin]);

  // Get user's chillar ID if not admin
  useEffect(() => {
    const fetchUserChillar = async () => {
      if (!isAdmin) {
        try {
          const chillarData = await getMyChillar();
          setUserChillarId(chillarData.chillarId);
        } catch (error) {
          console.error('Failed to fetch user chillar:', error);
        }
      }
    };

    fetchUserChillar();
  }, [isAdmin]);

  // Load revenue accounts for sales modal
  useEffect(() => {
    const loadRevenueAccounts = async () => {
      try {
        const accounts = await getAccountsByComponent('revenue');
        setRevenueAccounts(accounts);
      } catch (error) {
        console.error('Failed to load revenue accounts:', error);
      }
    };
    loadRevenueAccounts();
  }, []);

  // Update sales form values when sale is loaded
  useEffect(() => {
    if (currentSale) {
      setSalesFormValues({
        grossLiters: currentSale.grossLiters,
        lr: currentSale.lr,
        fat: currentSale.fat,
        netLiters: currentSale.netLiters,
        rate: currentSale.rate,
        amount: currentSale.totalAmount,
        amountReceived: currentSale.amountReceived,
        revenueAccountId: currentSale.revenueAccountId
      });

      // Ensure the sale's revenue account is in the list
      if (currentSale.revenueAccountId && currentSale.revenueAccountName) {
        setRevenueAccounts(prev => {
          const exists = prev.some(acc => acc.accountId === currentSale.revenueAccountId);
          if (!exists) {
            return [...prev, {
              accountId: currentSale.revenueAccountId,
              accountCode: '',
              name: currentSale.revenueAccountName,
              balance: 0
            }];
          }
          return prev;
        });
      }
    }
  }, [currentSale]);

  // Sales input change handler
  const handleSalesInputChange = (field: string, value: number) => {
    setSalesFormValues(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate netLiters and amount if needed
      if (field === 'grossLiters' || field === 'lr' || field === 'fat') {
        const gross = field === 'grossLiters' ? value : updated.grossLiters;
        const lr = field === 'lr' ? value : updated.lr;
        const fat = field === 'fat' ? value : updated.fat;

        const netLiters = gross - (gross * lr / 100) - (gross * fat / 100);
        updated.netLiters = Math.max(0, netLiters);
      }

      if (field === 'netLiters' || field === 'rate') {
        const net = field === 'netLiters' ? value : updated.netLiters;
        const rate = field === 'rate' ? value : updated.rate;
        updated.amount = net * rate;
      }

      return updated;
    });
  };

  // Handle sale click in detailed view
  const handleSaleClick = async (saleId: number, accountId: number, accountName: string, accountCode: string, date: string) => {
    try {
      const sale = await getSaleById(saleId);

      // Ensure revenue accounts are loaded
      let accounts = revenueAccounts;
      if (accounts.length === 0) {
        accounts = await getAccountsByComponent('revenue');
        setRevenueAccounts(accounts);
      }

      // Ensure the sale's revenue account is in the list
      if (sale.revenueAccountId && sale.revenueAccountName) {
        const accountExists = accounts.some(acc => acc.accountId === sale.revenueAccountId);
        if (!accountExists) {
          const newAccount: SearchAccountResult = {
            accountId: sale.revenueAccountId,
            accountCode: '',
            name: sale.revenueAccountName,
            balance: 0
          };
          accounts = [...accounts, newAccount];
          setRevenueAccounts(accounts);
        }
      }

      setCurrentSale(sale);
      setSalesModalData({
        buyer: {
          id: accountId,
          name: accountName,
          code: accountCode
        },
        initialDate: date,
        selectedRevenueAccount: sale.revenueAccountId || null,
        saleId: saleId
      });
      setShowSalesModal(true);
    } catch (error) {
      console.error('Failed to load sale:', error);
    }
  };

  // Handle sales submit
  // const handleSalesSubmit = async (data: {
  //   grossLiters: number;
  //   lr: number;
  //   fat: number;
  //   netLiters: number;
  //   rate: number;
  //   amount: number;
  //   amountReceived: number;
  //   revenueAccountId: number;
  //   date: string;
  // }) => {
  //   if (!salesModalData || !currentSale) return;

  //   try {
  //     const chillarId = currentSale.chillarId;
  //     if (!chillarId || chillarId <= 0) {
  //       alert('Chillar ID is missing from sale record. Cannot update.');
  //       return;
  //     }

  //     const revenueAccountId = data.revenueAccountId || currentSale.revenueAccountId;
  //     if (!revenueAccountId || revenueAccountId <= 0) {
  //       alert('Please select a revenue account');
  //       return;
  //     }

  //     await updateSale(salesModalData.saleId, {
  //       date: data.date,
  //       accountId: salesModalData.buyer.id,
  //       revenueAccountId: revenueAccountId,
  //       chillarId: chillarId,
  //       grossLiters: data.grossLiters,
  //       lr: data.lr,
  //       fat: data.fat,
  //       netLiters: data.netLiters,
  //       rate: data.rate,
  //       amountReceived: data.amountReceived
  //     });

  //     setShowSalesModal(false);
  //     setSalesModalData(null);
  //     setCurrentSale(null);

  //     // Refresh data
  //     const params = {
  //       startDate: dateRange.startDate,
  //       endDate: dateRange.endDate,
  //       ...(isAdmin && selectedChillarId && { chillarId: selectedChillarId }),
  //       ...(!isAdmin && userChillarId && { chillarId: userChillarId })
  //     };

  //     if (view === 'detailed') {
  //       const salesReportData = await getSalesReport(params);
  //       setSalesData(salesReportData);
  //       loadSummary();
  //     } else {
  //       const buyerData = await getBuyerWiseSalesReport(params);
  //       setBuyerSummaryData(buyerData);
  //     }
  //   } catch (error: any) {
  //     console.error('Failed to update sale:', error);
  //     alert(error?.response?.data?.message || error?.message || 'Failed to update sale');
  //     throw error;
  //   }
  // };

  const handleSalesSubmit = async (data: {
    grossLiters: number;
    lr: number;
    fat: number;
    netLiters: number;
    rate: number;
    amount: number;
    amountReceived: number;
    revenueAccountId: number;
    date: string;
  }): Promise<void> => {
    if (!salesModalData || !currentSale) {
      throw new Error('Missing sale data');
    }

    const chillarId = currentSale.chillarId;
    if (!chillarId || chillarId <= 0) {
      alert('Chillar ID is missing from sale record. Cannot update.');
      throw new Error('Invalid chillar ID');
    }

    const revenueAccountId = data.revenueAccountId || currentSale.revenueAccountId;
    if (!revenueAccountId || revenueAccountId <= 0) {
      alert('Please select a revenue account');
      throw new Error('Invalid revenue account');
    }

    try {
      await updateSale(salesModalData.saleId, {
        date: data.date,
        accountId: salesModalData.buyer.id,
        revenueAccountId: revenueAccountId,
        chillarId: chillarId,
        grossLiters: data.grossLiters,
        lr: data.lr,
        fat: data.fat,
        netLiters: data.netLiters,
        rate: data.rate,
        amountReceived: data.amountReceived
      });

      // Close modal on success
      setShowSalesModal(false);
      setSalesModalData(null);
      setCurrentSale(null);

      // Refresh data
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && selectedChillarId && { chillarId: selectedChillarId }),
        ...(!isAdmin && userChillarId && { chillarId: userChillarId })
      };

      if (view === 'detailed') {
        const salesReportData = await getSalesReport(params);
        setSalesData(salesReportData);
        loadSummary();
      } else {
        const buyerData = await getBuyerWiseSalesReport(params);
        setBuyerSummaryData(buyerData);
      }
    } catch (error: any) {
      console.error('Failed to update sale:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update sale';
      alert(errorMessage);
      // Re-throw the error so the modal knows it failed
      throw error;
    }
  };

  // Handle buyer click in summary view (open milk card)
  const handleBuyerClick = (accountId: number, accountName: string) => {
    setMilkCardData({
      accountId,
      accountName,
      date: dateRange.endDate || new Date().toISOString().split('T')[0],
      transactionType: 'Sale'
    });
    setShowMilkCardModal(true);
  };

  // Load summary separately
  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(isAdmin && selectedChillarId && { chillarId: selectedChillarId }),
        ...(!isAdmin && userChillarId && { chillarId: userChillarId })
      };

      const summary = await getSalesReportSummary(params);
      setSalesSummary(summary);
    } catch (error) {
      console.error('Failed to fetch sales summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Load sales data based on view
  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        const params = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...(isAdmin && selectedChillarId && { chillarId: selectedChillarId }),
          ...(!isAdmin && userChillarId && { chillarId: userChillarId })
        };

        if (view === 'detailed') {
          const salesReportData = await getSalesReport(params);
          setSalesData(salesReportData);
          // Load summary separately
          loadSummary();
        } else {
          const buyerData = await getBuyerWiseSalesReport(params);
          setBuyerSummaryData(buyerData);
        }
      } catch (error) {
        console.error('Failed to fetch sales data:', error);
        if (view === 'detailed') {
          setSalesData([]);
        } else {
          setBuyerSummaryData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || userChillarId) {
      loadSalesData();
    }
  }, [dateRange, userChillarId, isAdmin, selectedChillarId, view]);

  // Filter transactions for detailed view
  const filteredTransactions = useMemo(() => {
    if (view !== 'detailed') return [];
    return salesData.filter(transaction =>
      transaction.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.saleId.toString().includes(searchTerm.toLowerCase())
    );
  }, [salesData, searchTerm, view]);

  // Filter buyer summaries
  const filteredBuyerSummaries = useMemo(() => {
    if (view !== 'summary' || !buyerSummaryData) return [];
    return buyerSummaryData.buyerSummaries.filter(buyer =>
      buyer.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.accountCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [buyerSummaryData, searchTerm, view]);

  // Pagination
  const totalPages = Math.ceil(
    (view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length) / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = view === 'detailed'
    ? filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
    : filteredBuyerSummaries.slice(startIndex, startIndex + itemsPerPage);

  // Format currency as Pakistani Rupees
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExportData = () => {
    let csvContent = '';

    if (view === 'detailed') {
      const headers = [
        'Sale ID',
        'Date',
        'Account Code',
        'Buyer Name',
        'Chillar Name',
        'Added By',
        'Gross Liters',
        'LR',
        'Fat',
        'Net Liters',
        'Rate',
        ...(isAdmin ? ['Total Amount', 'Received Amount', 'Balance'] : [])
      ];

      csvContent = [
        headers.join(','),
        ...filteredTransactions.map(sale => [
          sale.saleId,
          sale.date,
          sale.accountCode,
          `"${sale.accountName}"`,
          `"${sale.chillarName}"`,
          `"${sale.addedByName}"`,
          sale.grossLiters,
          sale.lr,
          sale.fat,
          sale.netLiters,
          sale.rate,
          ...(isAdmin ? [sale.totalAmount, sale.amountReceived, sale.balance] : [])
        ].join(','))
      ].join('\n');
    } else {
      const headers = [
        'Account Code',
        'Buyer Name',
        'Total Gross Liters',
        'Total Net Liters',
        'Total Amount',
        'Amount Received',
        'Average Rate',
        'Average LR',
        'Average Fat',
        'Transactions',
        'Balance'
      ];

      csvContent = [
        headers.join(','),
        ...filteredBuyerSummaries.map(buyer => [
          buyer.accountCode,
          `"${buyer.accountName}"`,
          buyer.totalGrossLiters,
          buyer.totalNetLiters,
          buyer.totalAmount,
          buyer.totalAmountReceived,
          buyer.averageRate,
          buyer.averageLR,
          buyer.averageFat,
          buyer.transactionCount,
          buyer.balance
        ].join(','))
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${view}-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const summary = view === 'detailed' ? salesSummary : buyerSummaryData?.overallSummary;

  const summaryStats: StatItem[] = summary ? [
    {
      label: 'Gross Liters',
      value: `${summary.totalGrossLiters.toFixed(2)} L`,
      color: 'success',
      icon: <Milk className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: 'Net Liters',
      value: `${summary.totalNetLiters.toFixed(2)} L`,
      color: 'primary',
      icon: <Droplet className="w-4 h-4 text-blue-600" />,
    },
    ...(isAdmin ? [
      {
        label: 'Total Amount',
        value: formatPKR(summary.totalAmount),
        subtext: `Avg: ${formatPKR(summary.averageRate)}/L`,
        color: 'primary' as const,
        icon: <DollarSign className="w-4 h-4 text-purple-600" />,
      },
      {
        label: 'Received',
        value: formatPKR(summary.totalAmountReceived),
        color: 'warning' as const,
        icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
      },
      {
        label: 'Buyers',
        value: summary.totalBuyers.toString(),
        subtext: `${summary.totalTransactions} txns`,
        color: 'info' as const,
        icon: <Users className="w-4 h-4 text-cyan-600" />,
      },
    ] : [
      {
        label: 'Buyers',
        value: summary.totalBuyers.toString(),
        subtext: `${summary.totalTransactions} txns`,
        color: 'info' as const,
        icon: <Users className="w-4 h-4 text-cyan-600" />,
      },
    ]),
  ] : [];

  if (loading && !salesData.length && !buyerSummaryData) {
    return <FullPageSpinner message="Loading sales report..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <PageHeader
        title="Sales Report"
        subtitle="Detailed milk sales transactions and buyer-wise aggregation"
        icon={<ShoppingCart className="w-5 h-5 text-emerald-600" />}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  setView('detailed');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === 'detailed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed Report
              </button>
              <button
                onClick={() => {
                  setView('summary');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === 'summary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Buyer Summary
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        }
      />

      {/* Print Header */}
      <ReportPrintHeader
        title={view === 'detailed' ? "Milk Dispatch & Sales Detailed Audit Report" : "Milk Sales Buyer Summary Statement"}
        subtitle={view === 'detailed' ? "Individual Milk Sales Ledger Transactions" : "Consolidated Buyer-Wise Offtake & Financial Balances"}
        dateRange={dateRange}
        chillarName={chillars.find(c => c.chillarId === selectedChillarId)?.name || (isAdmin ? 'All Chillars' : undefined)}
      />

      <CompactToolbar
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {isAdmin && chillars.length > 0 && (
              <div className="min-w-[150px]">
                <Select
                  value={selectedChillarId?.toString() || ''}
                  onChange={(value) => setSelectedChillarId(value ? Number(value) : undefined)}
                  options={[
                    { value: '', label: 'All Chillars' },
                    ...chillars.map(chillar => ({
                      value: chillar.chillarId.toString(),
                      label: chillar.name
                    }))
                  ]}
                />
              </div>
            )}
          </div>
        }
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: 'Search buyer, code...',
        }}
        rightActions={
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length}</strong> of{' '}
            <strong className="text-slate-800">{view === 'detailed' ? salesData.length : (buyerSummaryData?.buyerSummaries.length || 0)}</strong>
          </span>
        }
      />

      {summary && <StatStrip items={summaryStats} loading={summaryLoading} />}

      {loading && (
        <CenteredSpinner message="Loading sales report..." />
      )}

      {/* Detailed Sales Table */}
      {!loading && view === 'detailed' && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block print:block">
            <TableContainer title="Sales Transactions">
              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head>Date</Table.Head>
                    <Table.Head>Buyer Details</Table.Head>
                    <Table.Head>Chillar & Added By</Table.Head>
                    <Table.Head className="text-right">Gross Liters</Table.Head>
                    <Table.Head className="text-right">LR & Fat</Table.Head>
                    <Table.Head className="text-right">Net Liters</Table.Head>
                    {isAdmin && (
                      <>
                        <Table.Head className="text-right">Rate</Table.Head>
                        <Table.Head className="text-right">Total Amount</Table.Head>
                        <Table.Head className="text-right">Received</Table.Head>
                        <Table.Head className="text-right">Balance</Table.Head>
                      </>
                    )}
                    <Table.Head className="text-center">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 7} className="text-center py-8">
                        <div className="text-slate-400">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">No sales data found for the selected period</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (paginatedData as SalesRecord[]).map((transaction) => (
                      <Table.Row key={transaction.saleId}>
                        <Table.Cell>
                          <div className="font-medium text-slate-900 text-xs">
                            {new Date(transaction.date).toLocaleDateString('en-PK', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-900 text-xs">{transaction.accountName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{transaction.accountCode}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="space-y-0.5">
                            <div className="text-xs font-medium text-slate-900">{transaction.chillarName}</div>
                            <div className="text-[11px] text-slate-500">By: {transaction.addedByName}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <span
                            className="font-medium text-blue-600 text-xs cursor-pointer hover:underline tabular-nums"
                            onClick={() => handleSaleClick(
                              transaction.saleId,
                              transaction.accountId,
                              transaction.accountName,
                              transaction.accountCode,
                              transaction.date
                            )}
                            title="Click to edit sale"
                          >
                            {transaction.grossLiters.toFixed(2)}L
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right tabular-nums">
                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            <div>LR: <span className="font-medium">{transaction.lr.toFixed(1)}</span></div>
                            <div>Fat: <span className="font-medium">{transaction.fat.toFixed(1)}</span></div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <span className="font-medium text-slate-800 text-xs tabular-nums">{transaction.netLiters.toFixed(2)}L</span>
                        </Table.Cell>
                        {isAdmin && (
                          <>
                            <Table.Cell className="text-right">
                              <span className="text-xs text-slate-700 tabular-nums">{formatPKR(transaction.rate)}/L</span>
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              <span className="font-medium text-slate-900 text-xs tabular-nums">{formatPKR(transaction.totalAmount)}</span>
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              <span className="font-medium text-emerald-600 text-xs tabular-nums">{formatPKR(transaction.amountReceived)}</span>
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              <span className={`font-medium text-xs tabular-nums ${transaction.balance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {formatPKR(transaction.balance)}
                              </span>
                            </Table.Cell>
                          </>
                        )}
                        <Table.Cell className="text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Print Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Detailed Sales */}
          <div className="md:hidden space-y-2.5 print:hidden">
            {paginatedData.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No sales data found for the selected period</p>
              </div>
            ) : (
              (paginatedData as SalesRecord[]).map((transaction) => (
                <div key={transaction.saleId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2.5">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{transaction.accountName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{transaction.accountCode}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaleClick(
                        transaction.saleId,
                        transaction.accountId,
                        transaction.accountName,
                        transaction.accountCode,
                        transaction.date
                      )}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-200"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Gross / Net Liters</span>
                      <span className="font-bold text-emerald-600">{transaction.grossLiters.toFixed(2)}L</span>
                      <span className="text-[11px] text-blue-600 font-semibold block">{transaction.netLiters.toFixed(2)}L Net</span>
                      <span className="text-[10px] text-slate-500">LR {transaction.lr.toFixed(1)} / Fat {transaction.fat.toFixed(1)}</span>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Chillar & Added By</span>
                      <span className="font-semibold text-slate-800 block truncate">{transaction.chillarName}</span>
                      <span className="text-[11px] text-slate-500 block truncate">By: {transaction.addedByName}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Rate / Amount</span>
                        <span className="font-bold text-purple-700">{formatPKR(transaction.totalAmount)}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({formatPKR(transaction.rate)}/L)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Rcvd / Balance</span>
                        <span className="font-medium text-emerald-600">{formatPKR(transaction.amountReceived)}</span>
                        <span className="font-bold text-rose-600 ml-1">Bal: {formatPKR(transaction.balance)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Buyer Summary Table */}
      {!loading && view === 'summary' && buyerSummaryData && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block print:block">
            <TableContainer title="Buyer-wise Summary">
              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head>Buyer Code</Table.Head>
                    <Table.Head>Buyer Name</Table.Head>
                    <Table.Head className="text-right">Gross Liters</Table.Head>
                    <Table.Head className="text-right">Net Liters</Table.Head>
                    {isAdmin && (
                      <>
                        <Table.Head className="text-right">Total Amount</Table.Head>
                        <Table.Head className="text-right">Received</Table.Head>
                        <Table.Head className="text-right">Avg Rate</Table.Head>
                      </>
                    )}
                    <Table.Head className="text-right">Avg LR / Fat</Table.Head>
                    <Table.Head className="text-right">Txns</Table.Head>
                    {isAdmin && (
                      <Table.Head className="text-right">Balance</Table.Head>
                    )}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredBuyerSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 10 : 6} className="text-center py-8 text-xs text-gray-500">
                        No buyer data found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((buyer: any) => (
                      <Table.Row key={buyer.accountId}>
                        <Table.Cell className="font-mono text-xs text-slate-600">
                          {buyer.accountCode}
                        </Table.Cell>
                        <Table.Cell className="font-medium text-xs text-slate-900">{buyer.accountName}</Table.Cell>
                        <Table.Cell className="text-right">
                          <span
                            className="font-medium text-blue-600 text-xs cursor-pointer hover:underline tabular-nums"
                            onClick={() => handleBuyerClick(buyer.accountId, buyer.accountName)}
                            title="Click to view milk card"
                          >
                            {buyer.totalGrossLiters.toFixed(2)}L
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right font-medium text-xs text-slate-800 tabular-nums">
                          {buyer.totalNetLiters.toFixed(2)}L
                        </Table.Cell>
                        {isAdmin && (
                          <>
                            <Table.Cell className="text-right font-medium text-xs text-slate-900 tabular-nums">
                              {formatPKR(buyer.totalAmount)}
                            </Table.Cell>
                            <Table.Cell className="text-right font-medium text-xs text-emerald-600 tabular-nums">
                              {formatPKR(buyer.totalAmountReceived)}
                            </Table.Cell>
                            <Table.Cell className="text-right text-xs text-slate-700 tabular-nums">
                              {formatPKR(buyer.averageRate)}/L
                            </Table.Cell>
                          </>
                        )}
                        <Table.Cell className="text-right text-xs text-slate-600 tabular-nums">
                          <span className="font-medium">{buyer.averageLR.toFixed(1)}</span> / <span className="font-medium">{buyer.averageFat.toFixed(1)}</span>
                        </Table.Cell>
                        <Table.Cell className="text-right text-xs text-slate-700 font-mono tabular-nums">
                          {buyer.transactionCount}
                        </Table.Cell>
                        {isAdmin && (
                          <Table.Cell className={`text-right font-medium text-xs tabular-nums ${buyer.balance > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {formatPKR(buyer.balance)}
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Buyer Summary */}
          <div className="md:hidden space-y-2.5 print:hidden">
            {filteredBuyerSummaries.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-gray-500">
                No buyer data found for the selected filters
              </div>
            ) : (
              paginatedData.map((buyer: any) => (
                <div key={buyer.accountId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{buyer.accountName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{buyer.accountCode} • {buyer.transactionCount} txns</div>
                    </div>
                    <button
                      onClick={() => handleBuyerClick(buyer.accountId, buyer.accountName)}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-200"
                    >
                      Milk Card
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Liters</span>
                      <span className="font-bold text-emerald-600">{buyer.totalGrossLiters.toFixed(2)}L Gross</span>
                      <span className="text-[11px] text-blue-600 block">{buyer.totalNetLiters.toFixed(2)}L Net</span>
                      <span className="text-[10px] text-slate-500">Avg LR {buyer.averageLR.toFixed(1)} / Fat {buyer.averageFat.toFixed(1)}</span>
                    </div>

                    {isAdmin ? (
                      <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Financials</span>
                        <span className="font-bold text-purple-700 block">{formatPKR(buyer.totalAmount)}</span>
                        <span className="text-[11px] text-emerald-600 block">Rcvd: {formatPKR(buyer.totalAmountReceived)}</span>
                        <span className="text-[11px] font-bold text-rose-600 block">Bal: {formatPKR(buyer.balance)}</span>
                      </div>
                    ) : (
                      <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Quality</span>
                        <span className="text-slate-700 block">LR: {buyer.averageLR.toFixed(2)}</span>
                        <span className="text-slate-700 block">Fat: {buyer.averageFat.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs print:hidden">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(startIndex + itemsPerPage, view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length)}</span> of <span className="font-semibold text-slate-800">{view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length}</span> results
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
            >
              Previous
            </button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 text-xs font-semibold rounded-md transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ReportPrintFooter />

      {/* Sales Modal */}
      {showSalesModal && salesModalData && currentSale && (
        <SalesFormModal
          isOpen={showSalesModal}
          onClose={() => {
            setShowSalesModal(false);
            setSalesModalData(null);
            setCurrentSale(null);
          }}
          onSubmit={handleSalesSubmit}
          initialData={{
            grossLiters: currentSale.grossLiters,
            lr: currentSale.lr,
            fat: currentSale.fat,
            netLiters: currentSale.netLiters,
            rate: currentSale.rate,
            amountReceived: currentSale.amountReceived,
            revenueAccountId: currentSale.revenueAccountId,
            date: salesModalData.initialDate
          }}
          buyerName={salesModalData.buyer.name}
          buyerId={salesModalData.buyer.id.toString()}
          date={salesModalData.initialDate}
          isAdmin={true}
          isFromAddedList={true}
          revenueAccounts={revenueAccounts.map(acc => ({
            accountId: acc.accountId,
            accountName: acc.name,
            accountCode: acc.accountCode
          }))}
          formValues={salesFormValues}
          onInputChange={handleSalesInputChange}
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

export default function SalesReport() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      <DynamicLayout>
        <Suspense fallback={<FullPageSpinner message="Loading sales report..." />}>
          <SalesReportContent />
        </Suspense>
      </DynamicLayout>
    </ProtectedRoute>
  );
}