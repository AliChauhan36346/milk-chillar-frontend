
// 'use client';
// import { useState, useEffect, useMemo } from 'react';
// import {
//   ShoppingCart,
//   Search,
//   Calendar,
//   Download,
//   RefreshCw,
//   Eye,
//   Receipt,
//   TrendingUp,
//   Users,
//   DollarSign,
//   Milk,
//   Scale
// } from 'lucide-react';
// import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
// import { useAuth } from '@/lib/auth/AuthContext';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import SummaryCard from '@/components/ui/SummaryCard';
// import { BackButton } from '@/components/ui/BackButton';
// import { Table } from '@/components/ui/Table/Table';
// import { getSalesReport, SalesRecord } from '@/lib/api/reports';
// import { getMyChillar } from '@/lib/api/chillarReceive';

// interface SalesSummary {
//   totalGrossSales: number;
//   totalNetSales: number;
//   salesDifference: number;
//   totalAmount: number;
//   totalTransactions: number;
//   averageRate: number;
//   uniqueBuyers: number;
//   totalReceivedAmount: number;
// }

// export default function SalesReport() {
//   const { user } = useAuth();
//   const isAdmin = user?.role === 'admin';

//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [salesData, setSalesData] = useState<SalesRecord[]>([]);
//   const [userChillarId, setUserChillarId] = useState<number | null>(null);

//   // Get user's chillar ID if not admin
//   useEffect(() => {
//     const fetchUserChillar = async () => {
//       if (!isAdmin) {
//         try {
//           const chillarData = await getMyChillar();
//           setUserChillarId(chillarData.chillarId);
//         } catch (error) {
//           console.error('Failed to fetch user chillar:', error);
//         }
//       }
//     };

//     fetchUserChillar();
//   }, [isAdmin]);

//   // Load sales data
//   useEffect(() => {
//     const loadSalesData = async () => {
//       setLoading(true);
//       try {
//         const salesReportParams = {
//           startDate: dateRange.startDate,
//           endDate: dateRange.endDate,
//           ...(userChillarId && !isAdmin && { chillarId: userChillarId })
//         };

//         const salesReportData = await getSalesReport(salesReportParams);
//         setSalesData(salesReportData);
//       } catch (error) {
//         console.error('Failed to fetch sales data:', error);
//         setSalesData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isAdmin || userChillarId) {
//       loadSalesData();
//     }
//   }, [dateRange, userChillarId, isAdmin]);

//   // Calculate summary data
//   const salesSummary: SalesSummary = useMemo(() => {
//     const totalGrossSales = salesData.reduce((sum, sale) => sum + sale.grossLiters, 0);
//     const totalNetSales = salesData.reduce((sum, sale) => sum + sale.netLiters, 0);
//     const salesDifference = totalGrossSales - totalNetSales;
//     const totalAmount = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
//     const totalReceivedAmount = salesData.reduce((sum, sale) => sum + sale.amountReceived, 0);
//     const uniqueBuyers = new Set(salesData.map(sale => sale.accountId)).size;
//     const averageRate = salesData.length > 0 ?
//       salesData.reduce((sum, sale) => sum + sale.rate, 0) / salesData.length : 0;

//     return {
//       totalGrossSales,
//       totalNetSales,
//       salesDifference,
//       totalAmount,
//       totalTransactions: salesData.length,
//       averageRate,
//       uniqueBuyers,
//       totalReceivedAmount
//     };
//   }, [salesData]);

//   // Filter transactions
//   const filteredTransactions = useMemo(() => {
//     return salesData.filter(transaction =>
//       transaction.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transaction.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transaction.saleId.toString().includes(searchTerm.toLowerCase())
//     );
//   }, [salesData, searchTerm]);

//   // Pagination
//   const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

//   // Format currency as Pakistani Rupees
//   const formatPKR = (amount: number) => {
//     return new Intl.NumberFormat('en-PK', {
//       style: 'currency',
//       currency: 'PKR',
//       minimumFractionDigits: 2
//     }).format(amount);
//   };

