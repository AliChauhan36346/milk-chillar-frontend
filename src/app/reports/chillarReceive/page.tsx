'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import {
    Truck, Download, RefreshCw, Eye,
    Users, Clock, Droplets
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import SummaryCard from '@/components/ui/SummaryCard';
import { Table, TableContainer } from '@/components/ui/Table/Table';
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
    { value: '', label: 'All Times' },
    { value: 'morning', label: 'Morning (5:00 - 11:59)' },
    { value: 'evening', label: 'Evening (15:00 - 23:59)' }
];

function ReceiveReportContent() {
    const searchParams = useSearchParams();

    // Date state
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    });

    // Time filter
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
    const itemsPerPage = 15;

    // Load user's chillar info on mount
    useEffect(() => {
        const loadUserChillar = async () => {
            const paramChillarId = searchParams.get('chillarId');

            if (isAdmin) {
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
            } catch (error) {
                console.error('Failed to load employees:', error);
                setError('Failed to load employees');
            } finally {
                setLoading(prev => ({ ...prev, employees: false }));
            }
        };
        loadEmployees();
    }, []);

    // Helper functions for time string
    const getTimeString = (filter: 'morning' | 'evening' | '') => {
        switch (filter) {
            case 'morning':
                return '05:00';
            case 'evening':
                return '15:00';
            default:
                return '';
        }
    };

    const getEndTimeString = (filter: 'morning' | 'evening' | '') => {
        switch (filter) {
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
        if (!userChillar) return;

        try {
            setLoading(prev => ({ ...prev, records: true }));
            setError(null);

            let timeParams: { startTimeOfDay?: string; endTimeOfDay?: string } = {};

            if (timeFilter.startTime) {
                timeParams.startTimeOfDay = getTimeString(timeFilter.startTime);
            }

            if (timeFilter.endTime) {
                timeParams.endTimeOfDay = getEndTimeString(timeFilter.endTime);
            }

            const params: ChillarReportsParams = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                chillarId: userChillar.chillarId,
                chillarInchargeId: userChillar.chillarInchargeId,
                ...timeParams,
                ...(filters.dodhi !== '' && { dodhiId: parseInt(filters.dodhi) })
            };

            const records = await getChillarReceiveRecords(params);
            setReceiveRecords(records || []);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to load records:', error);
            setError('Failed to load receive records. Please check your connection and try again.');
            setReceiveRecords([]);
        } finally {
            setLoading(prev => ({ ...prev, records: false }));
        }
    }, [dateRange.startDate, dateRange.endDate, timeFilter.startTime, timeFilter.endTime, filters.dodhi, userChillar]);

    useEffect(() => {
        if (userChillar) {
            loadReceiveData();
        }
    }, [loadReceiveData]);

    // Transform records to display format
    const displayTransactions: DisplayTransaction[] = useMemo(() => {
        return receiveRecords.map(record => ({
            id: record.receiveId.toString(),
            receiptNo: `REC-${record.receiveId}`,
            date: new Date(record.date).toLocaleDateString('en-GB'),
            time: record.timeOfDay || new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dodhiId: record.dodhiID,
            dodhiName: record.dodhiName || 'Unknown Dodhi',
            grossLiters: record.grossLiters,
            netLiters: record.netLiters,
            fat: record.fat,
            lr: record.lr
        }));
    }, [receiveRecords]);

    // Calculate summary
    const summary: ReceiveSummary = useMemo(() => {
        if (!displayTransactions.length) {
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

        const totalGross = displayTransactions.reduce((sum, t) => sum + t.grossLiters, 0);
        const totalNet = displayTransactions.reduce((sum, t) => sum + t.netLiters, 0);
        const totalFat = displayTransactions.reduce((sum, t) => sum + (t.fat * t.grossLiters), 0);
        const totalLr = displayTransactions.reduce((sum, t) => sum + (t.lr * t.grossLiters), 0);
        const uniqueDodhis = new Set(displayTransactions.map(t => t.dodhiId)).size;

        const morningGross = displayTransactions
            .filter(t => t.time.toLowerCase().includes('morning') ||
                (parseInt(t.time.split(':')[0]) >= 5 && parseInt(t.time.split(':')[0]) < 12))
            .reduce((sum, t) => sum + t.grossLiters, 0);

        const eveningGross = displayTransactions
            .filter(t => t.time.toLowerCase().includes('evening') ||
                (parseInt(t.time.split(':')[0]) >= 15 && parseInt(t.time.split(':')[0]) < 24))
            .reduce((sum, t) => sum + t.grossLiters, 0);

        return {
            totalGrossLiters: totalGross,
            totalNetLiters: totalNet,
            totalTransactions: displayTransactions.length,
            averageFat: totalGross > 0 ? totalFat / totalGross : 0,
            averageLr: totalGross > 0 ? totalLr / totalGross : 0,
            uniqueDodhis,
            morningCollection: morningGross,
            eveningCollection: eveningGross
        };
    }, [displayTransactions]);

    // Pagination
    const totalPages = Math.ceil(displayTransactions.length / itemsPerPage);
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return displayTransactions.slice(start, start + itemsPerPage);
    }, [displayTransactions, currentPage, itemsPerPage]);

    const handleClearFilters = () => {
        setFilters(prev => ({ ...prev, dodhi: '' }));
        setTimeFilter({ startTime: '', endTime: '' });
        setCurrentPage(1);
    };

    if (loading.chillar || (loading.employees && employees.length === 0)) {
        return <FullPageSpinner message="Loading receive report..." />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <PageHeader
                showBack
                title="Receive Report"
                subtitle="Detailed milk reception and dodhi collection records"
                icon={<Truck className="w-5 h-5 text-blue-600" />}
                actions={
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <div className="min-w-[180px]">
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
                        <button
                            onClick={loadReceiveData}
                            disabled={loading.records}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-200"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading.records ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                }
            />

            {/* Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <SummaryCard
                    title="Total Received"
                    value={`${summary.totalGrossLiters.toFixed(1)} L`}
                    icon={<Truck className="w-4 h-4 text-blue-600" />}
                    color="blue"
                    subtitle={`${summary.totalTransactions} receipts`}
                />
                <SummaryCard
                    title="Average LR"
                    value={summary.averageLr.toFixed(2)}
                    icon={<Droplets className="w-4 h-4 text-indigo-600" />}
                    color="purple"
                    subtitle={`Avg Fat: ${summary.averageFat.toFixed(2)}%`}
                />
                <SummaryCard
                    title="Net Liters"
                    value={`${summary.totalNetLiters.toFixed(1)} L`}
                    icon={<Droplets className="w-4 h-4 text-emerald-600" />}
                    color="green"
                />
                <SummaryCard
                    title="Active Dodhis"
                    value={summary.uniqueDodhis.toString()}
                    icon={<Users className="w-4 h-4 text-amber-600" />}
                    color="yellow"
                    subtitle="Contributors"
                />
            </div>

            {/* Compact Filters Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Date Range */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    {/* Time Filter */}
                    <div className="min-w-[130px]">
                        <Select
                            value={timeFilter.startTime}
                            onChange={(value) => setTimeFilter(prev => ({ ...prev, startTime: value as any }))}
                            options={TIME_OPTIONS}
                            placeholder="Time of Day"
                        />
                    </div>

                    {/* Dodhi Filter */}
                    <div className="min-w-[170px]">
                        <Select
                            value={filters.dodhi}
                            onChange={(value) => setFilters(prev => ({ ...prev, dodhi: value }))}
                            options={[
                                { value: '', label: 'All Dodhis' },
                                ...employees.map(emp => ({
                                    value: emp.employeeId.toString(),
                                    label: `${emp.fullName} (${emp.designation || 'Dodhi'})`
                                }))
                            ]}
                            placeholder="Select Dodhi"
                        />
                    </div>

                    <button
                        onClick={handleClearFilters}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ml-auto"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                    {error}
                </div>
            )}

            {/* Transactions Table */}
            <TableContainer title="Milk Collection Records">
                <div className="overflow-x-auto">
                    <Table dense>
                        <Table.Header sticky>
                            <Table.Row>
                                <Table.Head>Date & Time</Table.Head>
                                <Table.Head>Dodhi Details</Table.Head>
                                <Table.Head align="right">Gross Ltrs</Table.Head>
                                <Table.Head align="right">LR</Table.Head>
                                <Table.Head align="right">Fat %</Table.Head>
                                <Table.Head align="right">Net Ltrs</Table.Head>
                                <Table.Head align="center" className="hidden sm:table-cell">Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {paginatedTransactions.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                                        {loading.records ? 'Loading records...' : 'No records found for the selected criteria'}
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                paginatedTransactions.map((transaction) => (
                                    <Table.Row key={transaction.id}>
                                        <Table.Cell>
                                            <div>
                                                <div className="font-medium text-xs text-slate-900">{transaction.date}</div>
                                                <div className="text-[11px] text-slate-500">{transaction.time}</div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div>
                                                <div className="font-medium text-xs text-slate-900">{transaction.dodhiName}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">ID: {transaction.dodhiId}</div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell align="right">
                                            <span className="font-medium text-xs text-slate-900 tabular-nums">
                                                {transaction.grossLiters.toFixed(1)} L
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell align="right" className="text-xs text-slate-700 tabular-nums font-mono">
                                            {transaction.lr.toFixed(2)}
                                        </Table.Cell>
                                        <Table.Cell align="right" className="text-xs text-slate-700 tabular-nums font-mono">
                                            {transaction.fat.toFixed(2)}%
                                        </Table.Cell>
                                        <Table.Cell align="right">
                                            <span className="font-medium text-xs text-slate-900 tabular-nums">
                                                {transaction.netLiters.toFixed(1)} L
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell align="center" className="hidden sm:table-cell">
                                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                        {paginatedTransactions.length > 0 && (
                            <tfoot className="bg-slate-50/90 border-t-2 border-slate-200/90 font-medium">
                                <tr>
                                    <Table.Cell colSpan={2}>
                                        <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Page Total</span>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <span className="font-semibold text-slate-900 text-xs tabular-nums">
                                            {paginatedTransactions.reduce((sum, t) => sum + t.grossLiters, 0).toFixed(1)} L
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell colSpan={2} />
                                    <Table.Cell align="right">
                                        <span className="font-semibold text-slate-900 text-xs tabular-nums">
                                            {paginatedTransactions.reduce((sum, t) => sum + t.netLiters, 0).toFixed(1)} L
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell />
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs text-slate-500 text-center sm:text-left">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, displayTransactions.length)} of {displayTransactions.length} results
                        </div>
                        <div className="flex items-center gap-1.5 justify-center">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors font-medium text-slate-700"
                            >
                                Previous
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors font-medium text-slate-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </TableContainer>
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