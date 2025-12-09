

// 'use client';
// import { useSearchParams } from 'next/navigation';
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//     Truck, Download, RefreshCw, Filter, Eye,
//     Users, Clock, Droplets
// } from 'lucide-react';
// import { DynamicLayout } from '@/components/layouts/DynamicLayout';
// import ProtectedRoute from '@/components/ProtectedRoutes';
// import SummaryCard from '@/components/ui/SummaryCard';
// import { BackButton } from '@/components/ui/BackButton';
// import { Table } from '@/components/ui/Table/Table';
// import { FullPageSpinner } from '@/components/ui/spinner';
// import { Select } from '@/components/ui/Select';
// import { getChillarReceiveRecords, ReceiveRecord, ChillarReportsParams } from '@/lib/api/reports';
// import { getEmployees, Employee } from '@/lib/api/employees';
// import { getMyChillar } from '@/lib/api/chillarReceive';
// import { getChillars, Chillar } from '@/lib/api/chillar';
// import { useAuth } from '@/lib/auth/AuthContext';

// // Types
// interface DisplayTransaction {
//     id: string;
//     receiptNo: string;
//     date: string;
//     time: string;
//     dodhiId: number;
//     dodhiName: string;
//     grossLiters: number;
//     netLiters: number;
//     fat: number;
//     lr: number;
// }

// interface ReceiveSummary {
//     totalGrossLiters: number;
//     totalNetLiters: number;
//     totalTransactions: number;
//     averageFat: number;
//     averageLr: number;
//     uniqueDodhis: number;
//     morningCollection: number;
//     eveningCollection: number;
// }

// interface UserChillar {
//     chillarId: number;
//     chillarInchargeId: number;
// }

// // Time filter options
// const TIME_OPTIONS = [
//     { value: '', label: 'All Day' },
//     { value: 'morning', label: 'Morning (5:00 - 11:59)' },
//     { value: 'evening', label: 'Evening (15:00 - 23:59)' }
// ];

// export default function ReceiveReport() {
//     const searchParams = useSearchParams();
//     // Date state
//     const [dateRange, setDateRange] = useState({
//         startDate: searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         endDate: searchParams.get('endDate') || new Date().toISOString().split('T')[0]
//     });

//     // Time filter - separate start and end time filters
//     const [timeFilter, setTimeFilter] = useState({
//         startTime: '' as '' | 'morning' | 'evening',
//         endTime: '' as '' | 'morning' | 'evening'
//     });

//     // Data state
//     const [employees, setEmployees] = useState<Employee[]>([]);
//     const [receiveRecords, setReceiveRecords] = useState<ReceiveRecord[]>([]);
//     const [userChillar, setUserChillar] = useState<UserChillar | null>(null);
//     const [chillars, setChillars] = useState<Chillar[]>([]);

//     // Admin handling
//     const { user } = useAuth();
//     const isAdmin = user?.role === 'admin';

//     const [loading, setLoading] = useState({
//         employees: false,
//         records: false,
//         chillar: false
//     });
//     const [error, setError] = useState<string | null>(null);

//     // Filter state
//     const [filters, setFilters] = useState({
//         dodhi: '',
//         showFilters: false
//     });

//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;

//     // Load user's chillar info on mount
//     useEffect(() => {
//         const loadUserChillar = async () => {
//             const paramChillarId = searchParams.get('chillarId');

//             if (isAdmin) {
//                 // If admin, fetch all chillars for dropdown
//                 try {
//                     const chillarData = await getChillars();
//                     setChillars(chillarData);

//                     if (paramChillarId) {
//                         setUserChillar({
//                             chillarId: parseInt(paramChillarId),
//                             chillarInchargeId: 0
//                         });
//                     }
//                 } catch (error) {
//                     console.error('Failed to fetch chillars:', error);
//                 }
//                 return;
//             }

//             if (paramChillarId) {
//                 // Should not happen for non-admin typically, but handle as fallback
//                 setUserChillar({
//                     chillarId: parseInt(paramChillarId),
//                     chillarInchargeId: 0
//                 });
//                 return;
//             }

//             try {
//                 setLoading(prev => ({ ...prev, chillar: true }));
//                 const data = await getMyChillar();
//                 setUserChillar(data);
//             } catch (error) {
//                 console.error('Failed to load user chillar:', error);
//                 setError('Failed to load user information');
//             } finally {
//                 setLoading(prev => ({ ...prev, chillar: false }));
//             }
//         };
//         loadUserChillar();
//     }, [searchParams, isAdmin]);

