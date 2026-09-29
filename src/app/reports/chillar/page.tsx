//app/reports/chillar/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Milk,
  ShoppingCart,
  Truck,
  RefreshCw,
  Scale,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowRight,
  FileText,
  Activity,
  Clock,
  Printer
} from 'lucide-react';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { FullPageSpinner } from '@/components/ui/spinner';
import { fetchChillarInchargeDashboardStats, ChillarInchargeDashboardStats } from '@/lib/api/reports';
import { getMyChillar } from '@/lib/api/chillarReceive';

// Types for stock management
interface StockSummary {
  previousStock: number;
  totalReceived: number;
  totalSold: number;
  currentStock: number;
  deficit: number;
  surplus: number;
  totalTransactions: number;
  uniqueDodhis: number;
  uniqueBuyers: number;
}

interface StockTransaction {
  id: string;
  date: string;
  type: 'receive' | 'sale';
  quantity: number;
  rate?: number;
  party: string;
  partyType: 'dodhi' | 'buyer';
  time: string;
}

interface DailyStock {
  date: string;
  openingStock: number;
  received: number;
  sold: number;
  closingStock: number;
  deficit: number;
  surplus: number;
}

export default function ChillarReports() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'daily' | 'transactions'>('summary');
  const [dashboardStats, setDashboardStats] = useState<ChillarInchargeDashboardStats | null>(null);
  const [chillarInfo, setChillarInfo] = useState<{ chillarId: number; chillarInchargeId: number } | null>(null);

  // Mock data for additional features (until we have more APIs)
  const [additionalData] = useState({
    dailyStock: [
      { date: '2024-01-15', openingStock: 25, received: 385, sold: 365, closingStock: 45, deficit: 0, surplus: 20 },
      { date: '2024-01-14', openingStock: 15, received: 420, sold: 410, closingStock: 25, deficit: 0, surplus: 10 },
      { date: '2024-01-13', openingStock: 10, received: 395, sold: 390, closingStock: 15, deficit: 0, surplus: 5 },
      { date: '2024-01-12', openingStock: 20, received: 375, sold: 385, closingStock: 10, deficit: 10, surplus: 0 },
      { date: '2024-01-11', openingStock: 30, received: 410, sold: 420, closingStock: 20, deficit: 10, surplus: 0 },
    ],
    recentTransactions: [
      { id: '1', date: '2024-01-15', type: 'receive' as const, quantity: 45, party: 'Ramesh Kumar', partyType: 'dodhi' as const, time: '06:30' },
      { id: '2', date: '2024-01-15', type: 'sale' as const, quantity: 25, rate: 58, party: 'City Dairy Shop', partyType: 'buyer' as const, time: '08:15' },
      { id: '3', date: '2024-01-15', type: 'receive' as const, quantity: 38, party: 'Suresh Patel', partyType: 'dodhi' as const, time: '07:00' },
      { id: '4', date: '2024-01-15', type: 'sale' as const, quantity: 50, rate: 57, party: 'Local Tea Stall', partyType: 'buyer' as const, time: '09:30' },
    ]
  });

  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get chillar info if not already available
      let currentChillarInfo = chillarInfo;
      if (!currentChillarInfo) {
        currentChillarInfo = await getMyChillar();
        setChillarInfo(currentChillarInfo);
      }

      // Fetch dashboard stats with date and time filters
      const stats = await fetchChillarInchargeDashboardStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        startTimeOfDay: dateRange.startTime,
        endTimeOfDay: dateRange.endTime,
        chillarId: currentChillarInfo.chillarId,
        chillarInchargeId: currentChillarInfo.chillarInchargeId
      });

      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
      setError('Failed to load stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [dateRange]);

  const navigateToDodhiSummary = () => {
    router.push('/reports/dodhiSummary');
  };

  const navigateToReceiveReport = () => {
    router.push('/reports/chillarReceive');
  };

  const navigateToSaleReport = () => {
    router.push('/reports/sale');
  };

  const getStockStatusColor = (current: number, threshold: number = 100) => {
    if (current < threshold * 0.2) return 'text-red-600';
    if (current < threshold * 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate derived data
  const stockSummary: StockSummary = dashboardStats ? {
    previousStock: dashboardStats.previousStock,
    totalReceived: dashboardStats.totalChillarReceive,
    totalSold: dashboardStats.totalSales,
    currentStock: dashboardStats.currentStock,
    deficit: Math.max(0, (dashboardStats.previousStock + dashboardStats.totalChillarReceive) - dashboardStats.totalSales - dashboardStats.currentStock),
    surplus: Math.max(0, dashboardStats.currentStock - ((dashboardStats.previousStock + dashboardStats.totalChillarReceive) - dashboardStats.totalSales)),
    totalTransactions: 0, // Would need separate API
    uniqueDodhis: 0, // Would need separate API
    uniqueBuyers: 0 // Would need separate API
  } : {
    previousStock: 0,
    totalReceived: 0,
    totalSold: 0,
    currentStock: 0,
    deficit: 0,
    surplus: 0,
    totalTransactions: 0,
    uniqueDodhis: 0,
    uniqueBuyers: 0
  };

  if (error) {
    return (
      <ProtectedRoute requiredRole="chillarincharge">
        <FieldStaffLayout role="chillarIncharge">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-2">⚠️ Error Loading Reports</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStockData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="chillarincharge">
        <FieldStaffLayout role="chillarIncharge">
          <div className="flex items-center justify-center min-h-screen">
            <FullPageSpinner />
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="chillarincharge">
      <FieldStaffLayout role="chillarIncharge">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <PageHeader
            title="Stock & Chillar Reports"
            subtitle={`Chillar stock movement, balance reconciliation and logs${dashboardStats ? ` • Last updated: ${new Date().toLocaleTimeString()}` : ''}`}
            icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={navigateToReceiveReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Chillar Receive
                </button>
                <button
                  onClick={navigateToSaleReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Sales Report
                </button>
                <button
                  onClick={navigateToDodhiSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Dodhi Summary
                </button>
              </div>
            }
          />

          {/* Print Header */}
          <ReportPrintHeader
            title="Chillar Stock & Inventory Audit Report"
            subtitle="Chillar Stock Movement, Balance Reconciliation and Transaction Logs"
            dateRange={{ startDate: dateRange.startDate, endDate: dateRange.endDate }}
            chillarName={chillarInfo?.chillarId ? `Chillar #${chillarInfo.chillarId}` : undefined}
          />

          {/* Main Stock Summary Ribbon */}
          <StatStrip
            items={[
              {
                label: 'Opening Stock',
                value: `${stockSummary.previousStock} L`,
                color: 'default',
                icon: <Package className="w-4 h-4 text-slate-500" />,
              },
              {
                label: 'Total Received',
                value: `${stockSummary.totalReceived} L`,
                color: 'primary',
                icon: <Truck className="w-4 h-4 text-blue-600" />,
                subtext: 'From dodhis',
              },
              {
                label: 'Total Sold',
                value: `${stockSummary.totalSold} L`,
                color: 'success',
                icon: <ShoppingCart className="w-4 h-4 text-emerald-600" />,
                subtext: 'To buyers',
              },
              {
                label: 'Current Stock',
                value: `${stockSummary.currentStock} L`,
                color: stockSummary.deficit > 0 ? 'danger' : 'info',
                icon: <Milk className="w-4 h-4 text-purple-600" />,
                badge: stockSummary.deficit > 0 ? `Deficit ${stockSummary.deficit}L` : stockSummary.surplus > 0 ? `Surplus ${stockSummary.surplus}L` : undefined,
              },
            ]}
          />

          {/* Deficit/Surplus Alert */}
          {stockSummary.deficit > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Stock Deficit:</strong> {stockSummary.deficit}L shortage detected. Please verify records.</span>
            </div>
          )}
          {stockSummary.surplus > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Stock Surplus:</strong> {stockSummary.surplus}L excess stock available. Good inventory management.</span>
            </div>
          )}

          {/* Toolbar with Filters & View Switcher */}
          <CompactToolbar
            filters={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">From:</span>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <select
                    value={dateRange.startTime}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startTime: e.target.value }))}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Day</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                  <span className="text-xs text-slate-500 font-medium">To:</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <select
                    value={dateRange.endTime}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endTime: e.target.value }))}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Day</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <button
                  onClick={fetchStockData}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Apply
                </button>
              </div>
            }
            rightActions={
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveView('summary')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stock Flow
                </button>
                <button
                  onClick={() => setActiveView('daily')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeView === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daily Stock
                </button>
              </div>
            }
          />

          {/* Stock Summary View */}
          {activeView === 'summary' && (
            <TableContainer title="Stock Movement Reconciliation">
              <div className="p-4 bg-slate-50/50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Flow</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Opening Stock:</span>
                        <span className="font-semibold text-slate-900">{stockSummary.previousStock} L</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">+ Total Received:</span>
                        <span className="font-semibold text-blue-600">+{stockSummary.totalReceived} L</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">- Total Sold:</span>
                        <span className="font-semibold text-emerald-600">-{stockSummary.totalSold} L</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 text-sm">
                        <span className="font-bold text-slate-900">Closing Stock:</span>
                        <span className={`font-bold ${getStockStatusColor(stockSummary.currentStock)}`}>
                          {stockSummary.currentStock} L
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Period Information</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Start Date & Time:</span>
                        <span className="font-medium text-slate-900">{dateRange.startDate}{dateRange.startTime ? ` (${dateRange.startTime})` : ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">End Date & Time:</span>
                        <span className="font-medium text-slate-900">{dateRange.endDate}{dateRange.endTime ? ` (${dateRange.endTime})` : ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-600">Net Movement:</span>
                        <span className={`font-semibold ${stockSummary.totalReceived - stockSummary.totalSold >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stockSummary.totalReceived - stockSummary.totalSold >= 0 ? '+' : ''}{stockSummary.totalReceived - stockSummary.totalSold} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-600">Data Status:</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Real-time
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TableContainer>
          )}

          {/* Daily Stock View */}
          {activeView === 'daily' && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block print:block">
                <TableContainer title="Daily Stock Movement (Historical)">
                  <Table dense>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Date</Table.Head>
                        <Table.Head className="text-right">Opening</Table.Head>
                        <Table.Head className="text-right">Received</Table.Head>
                        <Table.Head className="text-right">Sold</Table.Head>
                        <Table.Head className="text-right">Closing</Table.Head>
                        <Table.Head className="text-right">Status</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {additionalData.dailyStock.map((day) => (
                        <Table.Row key={day.date}>
                          <Table.Cell className="font-medium text-xs text-slate-900">
                            {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Table.Cell>
                          <Table.Cell className="text-right text-xs text-slate-600">{day.openingStock}L</Table.Cell>
                          <Table.Cell className="text-right text-xs font-semibold text-blue-600">+{day.received}L</Table.Cell>
                          <Table.Cell className="text-right text-xs font-semibold text-emerald-600">-{day.sold}L</Table.Cell>
                          <Table.Cell className="text-right text-xs font-bold text-slate-900">{day.closingStock}L</Table.Cell>
                          <Table.Cell className="text-right text-xs">
                            {day.deficit > 0 ? (
                              <span className="text-rose-600 font-semibold">Deficit: {day.deficit}L</span>
                            ) : day.surplus > 0 ? (
                              <span className="text-emerald-600 font-semibold">Surplus: {day.surplus}L</span>
                            ) : (
                              <span className="text-slate-500">Balanced</span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </TableContainer>
              </div>

              {/* Mobile Card List for Daily Stock */}
              <div className="md:hidden space-y-2.5 print:hidden">
                {additionalData.dailyStock.map((day) => (
                  <div key={day.date} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-xs text-slate-900">
                        {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        day.deficit > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        day.surplus > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {day.deficit > 0 ? `Deficit: ${day.deficit}L` : day.surplus > 0 ? `Surplus: ${day.surplus}L` : 'Balanced'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Opening & Closing</span>
                        <span className="text-slate-700 block">Open: {day.openingStock}L</span>
                        <span className="font-bold text-slate-900 block">Close: {day.closingStock}L</span>
                      </div>
                      <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Movement</span>
                        <span className="font-semibold text-blue-600 block">+{day.received}L rcvd</span>
                        <span className="font-semibold text-emerald-600 block">-{day.sold}L sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <ReportPrintFooter />
            </>
          )}
        </div>
      </FieldStaffLayout>
    </ProtectedRoute>
  );
}