// app/dashboard/dodhi/page.tsx
'use client';
import { Milk, Scale, Calendar, ClipboardList, User, Bell, RefreshCw } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import Link from 'next/link';
import MilkLoader from '@/components/ui/Loader';
import { useState, useEffect } from 'react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchDodhiDashboardStats, fetchMyDodhiId, type DodhiDashboardStats } from '@/lib/api/dodhiDashboard';

export default function DodhiDashboard() {
  const { user } = useAuth();
  const [dodhiId, setDodhiId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DodhiDashboardStats>({
    totalPurchaseLiters: 0,
    totalReceivedLiters: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const loadDodhiId = async () => {
    try {
      const id = await fetchMyDodhiId();
      setDodhiId(id);
      return id;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to load your dodhi information');
    }
  };

  const loadDashboardStats = async (currentDodhiId?: number) => {
    try {
      setIsLoadingStats(true);
      setError(null);
      
      const dodhiIdToUse = currentDodhiId || dodhiId;
      if (!dodhiIdToUse) {
        throw new Error('Dodhi ID not available');
      }
      
      const stats = await fetchDodhiDashboardStats({
        startDate: today,
        endDate: today,
        dodhiId: dodhiIdToUse
      });
      
      setDashboardStats(stats);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the dodhi ID
      const fetchedDodhiId = await loadDodhiId();
      
      // Then load the dashboard stats
      await loadDashboardStats(fetchedDodhiId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize dashboard');
      console.error('Dashboard initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  const handleRefresh = () => {
    if (dodhiId) {
      loadDashboardStats();
    } else {
      initializeDashboard();
    }
  };

  // Calculate difference
  const difference = dashboardStats.totalReceivedLiters - dashboardStats.totalPurchaseLiters;

  // Format numbers with commas for better readability
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
  };

  if (error && !isLoading && !isLoadingStats) {
    return (
      <ProtectedRoute requiredRole="dodhi">
        <FieldStaffLayout role="dodhi">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-600 mb-4">
                  <Bell className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Unable to Load Dashboard</h3>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="dodhi">
        <FieldStaffLayout role="dodhi">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <MilkLoader />
              <p className="text-gray-600 mt-4">Loading dashboard...</p>
            </div>
          </div>
        </FieldStaffLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="dodhi">
      <FieldStaffLayout role="dodhi">
        {/* Header with refresh and last updated info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.username || 'Dodhi'}
            </h1>
            <p className="text-gray-600">Today's Overview - {new Date().toLocaleDateString()}</p>
            {dodhiId && (
              <p className="text-sm text-gray-500">Dodhi ID: {dodhiId}</p>
            )}
          </div>
          <div className="text-right">
            <button
              onClick={handleRefresh}
              disabled={isLoadingStats}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg flex items-center gap-2 mb-1"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Refreshing statistics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <SummaryCard
                title="Today's Purchase"
                value={`${formatNumber(dashboardStats.totalPurchaseLiters)} Ltrs`}
                icon={<Milk className="w-8 h-8" />}
                color="blue"
                className="text-center"
                subtitle="Milk purchased today"
              />
              
              <SummaryCard
                title="Chillar Received"
                value={`${formatNumber(dashboardStats.totalReceivedLiters)} Ltrs`}
                icon={<Scale className="w-8 h-8" />}
                color="green"
                className="text-center"
                subtitle="Milk received from chillar"
              />
              
              <SummaryCard
                title="Difference"
                value={`${difference >= 0 ? '+' : ''}${formatNumber(difference)} Ltrs`}
                icon={<Scale className="w-8 h-8" />}
                color={difference >= 0 ? 'yellow' : 'red'}
                className="text-center"
                subtitle={difference >= 0 ? 'Surplus' : 'Deficit'}
              />
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Purchase Rate</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats.totalPurchaseLiters > 0 
                        ? `${((dashboardStats.totalReceivedLiters / dashboardStats.totalPurchaseLiters) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                    <p className="text-sm text-gray-600">Received vs Purchased</p>
                  </div>
                  <div className="text-blue-600">
                    <Calendar className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Status</h3>
                    <p className={`text-2xl font-bold ${
                      difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {difference >= 0 ? 'Good' : 'Review'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {difference >= 0 ? 'Meeting targets' : 'Below targets'}
                    </p>
                  </div>
                  <div className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                    <User className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link
                href="/Purchase/SimplePurchase"
                className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                <Milk className="w-12 h-12 text-white" />
                <span className="text-xl font-bold text-center">Record Milk Purchase</span>
                <span className="text-blue-100 text-center">Add today's milk collection</span>
              </Link>

              <Link
                href="/reports/purchase/dodhiPurchaseReport"
                className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
              >
                <ClipboardList className="w-12 h-12 text-white" />
                <span className="text-xl font-bold text-center">View Reports</span>
                <span className="text-green-100 text-center">Check your records & analytics</span>
              </Link>
            </div>

            {/* Today's Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Purchase</p>
                  <p className="text-lg font-bold text-blue-600">{formatNumber(dashboardStats.totalPurchaseLiters)}Ltrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Received</p>
                  <p className="text-lg font-bold text-green-600">{formatNumber(dashboardStats.totalReceivedLiters)}Ltrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Difference</p>
                  <p className={`text-lg font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {difference >= 0 ? '+' : ''}{formatNumber(difference)}Ltrs
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-lg font-bold text-purple-600">
                    {dashboardStats.totalPurchaseLiters > 0 
                      ? `${((dashboardStats.totalReceivedLiters / dashboardStats.totalPurchaseLiters) * 100).toFixed(0)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </FieldStaffLayout>
    </ProtectedRoute>
  );
}