//     // Load employees once on mount
//     useEffect(() => {
//         const loadEmployees = async () => {
//             try {
//                 setLoading(prev => ({ ...prev, employees: true }));
//                 const data = await getEmployees();
//                 setEmployees(data.filter(emp => emp.isActive));
//                 console.log('Employees loaded:', data.length);
//             } catch (error) {
//                 console.error('Failed to load employees:', error);
//                 setError('Failed to load employees');
//             } finally {
//                 setLoading(prev => ({ ...prev, employees: false }));
//             }
//         };
//         loadEmployees();
//     }, []);

//     // Helper function to convert time filter to time string
//     const getTimeString = (timeFilter: 'morning' | 'evening' | '') => {
//         switch (timeFilter) {
//             case 'morning':
//                 return '05:00';
//             case 'evening':
//                 return '15:00';
//             default:
//                 return '';
//         }
//     };

//     const getEndTimeString = (timeFilter: 'morning' | 'evening' | '') => {
//         switch (timeFilter) {
//             case 'morning':
//                 return '11:59';
//             case 'evening':
//                 return '23:59';
//             default:
//                 return '';
//         }
//     };

//     // Load receive data when filters change
//     const loadReceiveData = useCallback(async () => {
//         if (!userChillar) {
//             console.log('User chillar not loaded yet, skipping data load');
//             return;
//         }

//         try {
//             setLoading(prev => ({ ...prev, records: true }));
//             setError(null);
//             console.log('Loading receive data with params:', {
//                 dateRange,
//                 timeFilter,
//                 filters,
//                 userChillar
//             });

//             // Prepare time parameters based on filter selection
//             let timeParams: { startTimeOfDay?: string; endTimeOfDay?: string } = {};

//             // Set start time if selected
//             if (timeFilter.startTime) {
//                 timeParams.startTimeOfDay = getTimeString(timeFilter.startTime);
//             }

//             // Set end time if selected
//             if (timeFilter.endTime) {
//                 timeParams.endTimeOfDay = getEndTimeString(timeFilter.endTime);
//             }

//             const params: ChillarReportsParams = {
//                 startDate: dateRange.startDate,
//                 endDate: dateRange.endDate,
//                 chillarId: userChillar.chillarId,
//                 chillarInchargeId: userChillar.chillarInchargeId,
//                 ...timeParams,
//                 // Only add dodhiId if a specific dodhi is selected (not empty string)
//                 ...(filters.dodhi !== '' && { dodhiId: parseInt(filters.dodhi) })
//             };

//             console.log('API call params:', params);
//             const records = await getChillarReceiveRecords(params);
//             console.log('Received records:', records);
//             setReceiveRecords(records || []);
//             setCurrentPage(1); // Reset pagination
//         } catch (error) {
//             console.error('Failed to load records:', error);
//             setError('Failed to load receive records. Please check your connection and try again.');
//             setReceiveRecords([]);
//         } finally {
//             setLoading(prev => ({ ...prev, records: false }));
//         }
//     }, [dateRange.startDate, dateRange.endDate, timeFilter.startTime, timeFilter.endTime, filters.dodhi, userChillar]);

//     // Load data when dependencies change
//     useEffect(() => {
//         if (userChillar) {
//             console.log('Dependencies changed, loading data...');
//             loadReceiveData();
//         }
//     }, [loadReceiveData]);

//     // Transform records to display format
//     const displayTransactions = useMemo((): DisplayTransaction[] => {
//         console.log('Transforming records:', receiveRecords.length);
//         return receiveRecords.map((record) => ({
//             id: record.receiveId.toString(),
//             receiptNo: `REC-${record.receiveId}`,
//             date: record.date,
//             time: record.timeOfDay,
//             dodhiId: record.dodhiID,
//             dodhiName: record.dodhiName,
//             grossLiters: record.grossLiters,
//             netLiters: record.netLiters,
//             fat: record.fat,
//             lr: record.lr
//         }));
//     }, [receiveRecords]);

//     // Calculate summary
//     const summary = useMemo((): ReceiveSummary => {
//         console.log('Calculating summary for', receiveRecords.length, 'records');
//         if (receiveRecords.length === 0) {
//             return {
//                 totalGrossLiters: 0,
//                 totalNetLiters: 0,
//                 totalTransactions: 0,
//                 averageFat: 0,
//                 averageLr: 0,
//                 uniqueDodhis: 0,
//                 morningCollection: 0,
//                 eveningCollection: 0
//             };
//         }

//         const totalGrossLiters = receiveRecords.reduce((sum, record) => sum + record.grossLiters, 0);
//         const totalNetLiters = receiveRecords.reduce((sum, record) => sum + record.netLiters, 0);
//         const totalTransactions = receiveRecords.length;
//         const averageFat = receiveRecords.reduce((sum, record) => sum + record.fat, 0) / totalTransactions;
//         const averageLr = receiveRecords.reduce((sum, record) => sum + record.lr, 0) / totalTransactions;
//         const uniqueDodhis = new Set(receiveRecords.map(record => record.dodhiID)).size;

