// //app/reports/sales/page.tsx
// 'use client';
// import { useState, useEffect, useMemo } from 'react';
// import { 
//   ShoppingCart, 
//   Search, 
//   Calendar, 
//   Download,
//   RefreshCw,
//   Filter,
//   Eye,
//   Receipt,
//   TrendingUp,
//   Users,
//   DollarSign,
//   Clock,
//   ChevronDown
// } from 'lucide-react';
// import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import SummaryCard from '@/components/ui/SummaryCard';
// import { BackButton } from '@/components/ui/BackButton';
// import { Table } from '@/components/ui/Table/Table';

// // Types for sales data
// interface SaleTransaction {
//   id: string;
//   invoiceNo: string;
//   date: string;
//   time: string;
//   buyerName: string;
//   buyerCode: string;
//   quantity: number;
//   rate: number;
//   amount: number;
//   paymentStatus: 'paid' | 'pending' | 'partial';
//   paymentMethod?: 'cash' | 'credit' | 'bank';
//   dueAmount?: number;
//   remarks?: string;
//   createdBy: string;
// }

// interface SalesSummary {
//   totalSales: number;
//   totalAmount: number;
//   totalTransactions: number;
//   averageRate: number;
//   uniqueBuyers: number;
//   paidAmount: number;
//   pendingAmount: number;
// }

// export default function SalesReport() {
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'pending' | 'partial'>('all');
//   const [sortBy, setSortBy] = useState<'date' | 'amount' | 'quantity'>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Mock data - replace with actual API calls
//   const [salesData, setSalesData] = useState<{
//     summary: SalesSummary;
//     transactions: SaleTransaction[];
//   }>({
//     summary: {
//       totalSales: 2720,
//       totalAmount: 156240,
//       totalTransactions: 156,
//       averageRate: 57.43,
//       uniqueBuyers: 8,
//       paidAmount: 140850,
//       pendingAmount: 15390
//     },
//     transactions: [
//       {
//         id: '1',
//         invoiceNo: 'INV-2024-001',
//         date: '2024-01-15',
//         time: '08:15',
//         buyerName: 'City Dairy Shop',
//         buyerCode: 'CD001',
//         quantity: 50,
//         rate: 58,
//         amount: 2900,
//         paymentStatus: 'paid',
//         paymentMethod: 'cash',
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '2',
//         invoiceNo: 'INV-2024-002',
//         date: '2024-01-15',
//         time: '09:30',
//         buyerName: 'Local Tea Stall',
//         buyerCode: 'TS002',
//         quantity: 25,
//         rate: 57,
//         amount: 1425,
//         paymentStatus: 'pending',
//         dueAmount: 1425,
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '3',
//         invoiceNo: 'INV-2024-003',
//         date: '2024-01-15',
//         time: '10:45',
//         buyerName: 'Metro Restaurant',
//         buyerCode: 'MR003',
//         quantity: 75,
//         rate: 56,
//         amount: 4200,
//         paymentStatus: 'partial',
//         paymentMethod: 'bank',
//         dueAmount: 1200,
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '4',
//         invoiceNo: 'INV-2024-004',
//         date: '2024-01-14',
//         time: '07:20',
//         buyerName: 'Fresh Milk Corner',
//         buyerCode: 'FM004',
//         quantity: 40,
//         rate: 58,
//         amount: 2320,
//         paymentStatus: 'paid',
//         paymentMethod: 'cash',
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '5',
//         invoiceNo: 'INV-2024-005',
//         date: '2024-01-14',
//         time: '11:15',
//         buyerName: 'Sweet House',
//         buyerCode: 'SH005',
//         quantity: 30,
//         rate: 57,
//         amount: 1710,
//         paymentStatus: 'paid',
//         paymentMethod: 'bank',
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '6',
//         invoiceNo: 'INV-2024-006',
//         date: '2024-01-13',
//         time: '08:45',
//         buyerName: 'City Dairy Shop',
//         buyerCode: 'CD001',
//         quantity: 60,
//         rate: 58,
//         amount: 3480,
//         paymentStatus: 'pending',
//         dueAmount: 3480,
//         createdBy: 'Chillar Incharge'
//       },
//       {
//         id: '7',
//         invoiceNo: 'INV-2024-007',
//         date: '2024-01-13',
//         time: '14:30',
//         buyerName: 'Coffee Shop Plus',
//         buyerCode: 'CS007',
//         quantity: 20,
//         rate: 56,
//         amount: 1120,
//         paymentStatus: 'paid',
//         paymentMethod: 'cash',
//         createdBy: 'Chillar Incharge'
//       }
//     ]
//   });