//   const handleExportData = () => {
//     // Create CSV content
//     const headers = [
//       'Sale ID',
//       'Date',
//       'Account Code',
//       'Buyer Name',
//       'Chillar Name',
//       'Added By',
//       'Gross Liters',
//       'LR',
//       'Fat',
//       'Net Liters',
//       'Rate',
//       ...(isAdmin ? ['Total Amount', 'Received Amount', 'Balance'] : [])
//     ];

//     const csvContent = [
//       headers.join(','),
//       ...filteredTransactions.map(sale => [
//         sale.saleId,
//         sale.date,
//         sale.accountCode,
//         `"${sale.accountName}"`,
//         `"${sale.chillarName}"`,
//         `"${sale.addedByName}"`,
//         sale.grossLiters,
//         sale.lr,
//         sale.fat,
//         sale.netLiters,
//         sale.rate,
//         ...(isAdmin ? [sale.totalAmount, sale.amountReceived, sale.balance] : [])
//       ].join(','))
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   if (loading) {
//     return (
//       <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
//         <FieldStaffLayout role="chillarIncharge">
//           <div className="flex items-center justify-center min-h-screen">
//             <div className="text-center">
//               <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//               <p className="text-gray-600">Loading sales report...</p>
//             </div>
//           </div>
//         </FieldStaffLayout>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
//       <FieldStaffLayout role="chillarIncharge">
//         <div className="max-w-7xl mx-auto p-1 space-y-6">
//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <BackButton />
//               <div className="flex items-center gap-2">
//                 <ShoppingCart className="w-8 h-8 text-green-600" />
//                 <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
//               </div>
//             </div>
//             <button
//               onClick={handleExportData}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <SummaryCard
//               title="Total Gross Sales"
//               value={`${salesSummary.totalGrossSales.toFixed(2)}L`}
//               icon={<Milk className="w-6 h-6" />}
//               color="green"
//               subtitle={`${salesSummary.totalTransactions} transactions`}
//             />
//             <SummaryCard
//               title="Total Net Sales"
//               value={`${salesSummary.totalNetSales.toFixed(2)}L`}
//               icon={<Scale className="w-6 h-6" />}
//               color="blue"
//               subtitle={`Diff: ${salesSummary.salesDifference.toFixed(2)}L`}
//             />
//             {isAdmin && (
//               <>
//                 <SummaryCard
//                   title="Total Amount"
//                   value={formatPKR(salesSummary.totalAmount)}
//                   icon={<DollarSign className="w-6 h-6" />}
//                   color="purple"
//                   subtitle={`Avg: ${formatPKR(salesSummary.averageRate)}/L`}
//                 />
//                 <SummaryCard
//                   title="Total Received Amount"
//                   value={formatPKR(salesSummary.totalReceivedAmount)}
//                   icon={<TrendingUp className="w-6 h-6" />}
//                   color="yellow"
//                   subtitle={`${salesSummary.uniqueBuyers} unique buyers`}
//                 />
//               </>
//             )}
//             {!isAdmin && (
//               <SummaryCard
//                 title="Unique Buyers"
//                 value={salesSummary.uniqueBuyers.toString()}
//                 icon={<Users className="w-6 h-6" />}
//                 color="purple"
//                 subtitle={`Avg: ${formatPKR(salesSummary.averageRate)}/L`}
//               />
//             )}
//           </div>

//           {/* Filters */}
//           <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Date Range */}
//               <div className="flex flex-col sm:flex-row gap-4 flex-1">
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//                   <input
//                     type="date"
//                     value={dateRange.startDate}
//                     onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
//                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//                   <input
//                     type="date"
//                     value={dateRange.endDate}
//                     onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
//                     className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Search */}
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search by buyer, code, or sale ID..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Results Info */}
//               <div className="flex items-end">
//                 <div className="text-sm text-gray-600">
//                   Showing {filteredTransactions.length} results
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sales Table */}
//           <div className="bg-white rounded-xl shadow-sm">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Sales Transactions</h2>
//             </div>

