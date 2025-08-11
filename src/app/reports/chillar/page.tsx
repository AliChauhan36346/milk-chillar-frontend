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
  Activity
} from 'lucide-react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import SummaryCard from '@/components/ui/SummaryCard';
import { BackButton } from '@/components/ui/BackButton';
import MilkLoader from '@/components/ui/Loader';

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
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'summary' | 'daily' | 'transactions'>('summary');

  // Mock data - replace with actual API calls
  const [stockData, setStockData] = useState<{
    summary: StockSummary;
    dailyStock: DailyStock[];
    recentTransactions: StockTransaction[];
  }>({
    summary: {
      previousStock: 150,
      totalReceived: 2845,
      totalSold: 2720,
      currentStock: 275,
      deficit: 0,
      surplus: 125,
      totalTransactions: 156,
      uniqueDodhis: 15,
      uniqueBuyers: 8
    },
    dailyStock: [
      { date: '2024-01-15', openingStock: 25, received: 385, sold: 365, closingStock: 45, deficit: 0, surplus: 20 },
      { date: '2024-01-14', openingStock: 15, received: 420, sold: 410, closingStock: 25, deficit: 0, surplus: 10 },
      { date: '2024-01-13', openingStock: 10, received: 395, sold: 390, closingStock: 15, deficit: 0, surplus: 5 },
      { date: '2024-01-12', openingStock: 20, received: 375, sold: 385, closingStock: 10, deficit: 10, surplus: 0 },
      { date: '2024-01-11', openingStock: 30, received: 410, sold: 420, closingStock: 20, deficit: 10, surplus: 0 },
    ],
    recentTransactions: [
      { id: '1', date: '2024-01-15', type: 'receive', quantity: 45, party: 'Ramesh Kumar', partyType: 'dodhi', time: '06:30' },
      { id: '2', date: '2024-01-15', type: 'sale', quantity: 25, rate: 58, party: 'City Dairy Shop', partyType: 'buyer', time: '08:15' },
      { id: '3', date: '2024-01-15', type: 'receive', quantity: 38, party: 'Suresh Patel', partyType: 'dodhi', time: '07:00' },
      { id: '4', date: '2024-01-15', type: 'sale', quantity: 50, rate: 57, party: 'Local Tea Stall', partyType: 'buyer', time: '09:30' },
    ]
  });

  useEffect(() => {
    const loadStockData = async () => {
      setLoading(true);
      // Replace with actual API calls based on dateRange
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };

    loadStockData();
  }, [dateRange]);

  const handleExportData = () => {
    // Implement export functionality
    alert('Export functionality would be implemented here');
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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
              <div className="flex items-end">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Stock Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              title="Previous Stock"
              value={`${stockData.summary.previousStock}L`}
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
                value={`${stockData.summary.totalReceived}L`}
                icon={<Truck className="w-6 h-6" />}
                color="blue"
                subtitle="Received from dodhis"
                showArrow
              />
            </div>

            <div 
              onClick={navigateToSaleReport}
              className="cursor-pointer transform hover:scale-105 transition-transform"
            >
              <SummaryCard
                title="Total Sold"
                value={`${stockData.summary.totalSold}L`}
                icon={<ShoppingCart className="w-6 h-6" />}
                color="green"
                subtitle="Sold to buyers"
                showArrow
              />
            </div>

            <SummaryCard
              title="Current Stock"
              value={`${stockData.summary.currentStock}L`}
              icon={<Milk className="w-6 h-6" />}
              color="purple"
              subtitle="Available now"
            />
          </div>

          {/* Deficit/Surplus Alert */}
          <div className="grid md:grid-cols-2 gap-4">
            {stockData.summary.deficit > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Stock Deficit</h3>
                    <p className="text-red-600">{stockData.summary.deficit}L shortage detected</p>
                    <p className="text-sm text-red-500 mt-1">Please verify stock records and investigate discrepancies</p>
                  </div>
                </div>
              </div>
            )}

            {stockData.summary.surplus > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Stock Surplus</h3>
                    <p className="text-green-600">{stockData.summary.surplus}L excess stock available</p>
                    <p className="text-sm text-green-500 mt-1">Good inventory management</p>
                  </div>
                </div>
              </div>
            )}

            {stockData.summary.deficit === 0 && stockData.summary.surplus === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Scale className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Perfect Balance</h3>
                    <p className="text-blue-600">Stock levels are perfectly balanced with no surplus or deficit</p>
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
                className="flex items-center justify-between p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
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
                            <span className="font-medium text-gray-900">{stockData.summary.previousStock}L</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">+ Total Received:</span>
                            <span className="font-medium text-blue-600">+{stockData.summary.totalReceived}L</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">- Total Sold:</span>
                            <span className="font-medium text-green-600">-{stockData.summary.totalSold}L</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-medium text-gray-900">Closing Stock:</span>
                            <span className={`font-bold ${getStockStatusColor(stockData.summary.currentStock)}`}>
                              {stockData.summary.currentStock}L
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Activity Overview</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Transactions:</span>
                            <span className="font-medium text-purple-600">{stockData.summary.totalTransactions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Dodhis:</span>
                            <span className="font-medium text-blue-600">{stockData.summary.uniqueDodhis}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Active Buyers:</span>
                            <span className="font-medium text-green-600">{stockData.summary.uniqueBuyers}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Period:</span>
                            <span className="font-medium text-gray-600">
                              {stockData.dailyStock.length} days
                            </span>
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
                  <h3 className="text-lg font-semibold">Daily Stock Movement</h3>
                  
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
                        {stockData.dailyStock.map((day) => (
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