//         const morningCollection = receiveRecords
//             .filter(record => {
//                 const time = record.timeOfDay;
//                 const hour = parseInt(time.split(':')[0]);
//                 // Morning: 5 AM to 11:59 AM
//                 return hour >= 5 && hour < 12;
//             })
//             .reduce((sum, record) => sum + record.grossLiters, 0);

//         const eveningCollection = receiveRecords
//             .filter(record => {
//                 const time = record.timeOfDay;
//                 const hour = parseInt(time.split(':')[0]);
//                 // Evening: 3 PM to 11:59 PM
//                 return hour >= 15 && hour <= 23;
//             })
//             .reduce((sum, record) => sum + record.grossLiters, 0);

//         const calculatedSummary = {
//             totalGrossLiters,
//             totalNetLiters,
//             totalTransactions,
//             averageFat: Number(averageFat.toFixed(2)),
//             averageLr: Number(averageLr.toFixed(2)),
//             uniqueDodhis,
//             morningCollection,
//             eveningCollection
//         };

//         console.log('Summary calculated:', calculatedSummary);
//         return calculatedSummary;
//     }, [receiveRecords]);

//     // Filter and paginate transactions
//     const { filteredTransactions, paginatedTransactions, totalPages } = useMemo(() => {
//         let filtered = displayTransactions.filter(record => {
//             if (filters.dodhi && record.dodhiId.toString() !== filters.dodhi) {
//                 return false;
//             }
//             return true;
//         }).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

//         const totalPages = Math.ceil(filtered.length / itemsPerPage);
//         const startIndex = (currentPage - 1) * itemsPerPage;
//         const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

//         return { filteredTransactions: filtered, paginatedTransactions: paginated, totalPages };
//     }, [displayTransactions, filters, currentPage]);

//     // Event handlers
//     const handleFilterChange = (key: string, value: string) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//         setCurrentPage(1);
//     };

//     const handleTimeFilterChange = (type: 'startTime' | 'endTime', value: '' | 'morning' | 'evening') => {
//         setTimeFilter(prev => ({ ...prev, [type]: value }));
//         setCurrentPage(1);
//     };

//     const clearFilters = () => {
//         setFilters(prev => ({ ...prev, search: '', dodhi: '' }));
//         setTimeFilter({ startTime: '', endTime: '' });
//         setCurrentPage(1);
//     };

//     // Show loading while essential data is loading
//     if (loading.chillar || (loading.employees && employees.length === 0)) {
//         return (
//             <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
//                 <DynamicLayout>
//                     <FullPageSpinner message="Loading receive report..." />
//                 </DynamicLayout>
//             </ProtectedRoute>
//         );
//     }

//     return (
//         <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
//             <DynamicLayout>
//                 <div className="max-w-7xl mx-auto p-1 space-y-6">
//                     {/* Header */}
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                         <div className="flex items-center gap-4">
//                             <BackButton />
//                             <div className="flex items-center gap-2">
//                                 <Truck className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
//                                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receive Report</h1>
//                             </div>
//                         </div>

//                         {isAdmin && (
//                             <div className="w-full sm:w-72">
//                                 <Select
//                                     value={userChillar?.chillarId?.toString() || ''}
//                                     onChange={(value) => {
//                                         const id = parseInt(value);
//                                         setUserChillar({ chillarId: id, chillarInchargeId: 0 });
//                                     }}
//                                     options={[
//                                         { value: '', label: 'Select Chillar' },
//                                         ...chillars.map(c => ({
//                                             value: c.chillarId.toString(),
//                                             label: c.location
//                                         }))
//                                     ]}
//                                 />
//                             </div>
//                         )}

//                         <div className="flex gap-2 w-full sm:w-auto">
//                             <button
//                                 onClick={loadReceiveData}
//                                 disabled={loading.records}
//                                 className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
//                             >
//                                 <RefreshCw className={`w-4 h-4 ${loading.records ? 'animate-spin' : ''}`} />
//                                 <span className="hidden sm:inline">Refresh</span>
//                             </button>
//                             <button
//                                 onClick={() => handleFilterChange('showFilters', (!filters.showFilters).toString())}
//                                 className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
//                             >
//                                 <Filter className="w-4 h-4" />
//                                 Filters
//                             </button>
//                             <button
//                                 onClick={() => alert('Export functionality would be implemented here')}
//                                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                             >
//                                 <Download className="w-4 h-4" />
//                                 <span className="hidden sm:inline">Export</span>
//                             </button>
//                         </div>
//                     </div>