//   useEffect(() => {
//     const loadSalesData = async () => {
//       setLoading(true);
//       // Replace with actual API calls based on dateRange
//       setTimeout(() => {
//         setLoading(false);
//       }, 1000);
//     };

//     loadSalesData();
//   }, [dateRange]);

//   // Filter and sort transactions
//   const filteredAndSortedTransactions = useMemo(() => {
//     let filtered = salesData.transactions.filter(transaction => {
//       const matchesSearch = 
//         transaction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         transaction.buyerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         transaction.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesPaymentStatus = paymentStatusFilter === 'all' || transaction.paymentStatus === paymentStatusFilter;

//       return matchesSearch && matchesPaymentStatus;
//     });

//     // Sort transactions
//     filtered.sort((a, b) => {
//       let aValue, bValue;

//       switch (sortBy) {
//         case 'date':
//           aValue = new Date(`${a.date} ${a.time}`).getTime();
//           bValue = new Date(`${b.date} ${b.time}`).getTime();
//           break;
//         case 'amount':
//           aValue = a.amount;
//           bValue = b.amount;
//           break;
//         case 'quantity':
//           aValue = a.quantity;
//           bValue = b.quantity;
//           break;
//         default:
//           aValue = new Date(`${a.date} ${a.time}`).getTime();
//           bValue = new Date(`${b.date} ${b.time}`).getTime();
//       }

//       return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
//     });

//     return filtered;
//   }, [salesData.transactions, searchTerm, paymentStatusFilter, sortBy, sortOrder]);

//   // Pagination
//   const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);

//   const handleExportData = () => {
//     // Implement export functionality
//     alert('Export functionality would be implemented here');
//   };

//   const getPaymentStatusBadge = (status: string, dueAmount?: number) => {
//     switch (status) {
//       case 'paid':
//         return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
//       case 'pending':
//         return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Pending</span>;
//       case 'partial':
//         return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Partial</span>;
//       default:
//         return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
//     }
//   };

//   if (loading) {
//     return (
//       <ProtectedRoute requiredRole="chillarincharge">
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
//     <ProtectedRoute requiredRole="chillarincharge">
//       <FieldStaffLayout role="chillarIncharge">
//         <div className="max-w-7xl mx-auto p-4 space-y-6">
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
//               title="Total Sales"
//               value={`${salesData.summary.totalSales}L`}
//               icon={<ShoppingCart className="w-6 h-6" />}
//               color="green"
//               subtitle={`${salesData.summary.totalTransactions} transactions`}
//             />
//             <SummaryCard
//               title="Total Amount"
//               value={`₹${salesData.summary.totalAmount.toLocaleString()}`}
//               icon={<DollarSign className="w-6 h-6" />}
//               color="blue"
//               subtitle={`Avg: ₹${salesData.summary.averageRate}/L`}
//             />
//             <SummaryCard
//               title="Paid Amount"
//               value={`₹${salesData.summary.paidAmount.toLocaleString()}`}
//               icon={<TrendingUp className="w-6 h-6" />}
//               color="purple"
//               subtitle={`${((salesData.summary.paidAmount / salesData.summary.totalAmount) * 100).toFixed(1)}% collected`}
//             />
//             <SummaryCard
//               title="Pending Amount"
//               value={`₹${salesData.summary.pendingAmount.toLocaleString()}`}
//               icon={<Clock className="w-6 h-6" />}
//               color="red"
//               subtitle={`${salesData.summary.uniqueBuyers} active buyers`}
//             />
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
//                     placeholder="Search by buyer, code, or invoice..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4">
//               {/* Payment Status Filter */}
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
//                 <select
//                   value={paymentStatusFilter}
//                   onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
//                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="paid">Paid</option>
//                   <option value="pending">Pending</option>
//                   <option value="partial">Partial</option>
//                 </select>
//               </div>

//               {/* Sort By */}
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
//                 <select
//                   value={`${sortBy}-${sortOrder}`}
//                   onChange={(e) => {
//                     const [field, order] = e.target.value.split('-');
//                     setSortBy(field as any);
//                     setSortOrder(order as any);
//                   }}
//                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="date-desc">Latest First</option>
//                   <option value="date-asc">Oldest First</option>
//                   <option value="amount-desc">Amount High to Low</option>
//                   <option value="amount-asc">Amount Low to High</option>
//                   <option value="quantity-desc">Quantity High to Low</option>
//                   <option value="quantity-asc">Quantity Low to High</option>
//                 </select>
//               </div>

