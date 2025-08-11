//app/reports/receive/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import {
    Truck,
    Search,
    Calendar,
    Download,
    RefreshCw,
    Filter,
    Eye,
    Users,
    Scale,
    BarChart3,
    Clock,
    Droplets,
    TrendingUp
} from 'lucide-react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';

// Types for receive data
interface ReceiveTransaction {
    id: string;
    receiptNo: string;
    date: string;
    time: string;
    shift: 'morning' | 'evening';
    dodhiId: number;
    dodhiName: string;
    dodhiCode: string;
    quantity: number;
    fat: number;
    lr: number; // Lactometer Reading
    rate: number;
    amount: number;
    paymentStatus: 'paid' | 'pending' | 'advance';
    remarks?: string;
    receivedBy: string;
    qualityGrade: 'A' | 'B' | 'C';
}

interface Dodhi {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
}

interface ReceiveSummary {
    totalQuantity: number;
    totalAmount: number;
    totalTransactions: number;
    averageRate: number;
    averageFat: number;
    averageLr: number;
    uniqueDodhis: number;
    morningCollection: number;
    eveningCollection: number;
}

export default function ReceiveReport() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [timeRange, setTimeRange] = useState({
        startTime: '',
        endTime: ''
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDodhi, setSelectedDodhi] = useState<string>('all');
    const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'evening'>('all');
    const [qualityFilter, setQualityFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'quantity' | 'fat' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    // Mock data - replace with actual API calls
    const [dodhiList, setDodhiList] = useState<Dodhi[]>([
        { id: 1, name: 'Ramesh Kumar', code: 'RK001', isActive: true },
        { id: 2, name: 'Suresh Patel', code: 'SP002', isActive: true },
        { id: 3, name: 'Mukesh Singh', code: 'MS003', isActive: true },
        { id: 4, name: 'Rajesh Sharma', code: 'RS004', isActive: true },
        { id: 5, name: 'Dinesh Yadav', code: 'DY005', isActive: true }
    ]);

    const [receiveData, setReceiveData] = useState<{
        summary: ReceiveSummary;
        transactions: ReceiveTransaction[];
    }>({
        summary: {
            totalQuantity: 2845,
            totalAmount: 142750,
            totalTransactions: 156,
            averageRate: 50.18,
            averageFat: 4.1,
            averageLr: 27.5,
            uniqueDodhis: 15,
            morningCollection: 1720,
            eveningCollection: 1125
        },
        transactions: [
            {
                id: '1',
                receiptNo: 'REC-2024-001',
                date: '2024-01-15',
                time: '06:30',
                shift: 'morning',
                dodhiId: 1,
                dodhiName: 'Ramesh Kumar',
                dodhiCode: 'RK001',
                quantity: 45,
                fat: 4.2,
                lr: 28,
                rate: 52,
                amount: 2340,
                paymentStatus: 'paid',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'A'
            },
            {
                id: '2',
                receiptNo: 'REC-2024-002',
                date: '2024-01-15',
                time: '07:00',
                shift: 'morning',
                dodhiId: 2,
                dodhiName: 'Suresh Patel',
                dodhiCode: 'SP002',
                quantity: 38,
                fat: 3.8,
                lr: 26,
                rate: 48,
                amount: 1824,
                paymentStatus: 'pending',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'B'
            },
            {
                id: '3',
                receiptNo: 'REC-2024-003',
                date: '2024-01-15',
                time: '18:30',
                shift: 'evening',
                dodhiId: 3,
                dodhiName: 'Mukesh Singh',
                dodhiCode: 'MS003',
                quantity: 32,
                fat: 4.5,
                lr: 29,
                rate: 55,
                amount: 1760,
                paymentStatus: 'paid',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'A'
            },
            {
                id: '4',
                receiptNo: 'REC-2024-004',
                date: '2024-01-14',
                time: '06:45',
                shift: 'morning',
                dodhiId: 4,
                dodhiName: 'Rajesh Sharma',
                dodhiCode: 'RS004',
                quantity: 50,
                fat: 4.0,
                lr: 27,
                rate: 50,
                amount: 2500,
                paymentStatus: 'advance',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'A'
            },
            {
                id: '5',
                receiptNo: 'REC-2024-005',
                date: '2024-01-14',
                time: '19:15',
                shift: 'evening',
                dodhiId: 5,
                dodhiName: 'Dinesh Yadav',
                dodhiCode: 'DY005',
                quantity: 28,
                fat: 3.5,
                lr: 25,
                rate: 45,
                amount: 1260,
                paymentStatus: 'paid',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'B'
            },
            {
                id: '6',
                receiptNo: 'REC-2024-006',
                date: '2024-01-13',
                time: '07:20',
                shift: 'morning',
                dodhiId: 1,
                dodhiName: 'Ramesh Kumar',
                dodhiCode: 'RK001',
                quantity: 42,
                fat: 4.1,
                lr: 28,
                rate: 51,
                amount: 2142,
                paymentStatus: 'paid',
                receivedBy: 'Chillar Incharge',
                qualityGrade: 'A'
            }
        ]
    });

    useEffect(() => {
        const loadReceiveData = async () => {
            setLoading(true);
            // Replace with actual API calls based on filters
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };

        loadReceiveData();
    }, [dateRange, timeRange, selectedDodhi]);

    // Filter and sort transactions
    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = receiveData.transactions.filter(transaction => {
            const matchesSearch =
                transaction.dodhiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.dodhiCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDodhi = selectedDodhi === 'all' || transaction.dodhiId.toString() === selectedDodhi;
            const matchesShift = shiftFilter === 'all' || transaction.shift === shiftFilter;
            const matchesQuality = qualityFilter === 'all' || transaction.qualityGrade === qualityFilter;

            // Time range filter
            let matchesTime = true;
            if (timeRange.startTime && timeRange.endTime) {
                const transactionTime = transaction.time;
                matchesTime = transactionTime >= timeRange.startTime && transactionTime <= timeRange.endTime;
            }

            return matchesSearch && matchesDodhi && matchesShift && matchesQuality && matchesTime;
        });

        // Sort transactions
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(`${a.date} ${a.time}`).getTime();
                    bValue = new Date(`${b.date} ${b.time}`).getTime();
                    break;
                case 'quantity':
                    aValue = a.quantity;
                    bValue = b.quantity;
                    break;
                case 'fat':
                    aValue = a.fat;
                    bValue = b.fat;
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                default:
                    aValue = new Date(`${a.date} ${a.time}`).getTime();
                    bValue = new Date(`${b.date} ${b.time}`).getTime();
            }

            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }, [receiveData.transactions, searchTerm, selectedDodhi, shiftFilter, qualityFilter, timeRange, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);

    const handleExportData = () => {
        alert('Export functionality would be implemented here');
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Pending</span>;
            case 'advance':
                return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Advance</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
        }
    };

    const getQualityBadge = (grade: string) => {
        const colors = {
            'A': 'bg-green-100 text-green-800',
            'B': 'bg-yellow-100 text-yellow-800',
            'C': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[grade as keyof typeof colors]}`}>
                Grade {grade}
            </span>
        );
    };

    const getShiftBadge = (shift: string) => {
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${shift === 'morning' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                {shift === 'morning' ? '🌅 Morning' : '🌙 Evening'}
            </span>
        );
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="chillarincharge">
                <FieldStaffLayout role="chillarIncharge">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading receive report...</p>
                        </div>
                    </div>
                </FieldStaffLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="chillarincharge">
            <FieldStaffLayout role="chillarIncharge">
                <div className="max-w-7xl mx-auto p-4 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div className="flex items-center gap-2">
                                <Truck className="w-8 h-8 text-blue-600" />
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receive Report</h1>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="sm:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                            <button
                                onClick={handleExportData}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <SummaryCard
                            title="Total Received"
                            value={`${receiveData.summary.totalQuantity}L`}
                            icon={<Truck className="w-5 h-5 sm:w-6 sm:h-6" />}
                            color="blue"
                            subtitle={`${receiveData.summary.totalTransactions} receipts`}
                        />
                        <SummaryCard
                            title="Avg Quality"
                            value={`${receiveData.summary.averageFat}% Fat`}
                            icon={<Droplets className="w-5 h-5 sm:w-6 sm:h-6" />}
                            color="purple"
                            subtitle={`LR: ${receiveData.summary.averageLr}`}
                        />
                        <SummaryCard
                            title="Active Dodhis"
                            value={`${receiveData.summary.uniqueDodhis}`}
                            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                            color="yellow"
                            subtitle="Contributors"
                        />
                    </div>

                    {/* Shift Summary */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-orange-800">Morning Collection</h3>
                                    <p className="text-2xl font-bold text-orange-600">{receiveData.summary.morningCollection}L</p>
                                    <p className="text-sm text-orange-500">
                                        {((receiveData.summary.morningCollection / receiveData.summary.totalQuantity) * 100).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-indigo-800">Evening Collection</h3>
                                    <p className="text-2xl font-bold text-indigo-600">{receiveData.summary.eveningCollection}L</p>
                                    <p className="text-sm text-indigo-500">
                                        {((receiveData.summary.eveningCollection / receiveData.summary.totalQuantity) * 100).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`bg-white rounded-xl shadow-sm transition-all duration-300 ${showFilters || (typeof window !== 'undefined' && window.innerWidth >= 640) ? 'block' : 'hidden'
                        }`}>
                        <div className="p-4 sm:p-6 space-y-4">
                            {/* start and end date time */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <select
                                        value={shiftFilter}
                                        onChange={(e) => setShiftFilter(e.target.value as any)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Shifts</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                    </select>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <select
                                        value={shiftFilter}
                                        onChange={(e) => setShiftFilter(e.target.value as any)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Shifts</option>
                                        <option value="morning">Morning</option>
                                        <option value="evening">Evening</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by dodhi, code, or receipt..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dodhi</label>
                                    <select
                                        value={selectedDodhi}
                                        onChange={(e) => setSelectedDodhi(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Dodhis</option>
                                        {dodhiList.map((dodhi) => (
                                            <option key={dodhi.id} value={dodhi.id.toString()}>
                                                {dodhi.name} ({dodhi.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            

                            <div className="flex justify-between items-center pt-2">
                                <div className="text-sm text-gray-600">
                                    Showing {filteredAndSortedTransactions.length} results
                                </div>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedDodhi('all');
                                        setShiftFilter('all');
                                        setQualityFilter('all');
                                        setTimeRange({ startTime: '', endTime: '' });
                                    }}
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
                                        <Table.Head>Receipt No.</Table.Head>
                                        <Table.Head>Date & Time</Table.Head>
                                        <Table.Head>Dodhi Details</Table.Head>
                                        <Table.Head>Quantity</Table.Head>
                                        <Table.Head>Quality</Table.Head>
                                        <Table.Head>Rate</Table.Head>
                                        <Table.Head>Amount</Table.Head>
                                        <Table.Head>Payment</Table.Head>
                                        <Table.Head className="hidden sm:table-cell">Actions</Table.Head>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {paginatedTransactions.map((transaction) => (
                                        <Table.Row key={transaction.id}>
                                            <Table.Cell>
                                                <span className="font-medium">₹{transaction.rate}/L</span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="font-bold text-green-600">₹{transaction.amount.toLocaleString()}</span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {getPaymentStatusBadge(transaction.paymentStatus)}
                                            </Table.Cell>
                                            <Table.Cell className="hidden sm:table-cell">
                                                <div className="flex gap-2">
                                                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>

                        {/* Mobile-friendly Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-700 text-center sm:text-left">
                                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} results
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>

                                        {/* Show page numbers - mobile friendly */}
                                        {totalPages <= 5 ? (
                                            [...Array(totalPages)].map((_, i) => {
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
                                            })
                                        ) : (
                                            <>
                                                {/* First page */}
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    className={`px-3 py-2 text-sm border rounded-lg ${currentPage === 1
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    1
                                                </button>

                                                {/* Ellipsis if needed */}
                                                {currentPage > 3 && <span className="px-2">...</span>}

                                                {/* Current page and neighbors */}
                                                {Array.from(
                                                    { length: Math.min(3, totalPages) },
                                                    (_, i) => Math.max(2, Math.min(currentPage - 1, totalPages - 2)) + i
                                                )
                                                    .filter(page => page > 1 && page < totalPages)
                                                    .map(page => (
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
                                                    ))}

                                                {/* Ellipsis if needed */}
                                                {currentPage < totalPages - 2 && <span className="px-2">...</span>}

                                                {/* Last page */}
                                                {totalPages > 1 && (
                                                    <button
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className={`px-3 py-2 text-sm border rounded-lg ${currentPage === totalPages
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FieldStaffLayout>
        </ProtectedRoute>
    );
}
                                               