//                     {/* Error Display */}
//                     {error && (
//                         <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                             <div className="flex items-center gap-2">
//                                 <span className="text-red-600">⚠️</span>
//                                 <p className="text-red-800 font-medium">Error: {error}</p>
//                             </div>
//                             <button
//                                 onClick={() => { setError(null); loadReceiveData(); }}
//                                 className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
//                             >
//                                 Try Again
//                             </button>
//                         </div>
//                     )}

//                     {/* Loading indicator */}
//                     {loading.records && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//                             <div className="flex items-center gap-2">
//                                 <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
//                                 <p className="text-blue-800 font-medium">Loading receive records...</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Summary Cards */}
//                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
//                         <SummaryCard
//                             title="Total Received"
//                             value={`${summary.totalGrossLiters.toFixed(1)}L`}
//                             icon={<Truck className="w-5 h-5 sm:w-6 sm:h-6" />}
//                             color="blue"
//                             subtitle={`${summary.totalTransactions} receipts`}
//                         />
//                         <SummaryCard
//                             title="Avg LR"
//                             value={`${summary.averageLr.toFixed(2)}`}
//                             icon={<Droplets className="w-5 h-5 sm:w-6 sm:h-6" />}
//                             color="purple"
//                             subtitle={`Fat: ${summary.averageFat.toFixed(2)}%`}
//                         />
//                         <SummaryCard
//                             title="Active Dodhis"
//                             value={`${summary.uniqueDodhis}`}
//                             icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
//                             color="yellow"
//                             subtitle="Contributors"
//                         />
//                     </div>



//                     {/* Filters */}
//                     <div className={`bg-white rounded-xl shadow-sm transition-all duration-300 ${filters.showFilters || (typeof window !== 'undefined' && window.innerWidth >= 640) ? 'block' : 'hidden'
//                         }`}>
//                         <div className="p-4 sm:p-6 space-y-4">
//                             {/* Date range */}
//                             <div className="grid sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//                                     <input
//                                         type="date"
//                                         value={dateRange.startDate}
//                                         onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
//                                         className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//                                     <input
//                                         type="date"
//                                         value={dateRange.endDate}
//                                         onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
//                                         className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Time filters */}
//                             <div className="grid sm:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Start Time Filter</label>
//                                     <select
//                                         value={timeFilter.startTime}
//                                         onChange={(e) => handleTimeFilterChange('startTime', e.target.value as '' | 'morning' | 'evening')}
//                                         className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     >
//                                         {TIME_OPTIONS.map(option => (
//                                             <option key={`start-${option.value}`} value={option.value}>
//                                                 {option.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">End Time Filter</label>
//                                     <select
//                                         value={timeFilter.endTime}
//                                         onChange={(e) => handleTimeFilterChange('endTime', e.target.value as '' | 'morning' | 'evening')}
//                                         className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     >
//                                         {TIME_OPTIONS.map(option => (
//                                             <option key={`end-${option.value}`} value={option.value}>
//                                                 {option.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Search and dodhi filter */}
//                             <div className="grid sm:grid-cols-2 gap-4">

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi</label>
//                                     <select
//                                         value={filters.dodhi}
//                                         onChange={(e) => handleFilterChange('dodhi', e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     >
//                                         <option value="">All Employees</option>
//                                         {employees.map(emp => (
//                                             <option key={emp.employeeId} value={emp.employeeId.toString()}>
//                                                 {emp.fullName} ({emp.designation})
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="flex justify-between items-center pt-2">
//                                 <div className="text-sm text-gray-600">
//                                     Showing {filteredTransactions.length} results
//                                 </div>
//                                 <button
//                                     onClick={clearFilters}
//                                     className="text-sm text-blue-600 hover:text-blue-800"
//                                 >
//                                     Clear Filters
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Transactions Table */}
//                     <div className="bg-white rounded-xl shadow-sm">
//                         <div className="p-4 sm:p-6 border-b border-gray-200">
//                             <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Milk Collection Records</h2>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <Table>
//                                 <Table.Header>
//                                     <Table.Row>
//                                         <Table.Head>Date & Time</Table.Head>
//                                         <Table.Head>Dodhi Details</Table.Head>
//                                         <Table.Head>Gross Ltrs</Table.Head>
//                                         <Table.Head>LR</Table.Head>
//                                         <Table.Head>Fat %</Table.Head>
//                                         <Table.Head>Net Ltrs</Table.Head>
//                                         <Table.Head className="hidden sm:table-cell">Actions</Table.Head>
//                                     </Table.Row>
//                                 </Table.Header>
//                                 <Table.Body>
//                                     {paginatedTransactions.length === 0 ? (
//                                         <Table.Row>
//                                             <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
//                                                 {loading.records ? 'Loading records...' : 'No records found for the selected criteria'}
//                                             </Table.Cell>
//                                         </Table.Row>
//                                     ) : (
//                                         paginatedTransactions.map((transaction) => (
//                                             <Table.Row key={transaction.id}>
//                                                 <Table.Cell>
//                                                     <div>
//                                                         <div className="font-medium">{transaction.date}</div>
//                                                         <div className="text-sm text-gray-500">{transaction.time}</div>
//                                                     </div>
//                                                 </Table.Cell>
//                                                 <Table.Cell>
//                                                     <div>
//                                                         <div className="font-medium">{transaction.dodhiName}</div>
//                                                         <div className="text-sm text-gray-500">ID: {transaction.dodhiId}</div>
//                                                     </div>
//                                                 </Table.Cell>
//                                                 <Table.Cell>
//                                                     <span className="font-bold text-green-600">{transaction.grossLiters.toFixed(1)}L</span>
//                                                 </Table.Cell>
//                                                 <Table.Cell>
//                                                     <span className="text-purple-600">{transaction.lr.toFixed(2)}</span>
//                                                 </Table.Cell>
//                                                 <Table.Cell>
//                                                     <span className="text-orange-600">{transaction.fat.toFixed(2)}%</span>
//                                                 </Table.Cell>
//                                                 <Table.Cell>
//                                                     <span className="font-medium text-blue-600">{transaction.netLiters.toFixed(1)}L</span>
//                                                 </Table.Cell>

