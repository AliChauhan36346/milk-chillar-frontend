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
  Droplet
} from 'lucide-react';
import { FullPageSpinner } from '@/components/ui/spinner';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getDefaultDateRange } from '@/lib/utils/dateRange';

type ReportView = 'detailed' | 'summary';

function SalesReportContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [view, setView] = useState<ReportView>('detailed');
  const defaultDateRange = getDefaultDateRange();
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

  if (loading && !salesData.length && !buyerSummaryData) {
    return <FullPageSpinner message="Loading sales report..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales Report</h1>
          </div>
        </div>
        <button
          onClick={handleExportData}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-xl px-4">
        <button
          onClick={() => {
            setView('detailed');
            setCurrentPage(1);
          }}
          className={`px-6 py-3 font-medium transition-colors ${view === 'detailed'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Detailed Report
        </button>
        <button
          onClick={() => {
            setView('summary');
            setCurrentPage(1);
          }}
          className={`px-6 py-3 font-medium transition-colors ${view === 'summary'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Buyer Summary
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          <SummaryCard
            title="Total Gross Liters"
            value={summaryLoading ? '...' : `${summary.totalGrossLiters.toFixed(2)}L`}
            icon={<Milk className="w-6 h-6" />}
            color="green"
          />
          <SummaryCard
            title="Total Net Liters"
            value={summaryLoading ? '...' : `${summary.totalNetLiters.toFixed(2)}L`}
            icon={<Droplet className="w-6 h-6" />}
            color="blue"
          />
          {isAdmin && (
            <>
              <SummaryCard
                title="Total Amount"
                value={summaryLoading ? '...' : formatPKR(summary.totalAmount)}
                icon={<DollarSign className="w-6 h-6" />}
                color="purple"
                subtitle={`Avg: ${formatPKR(summary.averageRate)}/L`}
              />
              <SummaryCard
                title="Received Amount"
                value={summaryLoading ? '...' : formatPKR(summary.totalAmountReceived)}
                icon={<TrendingUp className="w-6 h-6" />}
                color="yellow"
              />
              <SummaryCard
                title="Buyers"
                value={summaryLoading ? '...' : summary.totalBuyers.toString()}
                icon={<Users className="w-6 h-6" />}
                color="orange"
                subtitle={`${summary.totalTransactions} transactions`}
              />
            </>
          )}
          {!isAdmin && (
            <SummaryCard
              title="Unique Buyers"
              value={summaryLoading ? '...' : summary.totalBuyers.toString()}
              icon={<Users className="w-6 h-6" />}
              color="purple"
              subtitle={`${summary.totalTransactions} transactions`}
            />
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chillar</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by buyer, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">
                {view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length}
              </span> of <span className="font-semibold text-gray-900">
                {view === 'detailed' ? salesData.length : (buyerSummaryData?.buyerSummaries.length || 0)}
              </span> results
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading report...</div>
        </div>
      )}

      {/* Detailed Sales Table */}
      {!loading && view === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Date</Table.Head>
                    <Table.Head>Buyer Details</Table.Head>
                    <Table.Head>Chillar & Added By</Table.Head>
                    <Table.Head>Gross Liters</Table.Head>
                    <Table.Head>LR & Fat</Table.Head>
                    <Table.Head>Net Liters</Table.Head>
                    {isAdmin && (
                      <>
                        <Table.Head>Rate</Table.Head>
                        <Table.Head>Total Amount</Table.Head>
                        <Table.Head>Received</Table.Head>
                        <Table.Head>Balance</Table.Head>
                      </>
                    )}
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 7} className="text-center py-8">
                        <div className="text-gray-500">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No sales data found for the selected period</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (paginatedData as SalesRecord[]).map((transaction) => (
                      <Table.Row key={transaction.saleId}>
                        <Table.Cell>
                          <div className="font-medium text-gray-900 text-sm">
                            {new Date(transaction.date).toLocaleDateString('en-PK', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-gray-900 text-sm">{transaction.accountName}</div>
                            <div className="text-xs text-gray-500">{transaction.accountCode}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-gray-900">{transaction.chillarName}</div>
                            <div className="text-xs text-gray-500">By: {transaction.addedByName}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className="font-medium text-green-600 text-sm cursor-pointer hover:underline"
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
                        <Table.Cell>
                          <div className="space-y-0.5 text-xs">
                            <div>LR: {transaction.lr.toFixed(2)}</div>
                            <div>Fat: {transaction.fat.toFixed(2)}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="font-medium text-blue-600 text-sm">{transaction.netLiters.toFixed(2)}L</span>
                        </Table.Cell>
                        {isAdmin && (
                          <>
                            <Table.Cell>
                              <span className="font-medium text-sm">{formatPKR(transaction.rate)}/L</span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-bold text-purple-600 text-sm">{formatPKR(transaction.totalAmount)}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-medium text-green-600 text-sm">{formatPKR(transaction.amountReceived)}</span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-medium text-red-600 text-sm">{formatPKR(transaction.balance)}</span>
                            </Table.Cell>
                          </>
                        )}
                        <Table.Cell>
                          <div className="flex gap-2">
                            <button
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                              title="Print Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buyer Summary Table */}
      {!loading && view === 'summary' && buyerSummaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Buyer-wise Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Buyer Code</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Buyer Name</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Gross Liters</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Net Liters</th>
                    {isAdmin && (
                      <>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Total Amount</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Received</th>
                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Avg Rate</th>
                      </>
                    )}
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Avg LR/Fat</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Transactions</th>
                    {isAdmin && (
                      <th className="text-right p-3 text-sm font-semibold text-gray-700">Balance</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyerSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 10 : 6} className="text-center p-8 text-gray-500">
                        No buyer data found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((buyer: any) => (
                      <tr
                        key={buyer.accountId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 text-sm font-medium text-gray-900">
                          {buyer.accountCode}
                        </td>
                        <td className="p-3 text-sm text-gray-700">{buyer.accountName}</td>
                        <td
                          className="p-3 text-sm text-right font-medium text-green-600 cursor-pointer hover:underline"
                          onClick={() => handleBuyerClick(buyer.accountId, buyer.accountName)}
                          title="Click to view milk card"
                        >
                          {buyer.totalGrossLiters.toFixed(2)}L
                        </td>
                        <td className="p-3 text-sm text-right font-medium text-blue-600">
                          {buyer.totalNetLiters.toFixed(2)}L
                        </td>
                        {isAdmin && (
                          <>
                            <td className="p-3 text-sm text-right font-medium text-purple-600">
                              {formatPKR(buyer.totalAmount)}
                            </td>
                            <td className="p-3 text-sm text-right font-medium text-green-600">
                              {formatPKR(buyer.totalAmountReceived)}
                            </td>
                            <td className="p-3 text-sm text-right text-gray-700">
                              {formatPKR(buyer.averageRate)}/L
                            </td>
                          </>
                        )}
                        <td className="p-3 text-sm text-right text-gray-700">
                          <div className="text-xs">
                            <div>LR: {buyer.averageLR.toFixed(2)}</div>
                            <div>Fat: {buyer.averageFat.toFixed(2)}</div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-right text-gray-700">
                          {buyer.transactionCount}
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-sm text-right font-medium text-red-600">
                            {formatPKR(buyer.balance)}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length)} of {view === 'detailed' ? filteredTransactions.length : filteredBuyerSummaries.length} results
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                  className={`px-3 py-2 text-sm border rounded-lg ${isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </div>
      )}

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