//             <div className="overflow-x-auto">
//               <Table>
//                 <Table.Header>
//                   <Table.Row>
//                     <Table.Head>Date</Table.Head>
//                     <Table.Head>Buyer Details</Table.Head>
//                     <Table.Head>Chillar & Added By</Table.Head>
//                     <Table.Head>Gross Liters</Table.Head>
//                     <Table.Head>LR & Fat</Table.Head>
//                     <Table.Head>Net Liters</Table.Head>
//                     {isAdmin && (
//                       <>
//                         <Table.Head>Rate</Table.Head>
//                         <Table.Head>Total Amount</Table.Head>
//                         <Table.Head>Received Amount</Table.Head>
//                         <Table.Head>Balance</Table.Head>
//                       </>
//                     )}
//                     <Table.Head>Actions</Table.Head>
//                   </Table.Row>
//                 </Table.Header>
//                 <Table.Body>
//                   {paginatedTransactions.map((transaction) => (
//                     <Table.Row key={transaction.saleId}>
//                       <Table.Cell>
//                         <div className="font-medium text-gray-900">
//                           {new Date(transaction.date).toLocaleDateString('en-PK')}
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           <div className="font-medium text-gray-900">{transaction.accountName}</div>
//                           <div className="text-sm text-gray-500">{transaction.accountCode}</div>
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           <div className="text-sm font-medium text-gray-900">{transaction.chillarName}</div>
//                           <div className="text-xs text-gray-500">By: {transaction.addedByName}</div>
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <span className="font-medium text-green-600">{transaction.grossLiters.toFixed(2)}L</span>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           <div className="text-sm">LR: {transaction.lr.toFixed(2)}</div>
//                           <div className="text-sm">Fat: {transaction.fat.toFixed(2)}</div>
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <span className="font-medium text-blue-600">{transaction.netLiters.toFixed(2)}L</span>
//                       </Table.Cell>
//                       {isAdmin && (
//                         <>
//                           <Table.Cell>
//                             <span className="font-medium">{formatPKR(transaction.rate)}/L</span>
//                           </Table.Cell>
//                           <Table.Cell>
//                             <span className="font-bold text-purple-600">{formatPKR(transaction.totalAmount)}</span>
//                           </Table.Cell>
//                           <Table.Cell>
//                             <span className="font-medium text-green-600">{formatPKR(transaction.amountReceived)}</span>
//                           </Table.Cell>
//                           <Table.Cell>
//                             <span className="font-medium text-red-600">{formatPKR(transaction.balance)}</span>
//                           </Table.Cell>
//                         </>
//                       )}
//                       <Table.Cell>
//                         <div className="flex gap-2">
//                           <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
//                             <Eye className="w-4 h-4" />
//                           </button>
//                           <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
//                             <Receipt className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </Table.Cell>
//                     </Table.Row>
//                   ))}
//                 </Table.Body>
//               </Table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                 <div className="text-sm text-gray-700">
//                   Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Previous
//                   </button>

//                   {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                     const page = i + 1;
//                     const isActive = page === currentPage;
//                     return (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`px-3 py-2 text-sm border rounded-lg ${isActive
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'border-gray-300 hover:bg-gray-50'
//                           }`}
//                       >
//                         {page}
//                       </button>
//                     );
//                   })}

//                   <button
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </FieldStaffLayout>
//     </ProtectedRoute>
//   );
// }


'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Receipt,
  TrendingUp,
  Users,
  DollarSign,
  Milk,
  Scale,
  Filter
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import { getSalesReport, SalesRecord } from '@/lib/api/reports';
import { getMyChillar } from '@/lib/api/chillarReceive';
import { getChillars, Chillar } from '@/lib/api/chillar';

interface SalesSummary {
  totalGrossSales: number;
  totalNetSales: number;
  salesDifference: number;
  totalAmount: number;
  totalTransactions: number;
  averageRate: number;
  uniqueBuyers: number;
  totalReceivedAmount: number;
}