//               {/* Results Info */}
//               <div className="flex items-end">
//                 <div className="text-sm text-gray-600">
//                   Showing {filteredAndSortedTransactions.length} results
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
//                     <Table.Head>Invoice No.</Table.Head>
//                     <Table.Head>Date & Time</Table.Head>
//                     <Table.Head>Buyer Details</Table.Head>
//                     <Table.Head>Quantity</Table.Head>
//                     <Table.Head>Rate</Table.Head>
//                     <Table.Head>Amount</Table.Head>
//                     <Table.Head>Payment Status</Table.Head>
//                     <Table.Head>Due Amount</Table.Head>
//                     <Table.Head>Actions</Table.Head>
//                   </Table.Row>
//                 </Table.Header>
//                 <Table.Body>
//                   {paginatedTransactions.map((transaction) => (
//                     <Table.Row key={transaction.id}>
//                       <Table.Cell>
//                         <div className="font-medium text-blue-600">{transaction.invoiceNo}</div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           <div className="font-medium text-gray-900">
//                             {new Date(transaction.date).toLocaleDateString('en-IN')}
//                           </div>
//                           <div className="text-sm text-gray-500">{transaction.time}</div>
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           <div className="font-medium text-gray-900">{transaction.buyerName}</div>
//                           <div className="text-sm text-gray-500">{transaction.buyerCode}</div>
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <span className="font-medium text-green-600">{transaction.quantity}L</span>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <span className="font-medium">₹{transaction.rate}/L</span>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <span className="font-bold text-purple-600">₹{transaction.amount.toLocaleString()}</span>
//                       </Table.Cell>
//                       <Table.Cell>
//                         <div className="space-y-1">
//                           {getPaymentStatusBadge(transaction.paymentStatus, transaction.dueAmount)}
//                           {transaction.paymentMethod && (
//                             <div className="text-xs text-gray-500 capitalize">{transaction.paymentMethod}</div>
//                           )}
//                         </div>
//                       </Table.Cell>
//                       <Table.Cell>
//                         {transaction.dueAmount ? (
//                           <span className="font-medium text-red-600">₹{transaction.dueAmount.toLocaleString()}</span>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </Table.Cell>
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
//                   Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} results
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
//                         className={`px-3 py-2 text-sm border rounded-lg ${
//                           isActive
//                             ? 'bg-blue-600 text-white border-blue-600'
//                             : 'border-gray-300 hover:bg-gray-50'
//                         }`}
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
//app/reports/sales/page.tsx
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
  Scale
} from 'lucide-react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';
import { getSalesReport, SalesRecord } from '@/lib/api/reports';
import { getMyChillar } from '@/lib/api/chillarReceive';

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
          ...(userChillarId && !isAdmin && { chillarId: userChillarId })
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
  }, [dateRange, userChillarId, isAdmin]);

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

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
        <FieldStaffLayout role="chillarIncharge">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading sales report...</p>
            </div>
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
      <FieldStaffLayout role="chillarIncharge">
        <div className="max-w-7xl mx-auto p-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  title="Total Received Amount"
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
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Date Range */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by buyer, code, or sale ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredTransactions.length} results
                </div>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Sales Transactions</h2>
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
                        <Table.Head>Received Amount</Table.Head>
                        <Table.Head>Balance</Table.Head>
                      </>
                    )}
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedTransactions.map((transaction) => (
                    <Table.Row key={transaction.saleId}>
                      <Table.Cell>
                        <div className="font-medium text-gray-900">
                          {new Date(transaction.date).toLocaleDateString('en-PK')}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{transaction.accountName}</div>
                          <div className="text-sm text-gray-500">{transaction.accountCode}</div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{transaction.chillarName}</div>
                          <div className="text-xs text-gray-500">By: {transaction.addedByName}</div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-green-600">{transaction.grossLiters.toFixed(2)}L</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <div className="text-sm">LR: {transaction.lr.toFixed(2)}</div>
                          <div className="text-sm">Fat: {transaction.fat.toFixed(2)}</div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-blue-600">{transaction.netLiters.toFixed(2)}L</span>
                      </Table.Cell>
                      {isAdmin && (
                        <>
                          <Table.Cell>
                            <span className="font-medium">{formatPKR(transaction.rate)}/L</span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-bold text-purple-600">{formatPKR(transaction.totalAmount)}</span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-medium text-green-600">{formatPKR(transaction.amountReceived)}</span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-medium text-red-600">{formatPKR(transaction.balance)}</span>
                          </Table.Cell>
                        </>
                      )}
                      <Table.Cell>
                        <div className="flex gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FieldStaffLayout>
    </ProtectedRoute>
  );
}