//                                                 <Table.Cell className="hidden sm:table-cell">
//                                                     <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
//                                                         <Eye className="w-4 h-4" />
//                                                     </button>
//                                                 </Table.Cell>
//                                             </Table.Row>
//                                         ))
//                                     )}
//                                 </Table.Body>
//                             </Table>
//                         </div>

//                         {/* Summary Row */}
//                         {paginatedTransactions.length > 0 && (
//                             <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
//                                 <div className="flex justify-between items-center text-sm">
//                                     <span className="font-medium text-gray-700">
//                                         Total on this page:
//                                     </span>
//                                     <span className="font-bold text-green-600">
//                                         {paginatedTransactions.reduce((sum, t) => sum + t.grossLiters, 0).toFixed(1)}L Gross
//                                     </span>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Pagination */}
//                         {totalPages > 1 && (
//                             <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
//                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                                     <div className="text-sm text-gray-700 text-center sm:text-left">
//                                         Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
//                                     </div>
//                                     <div className="flex justify-center gap-2">
//                                         <button
//                                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                                             disabled={currentPage === 1}
//                                             className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//                                         >
//                                             Previous
//                                         </button>

//                                         {[...Array(Math.min(5, totalPages))].map((_, i) => {
//                                             const page = i + 1;
//                                             return (
//                                                 <button
//                                                     key={page}
//                                                     onClick={() => setCurrentPage(page)}
//                                                     className={`px-3 py-2 text-sm border rounded-lg ${page === currentPage
//                                                         ? 'bg-blue-600 text-white border-blue-600'
//                                                         : 'border-gray-300 hover:bg-gray-50'
//                                                         }`}
//                                                 >
//                                                     {page}
//                                                 </button>
//                                             );
//                                         })}

//                                         <button
//                                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                                             disabled={currentPage === totalPages}
//                                             className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//                                         >
//                                             Next
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </DynamicLayout>
//         </ProtectedRoute>
//     );
// }

