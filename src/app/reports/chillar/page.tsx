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
  Download,
  RefreshCw,
  Scale,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowRight,
  FileText,
  Activity,
  Clock
} from 'lucide-react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import MilkLoader from '@/components/ui/Loader';
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

  const handleExportData = () => {
    if (!dashboardStats) {
      alert('No data to export');
      return;
    }
    
    // Create CSV data
    const csvData = [
      ['Metric', 'Value (Liters)'],
      ['Previous Stock', dashboardStats.previousStock.toString()],
      ['Total Received', dashboardStats.totalChillarReceive.toString()],
      ['Total Sold', dashboardStats.totalSales.toString()],
      ['Current Stock', dashboardStats.currentStock.toString()],
      ['Period', `${dateRange.startDate}${dateRange.startTime ? ` (${dateRange.startTime})` : ''} to ${dateRange.endDate}${dateRange.endTime ? ` (${dateRange.endTime})` : ''}`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chillar-stock-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <MilkLoader />
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="chillarincharge">
      <FieldStaffLayout role="chillarIncharge">
        <div className="max-w-6xl mx-auto p-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Stock Reports</h1>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={!dashboardStats}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Date and Time Range Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Filter by Date & Time Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Start Time
                </label>
                <select
                  value={dateRange.startTime}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Day</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  End Time
                </label>
                <select
                  value={dateRange.endTime}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Day</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchStockData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Apply Filter
              </button>
            </div>
          </div>

          {/* Data Status Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Activity className="w-4 h-4" />
              <span>
                Showing data from {dateRange.startDate}{dateRange.startTime ? ` (${dateRange.startTime})` : ''} to {dateRange.endDate}{dateRange.endTime ? ` (${dateRange.endTime})` : ''}
                {dashboardStats && ` • Last updated: ${new Date().toLocaleTimeString()}`}
              </span>
            </div>
          </div>

          {/* Main Stock Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Previous Stock"
              value={`${stockSummary.previousStock}L`}
              icon={<Package className="w-6 h-6" />}
              color="gray"
              subtitle="Opening balance"
            />
            
            <div 
              onClick={navigateToReceiveReport}
              className="cursor-pointer transform hover:scale-105 transition-transform"
            >
              <SummaryCard
                title="Total Received"
                value={`${stockSummary.totalReceived}L`}
                icon={<Truck className="w-6 h-6" />}
                color="blue"
                subtitle="Received from dodhis"
                
              />
            </div>

            <div 
              onClick={navigateToSaleReport}
              className="cursor-pointer transform hover:scale-105 transition-transform"
            >
              <SummaryCard
                title="Total Sold"
                value={`${stockSummary.totalSold}L`}
                icon={<ShoppingCart className="w-6 h-6" />}
                color="green"
                subtitle="Sold to buyers"
                
              />
            </div>

            <SummaryCard
              title="Current Stock"
              value={`${stockSummary.currentStock}L`}
              icon={<Milk className="w-6 h-6" />}
              color="purple"
              subtitle="Available now"
            />
          </div>

          {/* Deficit/Surplus Alert */}
          <div className="grid md:grid-cols-2 gap-4">
            {stockSummary.deficit > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Stock Deficit</h3>
                    <p className="text-red-600">{stockSummary.deficit}L shortage detected</p>
                    <p className="text-sm text-red-500 mt-1">Please verify stock records and investigate discrepancies</p>
                  </div>
                </div>
              </div>
            )}

            {stockSummary.surplus > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Stock Surplus</h3>
                    <p className="text-green-600">{stockSummary.surplus}L excess stock available</p>
                    <p className="text-sm text-green-500 mt-1">Good inventory management</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={navigateToReceiveReport}
                className="flex items-center justify-between p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Chillar Receive Report</h4>
                    <p className="text-sm text-gray-500">View detailed milk receipts</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </button>

              <button
                onClick={navigateToSaleReport}
                className="flex items-center justify-between p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Sales Report</h4>
                    <p className="text-sm text-gray-500">View detailed sales records</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600" />
              </button>

              <button
                onClick={handleExportData}
                disabled={!dashboardStats}
                className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Export Data</h4>
                    <p className="text-sm text-gray-500">Download stock report</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation for Additional Views */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'summary', label: 'Stock Summary', icon: Package },
                  { key: 'daily', label: 'Daily Stock', icon: Calendar },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeView === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Stock Summary View */}
              {activeView === 'summary' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Stock Movement Summary</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Stock Flow</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Opening Stock:</span>
                            <span className="font-medium text-gray-900">{stockSummary.previousStock}L</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">+ Total Received:</span>
                            <span className="font-medium text-blue-600">+{stockSummary.totalReceived}L</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">- Total Sold:</span>
                            <span className="font-medium text-green-600">-{stockSummary.totalSold}L</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-900">Closing Stock:</span>
                            <span className={`font-bold ${getStockStatusColor(stockSummary.currentStock)}`}>
                              {stockSummary.currentStock}L
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Period Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Start Date & Time:</span>
                            <span className="font-medium text-gray-900">{dateRange.startDate}{dateRange.startTime ? ` (${dateRange.startTime})` : ''}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">End Date & Time:</span>
                            <span className="font-medium text-gray-900">{dateRange.endDate}{dateRange.endTime ? ` (${dateRange.endTime})` : ''}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Net Movement:</span>
                            <span className={`font-medium ${stockSummary.totalReceived - stockSummary.totalSold >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stockSummary.totalReceived - stockSummary.totalSold >= 0 ? '+' : ''}{stockSummary.totalReceived - stockSummary.totalSold}L
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Data Status:</span>
                            <span className="font-medium text-green-600">Real-time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Stock View */}
              {activeView === 'daily' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Daily Stock Movement</h3>
                    <span className="text-sm text-gray-500">Historical data (sample)</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Opening</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Received</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sold</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Closing</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {additionalData.dailyStock.map((day) => (
                          <tr key={day.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{day.openingStock}L</td>
                            <td className="px-4 py-3 text-sm text-blue-600">+{day.received}L</td>
                            <td className="px-4 py-3 text-sm text-green-600">-{day.sold}L</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{day.closingStock}L</td>
                            <td className="px-4 py-3 text-sm">
                              {day.deficit > 0 ? (
                                <span className="text-red-600 font-medium">Deficit: {day.deficit}L</span>
                              ) : day.surplus > 0 ? (
                                <span className="text-green-600 font-medium">Surplus: {day.surplus}L</span>
                              ) : (
                                <span className="text-blue-600">Balanced</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FieldStaffLayout>
    </ProtectedRoute>
  );
}