'use client';
import { useState, useEffect } from 'react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyChillar } from '@/lib/api/chillarReceive';
import {
    getOverallDodhiSummary,
    getSingleDodhiSummary,
    OverallDodhiSummaryDto,
    SingleDodhiSummaryDto
} from '@/lib/api/reports';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { StatStrip } from '@/components/ui/StatStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { getCurrentMonthHalfDateRange } from '@/lib/utils/dateRange';
import {
    Building2,
    Droplets,
    Wallet,
    ArrowRightLeft,
    Scale,
    Calendar,
    Filter,
    Clock,
    UserCheck,
    Printer
} from 'lucide-react';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';

export default function DodhiSummaryReportPage() {
    // Config
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // State - Initialize with current month half date range
    const initialDateRange = getCurrentMonthHalfDateRange();
    const [startDate, setStartDate] = useState(initialDateRange.startDate);
    const [endDate, setEndDate] = useState(initialDateRange.endDate);
    const [startTimeOfDay, setStartTimeOfDay] = useState<string>('');
    const [endTimeOfDay, setEndTimeOfDay] = useState<string>('');
    const [selectedChillarId, setSelectedChillarId] = useState<number | undefined>(undefined);
    const [chillars, setChillars] = useState<Chillar[]>([]);

    // Data State
    const [overallSummary, setOverallSummary] = useState<OverallDodhiSummaryDto | null>(null);
    const [dodhiDetails, setDodhiDetails] = useState<SingleDodhiSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize
    useEffect(() => {
        const initialize = async () => {
            if (isAdmin) {
                try {
                    const chillarsData = await getChillars();
                    setChillars(chillarsData);
                    if (chillarsData.length > 0) {
                        setSelectedChillarId(chillarsData[0].chillarId);
                    }
                } catch (error) {
                    console.error('Failed to fetch chillars:', error);
                }
            } else {
                // For chillar incharge (non-admin), derive chillarId from backend
                // because AuthContext's User type doesn't include chillarId.
                try {
                    const myChillar = await getMyChillar();
                    setSelectedChillarId(myChillar.chillarId);
                } catch (error) {
                    console.error('Failed to fetch my chillar:', error);
                }
            }
        };
        initialize();
    }, [isAdmin, user]);

    // Fetch Report Data
    useEffect(() => {
        const fetchReport = async () => {
            // For non-admin users, wait for chillar ID
            if (!isAdmin && !selectedChillarId) return;

            setIsLoading(true);
            try {
                const query: {
                    startDate: string;
                    endDate: string;
                    startTimeOfDay?: string;
                    endTimeOfDay?: string;
                    chillarId?: number;
                } = {
                    startDate,
                    endDate,
                    startTimeOfDay: startTimeOfDay || undefined,
                    endTimeOfDay: endTimeOfDay || undefined
                };
                
                // Only include chillarId if it's defined (not undefined or 0)
                if (selectedChillarId) {
                    query.chillarId = selectedChillarId;
                }

                const [summary, details] = await Promise.all([
                    getOverallDodhiSummary(query),
                    getSingleDodhiSummary(query)
                ]);

                setOverallSummary(summary);
                setDodhiDetails(details);
            } catch (error) {
                console.error('Error fetching report:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [startDate, endDate, startTimeOfDay, endTimeOfDay, selectedChillarId, isAdmin]);

    return (
        <ProtectedRoute>
            <DynamicLayout allowedRoles={['admin', 'chillarincharge']}>
                <div className="min-h-screen bg-slate-50 p-2">
                    <div className="max-w-7xl mx-auto space-y-4">
                        {/* Header */}
                        <PageHeader
                            title="Dodhi Summary Report"
                            subtitle="Overview of dodhi collection, performance and variance"
                            icon={<UserCheck className="w-5 h-5 text-blue-600" />}
                            actions={
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    Print / PDF
                                </button>
                            }
                        />

                        {/* Print Header */}
                        <ReportPrintHeader
                            title="Dodhi Procurement & Performance Summary Report"
                            subtitle="Consolidated Field Dodhi Collection, Reception, and Variance Analysis"
                            dateRange={{ startDate, endDate }}
                            chillarName={chillars.find(c => c.chillarId === selectedChillarId)?.name || undefined}
                        />

                        {/* Compact Filters Toolbar */}
                        <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs print:hidden">
                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Start Date */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>

                                <div className="min-w-[110px]">
                                    <select
                                        value={startTimeOfDay}
                                        onChange={(e) => setStartTimeOfDay(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                                    >
                                        <option value="">All Times</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>

                                {/* End Date */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>

                                <div className="min-w-[110px]">
                                    <select
                                        value={endTimeOfDay}
                                        onChange={(e) => setEndTimeOfDay(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                                    >
                                        <option value="">All Times</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>

                                {/* Chillar Select (Admin Only) */}
                                {isAdmin && (
                                    <div className="min-w-[170px]">
                                        <select
                                            value={selectedChillarId || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSelectedChillarId(value === '' ? undefined : Number(value));
                                            }}
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                                        >
                                            <option value="">All Chillars</option>
                                            {chillars.map((chillar) => (
                                                <option key={chillar.chillarId} value={chillar.chillarId}>
                                                    {chillar.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="text-xs text-slate-500 font-medium ml-auto">
                                    Records: <strong className="text-slate-800">{dodhiDetails.length}</strong>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Stat Strip */}
                                {overallSummary && (
                                    <StatStrip
                                        items={[
                                            {
                                                label: 'Total Purchased',
                                                value: `${overallSummary.totalPurchasedLiters.toLocaleString()} L`,
                                                subtext: `Rs ${overallSummary.totalPurchaseAmount.toLocaleString()}`,
                                                color: 'info',
                                                icon: <Droplets className="w-4 h-4 text-blue-600" />,
                                            },
                                            {
                                                label: 'Total Received',
                                                value: `${overallSummary.totalReceivedLiters.toLocaleString()} L`,
                                                subtext: `Net: ${overallSummary.totalNetLiters.toLocaleString()} L`,
                                                color: 'success',
                                                icon: <ArrowRightLeft className="w-4 h-4 text-emerald-600" />,
                                            },
                                            {
                                                label: 'Avg Rate',
                                                value: `Rs ${overallSummary.averagePurchaseRate.toFixed(2)}/L`,
                                                color: 'purple',
                                                icon: <Wallet className="w-4 h-4 text-purple-600" />,
                                            },
                                            {
                                                label: 'Shortage / Excess',
                                                value: `${overallSummary.totalPurchaseReceiveDifference.toLocaleString()} L`,
                                                subtext: `${overallSummary.overallReceptionLossPercentage.toFixed(2)}% Loss`,
                                                color: overallSummary.totalPurchaseReceiveDifference > 0 ? 'danger' : 'success',
                                                icon: (
                                                    <Scale
                                                        className={`w-4 h-4 ${
                                                            overallSummary.totalPurchaseReceiveDifference > 0
                                                                ? 'text-rose-600'
                                                                : 'text-emerald-600'
                                                        }`}
                                                    />
                                                ),
                                            },
                                        ]}
                                    />
                                )}

                                {/* Desktop Table */}
                                <div className="hidden md:block print:block">
                                    <TableContainer title="Dodhi Performance Details">
                                        <Table dense>
                                            <Table.Header sticky>
                                                <Table.Row>
                                                    <Table.Head>Dodhi Name</Table.Head>
                                                    <Table.Head align="right">Purchased (L)</Table.Head>
                                                    <Table.Head align="right">Amount (Rs)</Table.Head>
                                                    <Table.Head align="right">Received (L)</Table.Head>
                                                    <Table.Head align="right">Net (L)</Table.Head>
                                                    <Table.Head align="right">Difference (L)</Table.Head>
                                                    <Table.Head align="center">Status</Table.Head>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {dodhiDetails.length > 0 ? (
                                                    dodhiDetails.map((record) => (
                                                        <Table.Row key={`${record.dodhiId}-${record.chillarId}`}>
                                                            <Table.Cell className="font-medium text-xs text-slate-900">{record.dodhiName}</Table.Cell>
                                                            <Table.Cell align="right">
                                                                <span className="font-medium text-xs text-slate-900 tabular-nums">
                                                                    {record.totalPurchasedLiters.toLocaleString()} L
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 block">{record.purchaseTransactionCount} txns</span>
                                                            </Table.Cell>
                                                            <Table.Cell align="right" className="font-medium text-xs text-slate-800 tabular-nums">
                                                                {record.totalPurchaseAmount.toLocaleString()}
                                                            </Table.Cell>
                                                            <Table.Cell align="right" className="text-xs text-slate-700 tabular-nums">
                                                                {record.totalReceivedLiters.toLocaleString()} L
                                                            </Table.Cell>
                                                            <Table.Cell align="right" className="text-xs text-slate-700 tabular-nums">
                                                                {record.totalNetLiters.toLocaleString()} L
                                                            </Table.Cell>
                                                            <Table.Cell align="right">
                                                                <span className={`font-medium text-xs tabular-nums ${
                                                                    record.purchaseReceiveDifference > 0 ? 'text-rose-600' : 'text-emerald-700'
                                                                }`}>
                                                                    {record.purchaseReceiveDifference > 0 ? '+' : ''}{record.purchaseReceiveDifference.toLocaleString()} L
                                                                    <span className="text-[10px] opacity-70 block">{record.purchaseReceiveDifferencePercentage.toFixed(1)}%</span>
                                                                </span>
                                                            </Table.Cell>
                                                            <Table.Cell align="center">
                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                                    record.receptionLossPercentage > 5
                                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                }`}>
                                                                    {record.receptionLossPercentage > 5 ? 'High Loss' : 'Normal'}
                                                                </span>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))
                                                ) : (
                                                    <Table.Row>
                                                        <Table.Cell colSpan={7} className="py-10 text-center text-xs text-slate-500">
                                                            No records found for the selected criteria
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )}
                                            </Table.Body>
                                        </Table>
                                    </TableContainer>
                                </div>

                                <ReportPrintFooter />

                                {/* Mobile Card List */}
                                <div className="md:hidden space-y-2.5 print:hidden">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dodhi Performance</h3>
                                        <span className="text-[11px] text-slate-400">{dodhiDetails.length} Records</span>
                                    </div>
                                    {dodhiDetails.length > 0 ? (
                                        dodhiDetails.map((record) => (
                                            <div key={`${record.dodhiId}-${record.chillarId}`} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                                                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                                                    <div>
                                                        <h4 className="font-bold text-xs text-slate-800">{record.dodhiName}</h4>
                                                        <span className="text-[11px] text-slate-500">{record.purchaseTransactionCount} txns</span>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        record.receptionLossPercentage > 5
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {record.receptionLossPercentage > 5 ? 'High Loss' : 'Normal'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Purchased</span>
                                                        <span className="font-semibold text-slate-800">{record.totalPurchasedLiters.toLocaleString()} L</span>
                                                        <span className="text-[11px] text-slate-500 block">Rs {record.totalPurchaseAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Received / Net</span>
                                                        <span className="font-semibold text-slate-800">{record.totalReceivedLiters.toLocaleString()} L</span>
                                                        <span className="text-[11px] text-slate-500 block">Net: {record.totalNetLiters.toLocaleString()} L</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100/70">
                                                    <span className="text-[11px] text-slate-500">Difference</span>
                                                    <div className="text-right">
                                                        <span className={`font-bold ${record.purchaseReceiveDifference > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {record.purchaseReceiveDifference > 0 ? '+' : ''}{record.purchaseReceiveDifference.toLocaleString()} L
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 ml-1">({record.purchaseReceiveDifferencePercentage.toFixed(1)}%)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                                            No records found for the selected criteria
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DynamicLayout>
        </ProtectedRoute>
    );
}