'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import {
    Truck, Download, RefreshCw, Filter, Eye,
    Users, Clock, Droplets
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';
import { FullPageSpinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/Select';
import { getChillarReceiveRecords, ReceiveRecord, ChillarReportsParams } from '@/lib/api/reports';
import { getEmployees, Employee } from '@/lib/api/employees';
import { getMyChillar } from '@/lib/api/chillarReceive';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { useAuth } from '@/lib/auth/AuthContext';

// Types
interface DisplayTransaction {
    id: string;
    receiptNo: string;
    date: string;
    time: string;
    dodhiId: number;
    dodhiName: string;
    grossLiters: number;
    netLiters: number;
    fat: number;
    lr: number;
}

interface ReceiveSummary {
    totalGrossLiters: number;
    totalNetLiters: number;
    totalTransactions: number;
    averageFat: number;
    averageLr: number;
    uniqueDodhis: number;
    morningCollection: number;
    eveningCollection: number;
}

interface UserChillar {
    chillarId: number;
    chillarInchargeId: number;
}

// Time filter options
const TIME_OPTIONS = [
    { value: '', label: 'All Day' },
    { value: 'morning', label: 'Morning (5:00 - 11:59)' },
    { value: 'evening', label: 'Evening (15:00 - 23:59)' }
];

// Separate the main content into its own component
function ReceiveReportContent() {
    const searchParams = useSearchParams();

    // Date state
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    });

    // Time filter - separate start and end time filters
    const [timeFilter, setTimeFilter] = useState({
        startTime: '' as '' | 'morning' | 'evening',
        endTime: '' as '' | 'morning' | 'evening'
    });

    // Data state
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [receiveRecords, setReceiveRecords] = useState<ReceiveRecord[]>([]);
    const [userChillar, setUserChillar] = useState<UserChillar | null>(null);
    const [chillars, setChillars] = useState<Chillar[]>([]);

    // Admin handling
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [loading, setLoading] = useState({
        employees: false,
        records: false,
        chillar: false
    });
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [filters, setFilters] = useState({
        dodhi: '',
        showFilters: false
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Load user's chillar info on mount
    useEffect(() => {
        const loadUserChillar = async () => {
            const paramChillarId = searchParams.get('chillarId');

            if (isAdmin) {
                // If admin, fetch all chillars for dropdown
                try {
                    const chillarData = await getChillars();
                    setChillars(chillarData);

                    if (paramChillarId) {
                        setUserChillar({
                            chillarId: parseInt(paramChillarId),
                            chillarInchargeId: 0
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch chillars:', error);
                }
                return;
            }

            if (paramChillarId) {
                // Should not happen for non-admin typically, but handle as fallback
                setUserChillar({
                    chillarId: parseInt(paramChillarId),
                    chillarInchargeId: 0
                });
                return;
            }

            try {
                setLoading(prev => ({ ...prev, chillar: true }));
                const data = await getMyChillar();
                setUserChillar(data);
            } catch (error) {
                console.error('Failed to load user chillar:', error);
                setError('Failed to load user information');
            } finally {
                setLoading(prev => ({ ...prev, chillar: false }));
            }
        };
        loadUserChillar();
    }, [searchParams, isAdmin]);

    // Load employees once on mount
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                setLoading(prev => ({ ...prev, employees: true }));
                const data = await getEmployees();
                setEmployees(data.filter(emp => emp.isActive));
                console.log('Employees loaded:', data.length);
            } catch (error) {
                console.error('Failed to load employees:', error);
                setError('Failed to load employees');
            } finally {
                setLoading(prev => ({ ...prev, employees: false }));
            }
        };
        loadEmployees();
    }, []);

    // Helper function to convert time filter to time string
    const getTimeString = (timeFilter: 'morning' | 'evening' | '') => {
        switch (timeFilter) {
            case 'morning':
                return '05:00';
            case 'evening':
                return '15:00';
            default:
                return '';
        }
    };

    const getEndTimeString = (timeFilter: 'morning' | 'evening' | '') => {
        switch (timeFilter) {
            case 'morning':
                return '11:59';
            case 'evening':
                return '23:59';
            default:
                return '';
        }
    };

    // Load receive data when filters change
    const loadReceiveData = useCallback(async () => {
        if (!userChillar) {
            console.log('User chillar not loaded yet, skipping data load');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, records: true }));
            setError(null);
            console.log('Loading receive data with params:', {
                dateRange,
                timeFilter,
                filters,
                userChillar
            });

            // Prepare time parameters based on filter selection
            let timeParams: { startTimeOfDay?: string; endTimeOfDay?: string } = {};

            // Set start time if selected
            if (timeFilter.startTime) {
                timeParams.startTimeOfDay = getTimeString(timeFilter.startTime);
            }

            // Set end time if selected
            if (timeFilter.endTime) {
                timeParams.endTimeOfDay = getEndTimeString(timeFilter.endTime);
            }

            const params: ChillarReportsParams = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                chillarId: userChillar.chillarId,
                chillarInchargeId: userChillar.chillarInchargeId,
                ...timeParams,
                // Only add dodhiId if a specific dodhi is selected (not empty string)
                ...(filters.dodhi !== '' && { dodhiId: parseInt(filters.dodhi) })
            };

            console.log('API call params:', params);
            const records = await getChillarReceiveRecords(params);
            console.log('Received records:', records);
            setReceiveRecords(records || []);
            setCurrentPage(1); // Reset pagination
        } catch (error) {
            console.error('Failed to load records:', error);
            setError('Failed to load receive records. Please check your connection and try again.');
            setReceiveRecords([]);
        } finally {
            setLoading(prev => ({ ...prev, records: false }));
        }
    }, [dateRange.startDate, dateRange.endDate, timeFilter.startTime, timeFilter.endTime, filters.dodhi, userChillar]);

    // Load data when dependencies change
    useEffect(() => {
        if (userChillar) {
            console.log('Dependencies changed, loading data...');
            loadReceiveData();
        }
    }, [loadReceiveData]);

    // Transform records to display format
    const displayTransactions = useMemo((): DisplayTransaction[] => {
        console.log('Transforming records:', receiveRecords.length);
        return receiveRecords.map((record) => ({
            id: record.receiveId.toString(),
            receiptNo: `REC-${record.receiveId}`,
            date: record.date,
            time: record.timeOfDay,
            dodhiId: record.dodhiID,
            dodhiName: record.dodhiName,
            grossLiters: record.grossLiters,
            netLiters: record.netLiters,
            fat: record.fat,
            lr: record.lr
        }));
    }, [receiveRecords]);

    // Calculate summary
    const summary = useMemo((): ReceiveSummary => {
        console.log('Calculating summary for', receiveRecords.length, 'records');
        if (receiveRecords.length === 0) {
            return {
                totalGrossLiters: 0,
                totalNetLiters: 0,
                totalTransactions: 0,
                averageFat: 0,
                averageLr: 0,
                uniqueDodhis: 0,
                morningCollection: 0,
                eveningCollection: 0
            };
        }

        const totalGrossLiters = receiveRecords.reduce((sum, record) => sum + record.grossLiters, 0);
        const totalNetLiters = receiveRecords.reduce((sum, record) => sum + record.netLiters, 0);
        const totalTransactions = receiveRecords.length;
        const averageFat = receiveRecords.reduce((sum, record) => sum + record.fat, 0) / totalTransactions;
        const averageLr = receiveRecords.reduce((sum, record) => sum + record.lr, 0) / totalTransactions;
        const uniqueDodhis = new Set(receiveRecords.map(record => record.dodhiID)).size;

        const morningCollection = receiveRecords
            .filter(record => {
                const time = record.timeOfDay;
                const hour = parseInt(time.split(':')[0]);
                // Morning: 5 AM to 11:59 AM
                return hour >= 5 && hour < 12;
            })
            .reduce((sum, record) => sum + record.grossLiters, 0);

        const eveningCollection = receiveRecords
            .filter(record => {
                const time = record.timeOfDay;
                const hour = parseInt(time.split(':')[0]);
                // Evening: 3 PM to 11:59 PM
                return hour >= 15 && hour <= 23;
            })
            .reduce((sum, record) => sum + record.grossLiters, 0);

        const calculatedSummary = {
            totalGrossLiters,
            totalNetLiters,
            totalTransactions,
            averageFat: Number(averageFat.toFixed(2)),
            averageLr: Number(averageLr.toFixed(2)),
            uniqueDodhis,
            morningCollection,
            eveningCollection
        };

        console.log('Summary calculated:', calculatedSummary);
        return calculatedSummary;
    }, [receiveRecords]);

    // Filter and paginate transactions
    const { filteredTransactions, paginatedTransactions, totalPages } = useMemo(() => {
        let filtered = displayTransactions.filter(record => {
            if (filters.dodhi && record.dodhiId.toString() !== filters.dodhi) {
                return false;
            }
            return true;
        }).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

        return { filteredTransactions: filtered, paginatedTransactions: paginated, totalPages };
    }, [displayTransactions, filters, currentPage]);

    // Event handlers
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleTimeFilterChange = (type: 'startTime' | 'endTime', value: '' | 'morning' | 'evening') => {
        setTimeFilter(prev => ({ ...prev, [type]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters(prev => ({ ...prev, search: '', dodhi: '' }));
        setTimeFilter({ startTime: '', endTime: '' });
        setCurrentPage(1);
    };

    // Show loading while essential data is loading
    if (loading.chillar || (loading.employees && employees.length === 0)) {
        return <FullPageSpinner message="Loading receive report..." />;
    }

    return (
        <div className="max-w-7xl mx-auto p-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="flex items-center gap-2">
                        <Truck className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receive Report</h1>
                    </div>
                </div>

                {isAdmin && (
                    <div className="w-full sm:w-72">
                        <Select
                            value={userChillar?.chillarId?.toString() || ''}
                            onChange={(value) => {
                                const id = parseInt(value);
                                setUserChillar({ chillarId: id, chillarInchargeId: 0 });
                            }}
                            options={[
                                { value: '', label: 'Select Chillar' },
                                ...chillars.map(c => ({
                                    value: c.chillarId.toString(),
                                    label: c.location
                                }))
                            ]}
                        />
                    </div>
                )}

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={loadReceiveData}
                        disabled={loading.records}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading.records ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={() => handleFilterChange('showFilters', (!filters.showFilters).toString())}
                        className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={() => alert('Export functionality would be implemented here')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-red-600">⚠️</span>
                        <p className="text-red-800 font-medium">Error: {error}</p>
                    </div>
                    <button
                        onClick={() => { setError(null); loadReceiveData(); }}
                        className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Loading indicator */}
            {loading.records && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                        <p className="text-blue-800 font-medium">Loading receive records...</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <SummaryCard
                    title="Total Received"
                    value={`${summary.totalGrossLiters.toFixed(1)}L`}
                    icon={<Truck className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="blue"
                    subtitle={`${summary.totalTransactions} receipts`}
                />
                <SummaryCard
                    title="Avg LR"
                    value={`${summary.averageLr.toFixed(2)}`}
                    icon={<Droplets className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="purple"
                    subtitle={`Fat: ${summary.averageFat.toFixed(2)}%`}
                />
                <SummaryCard
                    title="Active Dodhis"
                    value={`${summary.uniqueDodhis}`}
                    icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                    color="yellow"
                    subtitle="Contributors"
                />
            </div>

            {/* Filters */}
            <div className={`bg-white rounded-xl shadow-sm transition-all duration-300 ${filters.showFilters || (typeof window !== 'undefined' && window.innerWidth >= 640) ? 'block' : 'hidden'
                }`}>
                <div className="p-4 sm:p-6 space-y-4">
                    {/* Date range */}
                    <div className="grid sm:grid-cols-2 gap-4">
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
                    </div>

                    {/* Time filters */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time Filter</label>
                            <select
                                value={timeFilter.startTime}
                                onChange={(e) => handleTimeFilterChange('startTime', e.target.value as '' | 'morning' | 'evening')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {TIME_OPTIONS.map(option => (
                                    <option key={`start-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time Filter</label>
                            <select
                                value={timeFilter.endTime}
                                onChange={(e) => handleTimeFilterChange('endTime', e.target.value as '' | 'morning' | 'evening')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {TIME_OPTIONS.map(option => (
                                    <option key={`end-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search and dodhi filter */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi</label>
                            <select
                                value={filters.dodhi}
                                onChange={(e) => handleFilterChange('dodhi', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp.employeeId} value={emp.employeeId.toString()}>
                                        {emp.fullName} ({emp.designation})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="text-sm text-gray-600">
                            Showing {filteredTransactions.length} results
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Milk Collection Records</h2>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Date & Time</Table.Head>
                                <Table.Head>Dodhi Details</Table.Head>
                                <Table.Head>Gross Ltrs</Table.Head>
                                <Table.Head>LR</Table.Head>
                                <Table.Head>Fat %</Table.Head>
                                <Table.Head>Net Ltrs</Table.Head>
                                <Table.Head className="hidden sm:table-cell">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {paginatedTransactions.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                                        {loading.records ? 'Loading records...' : 'No records found for the selected criteria'}
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                paginatedTransactions.map((transaction) => (
                                    <Table.Row key={transaction.id}>
                                        <Table.Cell>
                                            <div>
                                                <div className="font-medium">{transaction.date}</div>
                                                <div className="text-sm text-gray-500">{transaction.time}</div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div>
                                                <div className="font-medium">{transaction.dodhiName}</div>
                                                <div className="text-sm text-gray-500">ID: {transaction.dodhiId}</div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="font-bold text-green-600">{transaction.grossLiters.toFixed(1)}L</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="text-purple-600">{transaction.lr.toFixed(2)}</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="text-orange-600">{transaction.fat.toFixed(2)}%</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="font-medium text-blue-600">{transaction.netLiters.toFixed(1)}L</span>
                                        </Table.Cell>
                                        <Table.Cell className="hidden sm:table-cell">
                                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table>
                </div>

                {/* Summary Row */}
                {paginatedTransactions.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700">
                                Total on this page:
                            </span>
                            <span className="font-bold text-green-600">
                                {paginatedTransactions.reduce((sum, t) => sum + t.grossLiters, 0).toFixed(1)}L Gross
                            </span>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="text-sm text-gray-700 text-center sm:text-left">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                            </div>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 text-sm border rounded-lg ${page === currentPage
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
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main component with Suspense wrapper
export default function ReceiveReport() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
            <DynamicLayout>
                <Suspense fallback={<FullPageSpinner message="Loading receive report..." />}>
                    <ReceiveReportContent />
                </Suspense>
            </DynamicLayout>
        </ProtectedRoute>
    );
}