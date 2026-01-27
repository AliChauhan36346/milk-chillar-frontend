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
import SummaryCard from '@/components/ui/SummaryCard';
import {
    Building2,
    Droplets,
    Wallet,
    ArrowRightLeft,
    Scale,
    Calendar,
    Filter,
    Clock
} from 'lucide-react';

export default function DodhiSummaryReportPage() {
    // Config
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
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
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header & Filters */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800">Dodhi Summary Report</h1>
                                    <p className="text-slate-500 text-sm">Overview of dodhi performance and transactions</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Start Date */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Start Time */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 uppercase">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <select
                                            value={startTimeOfDay}
                                            onChange={(e) => setStartTimeOfDay(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                        >
                                            <option value="">All Day</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 uppercase">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* End Time */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500 uppercase">End Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <select
                                            value={endTimeOfDay}
                                            onChange={(e) => setEndTimeOfDay(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                        >
                                            <option value="">All Day</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Chillar Select (Admin Only) */}
                                {isAdmin && (
                                    <div className="space-y-1 md:col-span-4">
                                        <label className="text-xs font-medium text-slate-500 uppercase">Select Chillar</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <select
                                                value={selectedChillarId || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSelectedChillarId(value === '' ? undefined : Number(value));
                                                }}
                                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                                            >
                                                <option value="">All Chillars</option>
                                                {chillars.map((chillar) => (
                                                    <option key={chillar.chillarId} value={chillar.chillarId}>
                                                        {chillar.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Filter className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                {overallSummary && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <SummaryCard
                                            title="Total Purchased"
                                            value={`${overallSummary.totalPurchasedLiters.toLocaleString()} L`}
                                            subtitle={`Rs ${overallSummary.totalPurchaseAmount.toLocaleString()} • ${overallSummary.totalPurchaseTransactions} transactions`}
                                            icon={<Droplets className="w-6 h-6" />}
                                            color="blue"
                                        />
                                        <SummaryCard
                                            title="Total Received"
                                            value={`${overallSummary.totalReceivedLiters.toLocaleString()} L`}
                                            subtitle={`Net: ${overallSummary.totalNetLiters.toLocaleString()} L • ${overallSummary.totalReceiveTransactions} receive txns`}
                                            icon={<ArrowRightLeft className="w-6 h-6" />}
                                            color="green"
                                        />
                                        <SummaryCard
                                            title="Purchase Rate"
                                            value={`Rs ${overallSummary.averagePurchaseRate.toFixed(2)}`}
                                            subtitle="Average rate/liter"
                                            icon={<Wallet className="w-6 h-6" />}
                                            color="purple"
                                        />
                                        <SummaryCard
                                            title="Shortage / Excess"
                                            value={`${overallSummary.totalPurchaseReceiveDifference.toLocaleString()} L`}
                                            subtitle={`${overallSummary.overallReceptionLossPercentage.toFixed(2)}% Loss`}
                                            icon={<Scale className="w-6 h-6" />}
                                            color={overallSummary.totalPurchaseReceiveDifference > 0 ? "red" : "green"}
                                        />
                                    </div>
                                )}

                                {/* Details Table */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                        <h2 className="font-semibold text-slate-800">Dodhi Performance Details</h2>
                                        <span className="text-sm text-slate-500">{dodhiDetails.length} Records Found</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-3">Dodhi Name</th>
                                                    <th className="px-6 py-3 text-right">Purchased (L)</th>
                                                    <th className="px-6 py-3 text-right">Amount (Rs)</th>
                                                    <th className="px-6 py-3 text-right">Received (L)</th>
                                                    <th className="px-6 py-3 text-right">Net (L)</th>
                                                    <th className="px-6 py-3 text-right">Difference (L)</th>
                                                    <th className="px-6 py-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {dodhiDetails.length > 0 ? (
                                                    dodhiDetails.map((record) => (
                                                        <tr key={`${record.dodhiId}-${record.chillarId}`} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-3 font-medium text-slate-700">{record.dodhiName}</td>
                                                            <td className="px-6 py-3 text-right text-slate-600">
                                                                {record.totalPurchasedLiters.toLocaleString()}
                                                                <div className="text-xs text-slate-400">{record.purchaseTransactionCount} txns</div>
                                                            </td>
                                                            <td className="px-6 py-3 text-right font-medium text-slate-700">
                                                                {record.totalPurchaseAmount.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-3 text-right text-slate-600">
                                                                {record.totalReceivedLiters.toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-3 text-right text-slate-600">
                                                                {record.totalNetLiters.toLocaleString()}
                                                            </td>
                                                            <td className={`px-6 py-3 text-right font-medium ${record.purchaseReceiveDifference > 0 ? 'text-red-600' : 'text-emerald-600'
                                                                }`}>
                                                                {record.purchaseReceiveDifference > 0 ? '+' : ''}{record.purchaseReceiveDifference.toLocaleString()}
                                                                <div className="text-xs opacity-70">{record.purchaseReceiveDifferencePercentage.toFixed(1)}%</div>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${record.receptionLossPercentage > 5
                                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    }`}>
                                                                    {record.receptionLossPercentage > 5 ? 'High Loss' : 'Normal'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                                            No records found for the selected criteria
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </DynamicLayout>
        </ProtectedRoute>
    );
}
