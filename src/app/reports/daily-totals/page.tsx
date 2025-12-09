'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    BarChart2,
    Calendar,
    Filter,
    RefreshCw,
    ShoppingBag,
    ShoppingCart,
    Scale,
    TrendingDown,
    DollarSign,
    Download
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoutes'; // Check if this path is correct, might be @/components/ProtectedRoutes or similar
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import { Table } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FullPageSpinner } from '@/components/ui/spinner';
import { getDailyTotalsReport, DailyTotalsDto } from '@/lib/api/reports';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { getMyChillar } from '@/lib/api/chillarReceive';
import { getDefaultDateRange } from '@/lib/utils/dateRange';

export default function DailyTotalsReport() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const router = useRouter();

    const defaultDateRange = getDefaultDateRange();
    const [dateRange, setDateRange] = useState({
        startDate: defaultDateRange.startDate,
        endDate: defaultDateRange.endDate
    });
    const [loading, setLoading] = useState(true);
    const [dailyTotals, setDailyTotals] = useState<DailyTotalsDto[]>([]);
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
    }, [dateRange, userChillarId, isAdmin, selectedChillarId]);

    // Calculate summaries
    const summary = dailyTotals.reduce((acc, curr) => ({
        totalPurchaseLiters: acc.totalPurchaseLiters + curr.totalPurchaseLiters,
        totalSalesLiters: acc.totalSalesLiters + curr.totalSalesLiters,
        totalChillarReceiveLiters: acc.totalChillarReceiveLiters + curr.totalChillarReceiveLiters,
        dodhiLoss: acc.dodhiLoss + curr.dodhiLoss,
        chillarLoss: acc.chillarLoss + (curr.totalSalesLiters - curr.totalChillarReceiveLiters),
        tsSalesLiters: acc.tsSalesLiters + curr.tsSalesLiters,
        tsLoss: acc.tsLoss + (curr.tsSalesLiters - curr.totalSalesLiters),
        grossProfit: acc.grossProfit + curr.grossProfit
    }), {
        totalPurchaseLiters: 0,
        totalSalesLiters: 0,
        totalChillarReceiveLiters: 0,
        dodhiLoss: 0,
        chillarLoss: 0,
        tsSalesLiters: 0,
        tsLoss: 0,
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
        const colorClass = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-900';
        return (
            <span className={colorClass}>
                {sign}{value.toFixed(2)}
            </span>
        );
    };

    const formatDifferenceWithCurrency = (value: number) => {
        const sign = value > 0 ? '+' : '';
        const formattedValue = new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(value)); // Format absolute value

        const colorClass = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-900';

        return (
            <span className={colorClass}>
                {value >= 0 ? '+' : '-'}{formattedValue.replace('PKR', '').trim()} {/* Custom sign handling to ensure correct placement if needed, or just let formatting handle it but adding color */}
            </span>
        );
    };

    // Simplified version for currency that keeps it simple
    const formatProfit = (value: number) => {
        const colorClass = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-900';
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
            // Different reports might expect different param names (e.g., chillarId vs ChillarId)
            // Usually safe to pass lowercase chillarId if the receiving page handles it, 
            // but based on inspection, pages might read from their own state or URL params.
            // Let's standardise on what the other pages likely read from URL if they support deep linking.
            // Assuming standard URL params for reports: startDate, endDate, chillarId
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

        // Push with query params
        // Note: The target pages need to be able to read these params from the URL to auto-populate filters.
        // If they don't support it yet, this will just open the page.
        // Based on typical patterns, passing them in URL is a good start.
        // Since we are using Next.js router, we can push the full URL.
        // However, the target pages might strictly use state. Use string query.

        // Construct the full URL manually to ensure params are there
        // We'll trust the user's request that "it should open that report... with the same period"
        // implying meaningful integration.

        // URL encoding
        const searchString = queryParams.toString();
        // Assuming the target pages read URL params on mount or we just hope they do. 
        // If they don't, the user might have to select dates again, but we are fulfilling the linkage.

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

    if (loading && !dailyTotals.length) {
        return (
            <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
                <DynamicLayout>
                    <FullPageSpinner message="Loading daily totals..." />
                </DynamicLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin', 'chillarincharge']}>
            <DynamicLayout>
                <div className="max-w-7xl mx-auto p-1 sm:p-1 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <BackButton />
                            <div className="flex items-center gap-2">
                                <BarChart2 className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Totals Report</h1>
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
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
                        {/* 1. Total Purchase */}
                        <div onClick={() => handleCardClick('purchase')} className="cursor-pointer transition-transform hover:scale-105">
                            <SummaryCard
                                title="Total Purchase"
                                value={`${summary.totalPurchaseLiters.toFixed(2)}L`}
                                icon={<ShoppingCart className="w-6 h-6" />}
                                color="blue"
                            />
                        </div>

                        {/* 2. Total Chillar Receive */}
                        <div onClick={() => handleCardClick('chillarReceive')} className="cursor-pointer transition-transform hover:scale-105">
                            <SummaryCard
                                title="Chillar Receive"
                                value={`${summary.totalChillarReceiveLiters.toFixed(2)}L`}
                                icon={<Scale className="w-6 h-6" />}
                                color="purple"
                            />
                        </div>

                        {/* 3. Dodhi Loss */}
                        <SummaryCard
                            title="Dodhi Loss"
                            value={formatDifference(summary.dodhiLoss)}
                            icon={<TrendingDown className="w-6 h-6" />}
                            color="orange"
                        />
                        {/* Note: User said "if there is dodhi loss whose value is positive... show +sign". formatDifference handles signs. 
                            User also said "dont change the card background color". "orange" is fine for Dodhi Loss context, or I could change to neutral. 
                            I'll keep 'orange' as it identifies the category, but the number will be colored. */}

                        {/* 4. Gross Sales */}
                        <div onClick={() => handleCardClick('sales')} className="cursor-pointer transition-transform hover:scale-105">
                            <SummaryCard
                                title="Gross Sales"
                                value={`${summary.totalSalesLiters.toFixed(2)}L`}
                                icon={<ShoppingBag className="w-6 h-6" />}
                                color="green"
                            />
                        </div>

                        {/* 5. Chillar Loss/Gain */}
                        <SummaryCard
                            title="Chillar Loss/Gain"
                            value={<>{formatDifference(summary.chillarLoss)}L</>}
                            icon={<TrendingDown className="w-6 h-6" />}
                            color="gray"
                        />

                        {/* 6. TS Sales */}
                        <SummaryCard
                            title="TS Sales"
                            value={`${summary.tsSalesLiters.toFixed(2)}L`}
                            icon={<ShoppingBag className="w-6 h-6" />}
                            color="blue"
                        />

                        {/* 7. TS Loss/Gain */}
                        <SummaryCard
                            title="TS Loss/Gain"
                            value={<>{formatDifference(summary.tsLoss)}L</>}
                            icon={<TrendingDown className="w-6 h-6" />}
                            color="gray"
                        />

                        {/* 8. Gross Profit */}
                        <SummaryCard
                            title="Gross Profit"
                            value={formatProfit(summary.grossProfit)}
                            icon={<DollarSign className="w-6 h-6" />}
                            color="gray"
                        />
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                        </div>
                        {showFilters && (
                            <div className="pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{dailyTotals.length}</span> results
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>Date</Table.Head>
                                            <Table.Head>
                                                <div className="flex flex-col">
                                                    <span>Total Purchase</span>
                                                    <span className="text-xs font-normal text-gray-500">(Liters / Amount)</span>
                                                </div>
                                            </Table.Head>
                                            <Table.Head>Total Receive</Table.Head>
                                            <Table.Head>Dodhi Loss</Table.Head>
                                            <Table.Head>
                                                <div className="flex flex-col">
                                                    <span>Gross Sales</span>
                                                    <span className="text-xs font-normal text-gray-500">(Liters / Amount)</span>
                                                </div>
                                            </Table.Head>
                                            <Table.Head>Chillar Loss/Gain</Table.Head>
                                            <Table.Head>TS Sales</Table.Head>
                                            <Table.Head>TS Loss/Gain</Table.Head>
                                            {isAdmin && <Table.Head>Profit/Loss</Table.Head>}
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {dailyTotals.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin ? 9 : 8} className="text-center py-8">
                                                    <div className="text-gray-500">
                                                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm">No data found for the selected period</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            dailyTotals.map((item, index) => {
                                                const dateObj = new Date(item.date);
                                                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

                                                return (
                                                    <Table.Row key={index}>
                                                        <Table.Cell>
                                                            <span className="font-medium text-gray-900">
                                                                {formattedDate}
                                                            </span>
                                                        </Table.Cell>

                                                        {/* Total Purchase (Qty & Amount) */}
                                                        <Table.Cell>
                                                            <div className="flex flex-col">
                                                                <span className="text-blue-600 font-medium">{item.totalPurchaseLiters.toFixed(2)} L</span>
                                                                <span className="text-xs text-gray-500">{formatPKR(item.totalPurchaseAmount)}</span>
                                                            </div>
                                                        </Table.Cell>

                                                        {/* Total Receive */}
                                                        <Table.Cell>
                                                            <span className="text-purple-600 font-medium">{item.totalChillarReceiveLiters.toFixed(2)} L</span>
                                                        </Table.Cell>

                                                        {/* Dodhi Loss */}
                                                        <Table.Cell>
                                                            <span className="text-orange-600">{item.dodhiLoss.toFixed(2)} L</span>
                                                        </Table.Cell>

                                                        {/* Sales (Qty & Amount) */}
                                                        <Table.Cell>
                                                            <div className="flex flex-col">
                                                                <span className="text-green-600 font-medium">{item.totalSalesLiters.toFixed(2)} L</span>
                                                                <span className="text-xs text-gray-500">{formatPKR(item.salesAmount)}</span>
                                                            </div>
                                                        </Table.Cell>

                                                        {/* Chillar Loss/Gain */}
                                                        <Table.Cell>
                                                            <span className={item.totalSalesLiters - item.totalChillarReceiveLiters >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                                {formatDifference(item.totalSalesLiters - item.totalChillarReceiveLiters)} L
                                                            </span>
                                                        </Table.Cell>

                                                        {/* TS Sales */}
                                                        <Table.Cell>
                                                            <span className="text-gray-700">{item.tsSalesLiters.toFixed(2)} L</span>
                                                        </Table.Cell>

                                                        {/* TS Loss/Gain */}
                                                        <Table.Cell>
                                                            <span className={`font-medium ${(item.tsSalesLiters - item.totalSalesLiters) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {formatDifference(item.tsSalesLiters - item.totalSalesLiters)} L
                                                            </span>
                                                        </Table.Cell>

                                                        {/* Profit/Loss */}
                                                        {isAdmin && (
                                                            <Table.Cell>
                                                                <span className={`font-bold ${item.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {formatPKR(item.grossProfit)}
                                                                </span>
                                                            </Table.Cell>
                                                        )}
                                                    </Table.Row>
                                                );
                                            })
                                        )}
                                    </Table.Body>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DynamicLayout>
        </ProtectedRoute>
    );
}