export default function SalesReport() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [userChillarId, setUserChillarId] = useState<number | null>(null);
  const [chillars, setChillars] = useState<Chillar[]>([]);
  const [selectedChillarId, setSelectedChillarId] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

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

  // Load sales data
  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        const salesReportParams = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          ...(isAdmin && selectedChillarId && { chillarId: selectedChillarId }),
          ...(!isAdmin && userChillarId && { chillarId: userChillarId })
        };

        const salesReportData = await getSalesReport(salesReportParams);
        setSalesData(salesReportData);
      } catch (error) {
        console.error('Failed to fetch sales data:', error);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || userChillarId) {
      loadSalesData();
    }
  }, [dateRange, userChillarId, isAdmin, selectedChillarId]);

  // Calculate summary data
  const salesSummary: SalesSummary = useMemo(() => {
    const totalGrossSales = salesData.reduce((sum, sale) => sum + sale.grossLiters, 0);
    const totalNetSales = salesData.reduce((sum, sale) => sum + sale.netLiters, 0);
    const salesDifference = totalGrossSales - totalNetSales;
    const totalAmount = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalReceivedAmount = salesData.reduce((sum, sale) => sum + sale.amountReceived, 0);
    const uniqueBuyers = new Set(salesData.map(sale => sale.accountId)).size;
    const averageRate = salesData.length > 0 ?
      salesData.reduce((sum, sale) => sum + sale.rate, 0) / salesData.length : 0;

    return {
      totalGrossSales,
      totalNetSales,
      salesDifference,
      totalAmount,
      totalTransactions: salesData.length,
      averageRate,
      uniqueBuyers,
      totalReceivedAmount
    };
  }, [salesData]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return salesData.filter(transaction =>
      transaction.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.saleId.toString().includes(searchTerm.toLowerCase())
    );
  }, [salesData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Format currency as Pakistani Rupees
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleExportData = () => {
    // Create CSV content
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

    const csvContent = [
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && salesData.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading sales report...</p>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      <DynamicLayout>
        <div className="max-w-7xl mx-auto p-1 sm:p-4 space-y-6">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard
              title="Total Gross Sales"
              value={`${salesSummary.totalGrossSales.toFixed(2)}L`}
              icon={<Milk className="w-6 h-6" />}
              color="green"
              subtitle={`${salesSummary.totalTransactions} transactions`}
            />
            <SummaryCard
              title="Total Net Sales"
              value={`${salesSummary.totalNetSales.toFixed(2)}L`}
              icon={<Scale className="w-6 h-6" />}
              color="blue"
              subtitle={`Diff: ${salesSummary.salesDifference.toFixed(2)}L`}
            />
            {isAdmin && (
              <>
                <SummaryCard
                  title="Total Amount"
                  value={formatPKR(salesSummary.totalAmount)}
                  icon={<DollarSign className="w-6 h-6" />}
                  color="purple"
                  subtitle={`Avg: ${formatPKR(salesSummary.averageRate)}/L`}
                />
                <SummaryCard
                  title="Received Amount"
                  value={formatPKR(salesSummary.totalReceivedAmount)}
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="yellow"
                  subtitle={`${salesSummary.uniqueBuyers} unique buyers`}
                />
              </>
            )}
            {!isAdmin && (
              <SummaryCard
                title="Unique Buyers"
                value={salesSummary.uniqueBuyers.toString()}
                icon={<Users className="w-6 h-6" />}
                color="purple"
                subtitle={`Avg: ${formatPKR(salesSummary.averageRate)}/L`}
              />
            )}
          </div>

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
              {/* Date Range */}
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

              {/* Chillar Selection - Only for Admin */}
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

              {/* Search */}
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

            {/* Advanced Filters - Collapsible */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> of <span className="font-semibold text-gray-900">{salesData.length}</span> results
                  {isAdmin && selectedChillarId && (
                    <span className="ml-2">
                      for <span className="font-semibold text-blue-600">{chillars.find(c => c.chillarId === selectedChillarId)?.name}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Sales Transactions</h2>
            </div>

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
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 7} className="text-center py-8">
                        <div className="text-gray-500">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No sales data found for the selected period</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((transaction) => (
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
                          <span className="font-medium text-green-600 text-sm">{transaction.grossLiters.toFixed(2)}L</span>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
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
                        className={`px-3 py-2 text-sm border rounded-lg ${
                          isActive
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
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}