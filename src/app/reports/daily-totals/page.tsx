'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    BarChart2,
    Calendar,
    ShoppingBag,
    ShoppingCart,
    Scale,
    TrendingDown,
    DollarSign,
    Download,
    Printer
} from 'lucide-react';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import { FullPageSpinner, CenteredSpinner } from '@/components/ui/spinner';
import { getDailyTotalsReport, DailyTotalsDto } from '@/lib/api/reports';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { getMyChillar } from '@/lib/api/chillarReceive';
import { getDefaultDateRange } from '@/lib/utils/dateRange';

function DailyTotalsContent() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const defaultDateRange = getDefaultDateRange();
    const [dateRange, setDateRange] = useState({
        startDate: searchParams.get('startDate') || defaultDateRange.startDate,
        endDate: searchParams.get('endDate') || defaultDateRange.endDate
    });
    const [loading, setLoading] = useState(true);
    const [dailyTotals, setDailyTotals] = useState<DailyTotalsDto[]>([]);
    const [userChillarId, setUserChillarId] = useState<number | null>(null);
    const [chillars, setChillars] = useState<Chillar[]>([]);
    const [selectedChillarId, setSelectedChillarId] = useState<number | undefined>(
        searchParams.get('chillarId') ? Number(searchParams.get('chillarId')) : undefined
    );

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

    // Update URL when filters change
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams();
        params.set('startDate', dateRange.startDate);
        params.set('endDate', dateRange.endDate);
        if (selectedChillarId) {
            params.set('chillarId', selectedChillarId.toString());
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [dateRange.startDate, dateRange.endDate, selectedChillarId, router, pathname]);

    // Load daily totals data
    useEffect(() => {
        const loadDailyTotals = async () => {
            setLoading(true);
            try {
                const chillarId = isAdmin ? (selectedChillarId || 0) : (userChillarId || 0);
                const data = await getDailyTotalsReport(dateRange.startDate, dateRange.endDate, chillarId);
                setDailyTotals(data);
            } catch (error) {
                console.error('Failed to fetch daily totals:', error);
                setDailyTotals([]);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin || userChillarId) {
            loadDailyTotals();
        }
    }, [dateRange.startDate, dateRange.endDate, userChillarId, isAdmin, selectedChillarId]);

    // Calculate summaries
    const summary = dailyTotals.reduce((acc, curr) => ({
        totalPurchaseLiters: acc.totalPurchaseLiters + curr.totalPurchaseLiters,
        totalSalesLiters: acc.totalSalesLiters + curr.totalSalesLiters,
        totalChillarReceiveLiters: acc.totalChillarReceiveLiters + curr.totalChillarReceiveLiters,
        dodhiLoss: acc.dodhiLoss + curr.dodhiLoss,
        chillarLoss: acc.chillarLoss + (curr.totalSalesLiters - curr.totalChillarReceiveLiters),
        tsSalesLiters: acc.tsSalesLiters + curr.tsSalesLiters,
        tsLoss: acc.tsLoss + (curr.tsSalesLiters - curr.totalSalesLiters),
        totalPurchaseAmount: acc.totalPurchaseAmount + curr.totalPurchaseAmount,
        salesAmount: acc.salesAmount + curr.salesAmount,
        grossProfit: acc.grossProfit + curr.grossProfit
    }), {
        totalPurchaseLiters: 0,
        totalSalesLiters: 0,
        totalChillarReceiveLiters: 0,
        dodhiLoss: 0,
        chillarLoss: 0,
        tsSalesLiters: 0,
        tsLoss: 0,
        totalPurchaseAmount: 0,
        salesAmount: 0,
        grossProfit: 0
    });

    const formatPKR = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDifference = (value: number) => {
        const sign = value > 0 ? '+' : '';
        const colorClass = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-800';
        return (
            <span className={colorClass}>
                {sign}{value.toFixed(2)}
            </span>
        );
    };

    const formatProfit = (value: number) => {
        const colorClass = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-800';
        return (
            <span className={colorClass}>
                {formatPKR(value)}
            </span>
        );
    };

    const handleCardClick = (reportType: 'purchase' | 'sales' | 'chillarReceive') => {
        const queryParams = new URLSearchParams();
        queryParams.append('startDate', dateRange.startDate);
        queryParams.append('endDate', dateRange.endDate);

        if (isAdmin && selectedChillarId) {
            queryParams.append('chillarId', selectedChillarId.toString());
        }

        let path = '';
        switch (reportType) {
            case 'purchase':
                path = '/reports/purchase/purchaseReport';
                break;
            case 'sales':
                path = '/reports/sale';
                break;
            case 'chillarReceive':
                path = '/reports/chillarReceive';
                break;
        }

        const searchString = queryParams.toString();
        router.push(`${path}?${searchString}`);
    };

    const handleExportData = () => {
        const headers = [
            'Date',
            'Purchase (L)',
            'Purchase Amount',
            'Chillar Receive (L)',
            'Dodhi Loss (L)',
            'Sales (L)',
            'Sales Amount',
            'Chillar Loss (L)',
            'TS Sales (L)',
            'TS Loss (L)',
            'Profit/Loss'
        ];

        const csvContent = [
            headers.join(','),
            ...dailyTotals.map(item => {
                const dateObj = new Date(item.date);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

                return [
                    formattedDate,
                    item.totalPurchaseLiters,
                    item.totalPurchaseAmount,
                    item.totalChillarReceiveLiters,
                    item.dodhiLoss,
                    item.totalSalesLiters,
                    item.salesAmount,
                    item.chillarLoss,
                    item.tsSalesLiters,
                    item.tsDifference,
                    item.grossProfit
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-totals-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const volumeStats: StatItem[] = [
        {
            label: "Total Purchase",
            value: `${summary.totalPurchaseLiters.toFixed(2)}L`,
            subValue: formatPKR(summary.totalPurchaseAmount),
            icon: <ShoppingCart />,
            color: "blue",
            onClick: () => handleCardClick('purchase')
        },
        {
            label: "Chillar Receive",
            value: `${summary.totalChillarReceiveLiters.toFixed(2)}L`,
            icon: <Scale />,
            color: "purple",
            onClick: () => handleCardClick('chillarReceive')
        },
        {
            label: "Dodhi Loss",
            value: `${formatDifference(summary.dodhiLoss)}L`,
            icon: <TrendingDown />,
            color: summary.dodhiLoss > 0 ? "amber" : "green"
        },
        {
            label: "Gross Sales",
            value: `${summary.totalSalesLiters.toFixed(2)}L`,
            subValue: formatPKR(summary.salesAmount),
            icon: <ShoppingBag />,
            color: "green",
            onClick: () => handleCardClick('sales')
        }
    ];

    const qualityStats: StatItem[] = [
        {
            label: "Chillar Loss/Gain",
            value: `${formatDifference(summary.chillarLoss)}L`,
            icon: <TrendingDown />,
            color: summary.chillarLoss >= 0 ? "slate" : "red"
        },
        {
            label: "TS Sales",
            value: `${summary.tsSalesLiters.toFixed(2)}L`,
            subValue: summary.totalSalesLiters > 0
                ? formatPKR((summary.salesAmount / summary.totalSalesLiters) * summary.tsSalesLiters)
                : undefined,
            icon: <ShoppingBag />,
            color: "blue"
        },
        {
            label: "TS Loss/Gain",
            value: `${formatDifference(summary.tsLoss)}L`,
            icon: <TrendingDown />,
            color: summary.tsLoss >= 0 ? "slate" : "red"
        },
        {
            label: "Gross Profit",
            value: formatProfit(summary.grossProfit),
            icon: <DollarSign />,
            color: summary.grossProfit >= 0 ? "green" : "red"
        }
    ];

    if (loading && !dailyTotals.length) {
        return <FullPageSpinner message="Loading daily totals..." />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-3.5">
            {/* Header */}
            <PageHeader
                showBack
                title="Daily Totals Report"
                subtitle="Consolidated daily milk collection, reception, sales, and profit breakdown"
                icon={<BarChart2 />}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print / PDF
                        </button>
                        <button
                            onClick={handleExportData}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                    </div>
                }
            />

            {/* Print Header */}
            <ReportPrintHeader
                title="Daily Milk Totals & Reconciliation Report"
                subtitle="Consolidated Milk Procurement, Reception, Dispatch, and Financial Performance"
                dateRange={dateRange}
                chillarName={chillars.find(c => c.chillarId === selectedChillarId)?.name || (isAdmin ? 'All Chillars' : undefined)}
            />

            {/* Compact Filter Toolbar */}
            <CompactToolbar
                left={
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>
                        {isAdmin && (
                            <div className="min-w-[170px]">
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
                    </>
                }
                right={
                    <span className="text-xs text-slate-500 font-medium">
                        Showing <strong className="text-slate-800">{dailyTotals.length}</strong> days
                    </span>
                }
            />

            {/* Compact Metric Strips */}
            <div className="space-y-2">
                <StatStrip items={volumeStats} />
                <StatStrip items={qualityStats} dense />
            </div>

            {/* Minimalist Desktop Table (Zero Horizontal Scroll) */}
            <div className="hidden md:block print:block">
                <TableContainer>
                    <div className="px-3.5 py-2.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Daily Consolidated Breakdown</h3>
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {dailyTotals.length} days
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Amounts in PKR • Volumes in Liters (L)
                        </span>
                    </div>

                    <Table dense>
                        <Table.Header sticky>
                            <Table.Row>
                                <Table.Head align="left" className="w-[120px]">Date</Table.Head>
                                <Table.Head align="right">Procurement</Table.Head>
                                <Table.Head align="right">Sales & Dispatch</Table.Head>
                                <Table.Head align="right">Storage & TS Variance</Table.Head>
                                <Table.Head align="right">Financial Value</Table.Head>
                                {isAdmin && <Table.Head align="right" className="w-[140px]">Gross Profit</Table.Head>}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-12">
                                        <CenteredSpinner message="Loading daily totals..." />
                                    </td>
                                </tr>
                            ) : dailyTotals.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-10">
                                        <div className="text-slate-400 flex flex-col items-center justify-center">
                                            <Calendar className="w-10 h-10 mb-2 text-slate-300 stroke-[1.5]" />
                                            <p className="text-xs font-medium">No records found for the selected period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                dailyTotals.map((item, index) => {
                                    const dateObj = new Date(item.date);
                                    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                                    
                                    const chillarDiff = item.totalSalesLiters - item.totalChillarReceiveLiters;
                                    const tsDiff = item.tsSalesLiters - item.totalSalesLiters;
                                    const marginPct = item.salesAmount > 0 
                                        ? ((item.grossProfit / item.salesAmount) * 100).toFixed(1) 
                                        : '0.0';

                                    return (
                                        <Table.Row key={index}>
                                            {/* Date */}
                                            <Table.Cell align="left">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 text-xs">{formattedDate}</span>
                                                    <span className="text-[10px] text-slate-400 font-normal">{dayName}</span>
                                                </div>
                                            </Table.Cell>

                                            {/* Procurement: Purchase Liters + Chillar Receive */}
                                            <Table.Cell align="right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-slate-900 tabular-nums">
                                                        {item.totalPurchaseLiters.toFixed(1)} L
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-normal tabular-nums">
                                                        Rec: {item.totalChillarReceiveLiters.toFixed(1)} L
                                                        {item.dodhiLoss > 0 && (
                                                            <span className="text-amber-600 ml-1">
                                                                (-{item.dodhiLoss.toFixed(1)}L loss)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </Table.Cell>

                                            {/* Sales & Dispatch: Total Sales + TS Sales */}
                                            <Table.Cell align="right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-slate-900 tabular-nums">
                                                        {item.totalSalesLiters.toFixed(1)} L
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 font-normal tabular-nums">
                                                        TS: {item.tsSalesLiters.toFixed(1)} L
                                                    </span>
                                                </div>
                                            </Table.Cell>

                                            {/* Storage & TS Variance */}
                                            <Table.Cell align="right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`font-medium tabular-nums ${chillarDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {chillarDiff > 0 ? '+' : ''}{chillarDiff.toFixed(1)} L
                                                        <span className="text-[10px] text-slate-400 font-normal ml-1">chillar</span>
                                                    </span>
                                                    <span className={`text-[11px] tabular-nums font-normal ${tsDiff >= 0 ? 'text-slate-600' : 'text-rose-500'}`}>
                                                        {tsDiff > 0 ? '+' : ''}{tsDiff.toFixed(1)} L TS var
                                                    </span>
                                                </div>
                                            </Table.Cell>

                                            {/* Financial Value: Sales Amount & Purchase Cost */}
                                            <Table.Cell align="right" mono>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-slate-900">
                                                        {formatPKR(item.salesAmount)}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-normal">
                                                        Cost: {formatPKR(item.totalPurchaseAmount)}
                                                    </span>
                                                </div>
                                            </Table.Cell>

                                            {/* Gross Profit (Admin only) */}
                                            {isAdmin && (
                                                <Table.Cell align="right" mono>
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-medium ${item.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                            {formatPKR(item.grossProfit)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            {marginPct}% margin
                                                        </span>
                                                    </div>
                                                </Table.Cell>
                                            )}
                                        </Table.Row>
                                    );
                                })
                            )}
                        </Table.Body>

                        {/* Summary Totals Row */}
                        {dailyTotals.length > 0 && (
                            <tfoot className="bg-slate-50/90 border-t-2 border-slate-200/90 font-medium">
                                <tr>
                                    <Table.Cell align="left">
                                        <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Summary</span>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-semibold text-slate-800 text-xs tabular-nums">
                                                {summary.totalPurchaseLiters.toFixed(1)} L
                                            </span>
                                            <span className="text-[10px] text-slate-500 tabular-nums">
                                                Rec: {summary.totalChillarReceiveLiters.toFixed(1)} L
                                            </span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-semibold text-slate-800 text-xs tabular-nums">
                                                {summary.totalSalesLiters.toFixed(1)} L
                                            </span>
                                            <span className="text-[10px] text-slate-500 tabular-nums">
                                                TS: {summary.tsSalesLiters.toFixed(1)} L
                                            </span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-semibold text-xs tabular-nums ${summary.chillarLoss >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                                {summary.chillarLoss > 0 ? '+' : ''}{summary.chillarLoss.toFixed(1)} L
                                            </span>
                                            <span className="text-[10px] text-slate-500 tabular-nums">
                                                TS: {summary.tsLoss > 0 ? '+' : ''}{summary.tsLoss.toFixed(1)} L
                                            </span>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell align="right" mono>
                                        <div className="flex flex-col items-end">
                                            <span className="font-semibold text-slate-900 text-xs">
                                                {formatPKR(summary.salesAmount)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                Cost: {formatPKR(summary.totalPurchaseAmount)}
                                            </span>
                                        </div>
                                    </Table.Cell>
                                    {isAdmin && (
                                        <Table.Cell align="right" mono>
                                            <div className="flex flex-col items-end">
                                                <span className={`font-semibold text-xs ${summary.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                    {formatPKR(summary.grossProfit)}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {summary.salesAmount > 0 ? ((summary.grossProfit / summary.salesAmount) * 100).toFixed(1) : '0.0'}% margin
                                                </span>
                                            </div>
                                        </Table.Cell>
                                    )}
                                </tr>
                            </tfoot>
                        )}
                    </Table>
                </TableContainer>
            </div>

            <ReportPrintFooter />

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2.5 print:hidden">
                {dailyTotals.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs">No records found for the selected period</p>
                    </div>
                ) : (
                    dailyTotals.map((item, index) => {
                        const dateObj = new Date(item.date);
                        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                        const chillarDiff = item.totalSalesLiters - item.totalChillarReceiveLiters;

                        return (
                            <div key={index} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                        <span className="font-bold text-xs text-slate-900">{formattedDate}</span>
                                    </div>
                                    {isAdmin && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.grossProfit >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                            {formatPKR(item.grossProfit)}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Purchase</span>
                                        <span className="font-bold text-blue-600">{item.totalPurchaseLiters.toFixed(1)} L</span>
                                        <span className="text-[11px] text-slate-500 block">{formatPKR(item.totalPurchaseAmount)}</span>
                                    </div>
                                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Gross Sales</span>
                                        <span className="font-bold text-emerald-600">{item.totalSalesLiters.toFixed(1)} L</span>
                                        <span className="text-[11px] text-slate-500 block">{formatPKR(item.salesAmount)}</span>
                                    </div>
                                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Chillar Receive</span>
                                        <span className="font-bold text-purple-600">{item.totalChillarReceiveLiters.toFixed(1)} L</span>
                                        <span className="text-[10px] text-slate-500 block">Loss: {item.dodhiLoss.toFixed(1)}L</span>
                                    </div>
                                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Chillar Loss/Gain</span>
                                        <span className={`font-bold ${chillarDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatDifference(chillarDiff)} L
                                        </span>
                                        <span className="text-[10px] text-slate-500 block">TS: {item.tsSalesLiters.toFixed(1)}L</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function DailyTotalsReport() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
            <DynamicLayout>
                <Suspense fallback={<FullPageSpinner message="Loading daily totals..." />}>
                    <DailyTotalsContent />
                </Suspense>
            </DynamicLayout>
        </ProtectedRoute>
    );
}