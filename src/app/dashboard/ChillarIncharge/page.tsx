
// app/dashboard/chillarIncharge/page.tsx
'use client';
import { Milk, Warehouse, ShoppingCart, Truck, ClipboardList, Scale, Bike } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { fetchChillarInchargeDashboardStats, ChillarInchargeDashboardStats } from '@/lib/api/reports';
import { getMyChillar } from '@/lib/api/chillarReceive';
import MilkLoader from '@/components/ui/Loader';

export default function ChillarDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState<ChillarInchargeDashboardStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Helper function to format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Get current employee's chillar and incharge IDs
                const { chillarId, chillarInchargeId } = await getMyChillar();

                // Set date range for today
                const currentDate = new Date();
                const startDate = formatDate(currentDate);
                const endDate = formatDate(currentDate);

                // Fetch dashboard stats
                const stats = await fetchChillarInchargeDashboardStats({
                    startDate,
                    endDate,
                    chillarId,
                    chillarInchargeId
                });

                setDashboardStats(stats);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Use API data if available, otherwise fall back to mock data
    const previousStock = dashboardStats?.previousStock ?? 0;
    const totalMilkReceived = dashboardStats?.totalChillarReceive ?? 0;
    const totalSales = dashboardStats?.totalSales ?? 0;
    const currentStock = dashboardStats?.currentStock ?? 0;

    const pendingTasks = 3; // This might need a separate API call

    if (error) {
        return (
            <ProtectedRoute requiredRole="chillarincharge">
                <FieldStaffLayout role="chillarIncharge">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-600 text-lg mb-2">⚠️ Error Loading Dashboard</div>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
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

    return (
        <ProtectedRoute requiredRole="chillarincharge">
            <FieldStaffLayout role="chillarIncharge">
                {isLoading && (
                    <MilkLoader/>
                )}

                {!isLoading && (
                    <>
                        {/* Header with date */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                            <p className="text-gray-600">{today}</p>
                        </div>

                        {/* Key Metrics - Simplified for better readability */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <SummaryCard
                                title="Previous Stock"
                                value={`${previousStock} Ltrs`}
                                icon={<Warehouse className="w-8 h-8" />}
                                color="purple"
                                className="text-center p-4"
                            />

                            <SummaryCard
                                title="Milk Received"
                                value={`${totalMilkReceived} Ltrs`}
                                icon={<Bike className="w-8 h-8" />}
                                color="blue"
                                className="text-center p-4"
                            />

                            <SummaryCard
                                title="Milk Sold"
                                value={`${totalSales} Ltrs`}
                                icon={<Truck className="w-8 h-8" />}
                                color="green"
                                className="text-center p-4"
                            />

                            <SummaryCard
                                title="Current Stock"
                                value={`${currentStock} Ltrs`}
                                icon={<Scale className="w-8 h-8" />}
                                color={currentStock >= 0 ? 'yellow' : 'red'}
                                className="text-center p-4"
                            />
                        </div>

                        {/* Stock Status Alert */}
                        {currentStock < 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="text-red-600 mr-3">⚠️</div>
                                    <div>
                                        <h3 className="text-red-800 font-medium">Negative Stock Alert</h3>
                                        <p className="text-red-600 text-sm">Current stock is negative. Please review your records.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Big Action Buttons */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 mb-8 gap-3">
                            <Link
                                href="/chillarReceive"
                                className="block p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Truck className="w-8 h-8 text-white" />
                                    <span className="text-xl font-bold">Record Milk Collection</span>
                                </div>
                                <p className="text-blue-100 text-center mt-2">Add today's milk from dodhis</p>
                            </Link>

                            <Link
                                href="/Sales"
                                className="block p-5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <ShoppingCart className="w-8 h-8 text-white" />
                                    <span className="text-xl font-bold">Record Milk Sales</span>
                                </div>
                                <p className="text-green-100 text-center mt-2">Add milk sold to buyers</p>
                            </Link>

                            <Link
                                href="/reports/chillar"
                                className="block p-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Warehouse className="w-8 h-8 text-white" />
                                    <span className="text-xl font-bold">Check Milk Stock</span>
                                </div>
                                <p className="text-purple-100 text-center mt-2">View current milk quantity</p>
                            </Link>

                            {/* Add Reports Button */}
                            <Link
                                href="/reports/chillarReceive"
                                className="block p-5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-md transition-all"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <ClipboardList className="w-8 h-8 text-white" />
                                    <span className="text-xl font-bold">Chillar Receive Report</span>
                                </div>
                                <p className="text-gray-100 text-center mt-2">View Receive Records of Chillar</p>
                            </Link>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Today's Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{totalMilkReceived}</div>
                                    <div className="text-gray-600">Liters Received</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{totalSales}</div>
                                    <div className="text-gray-600">Liters Sold</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${currentStock >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {currentStock}
                                    </div>
                                    <div className="text-gray-600">Current Stock</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </FieldStaffLayout>
        </ProtectedRoute>
    );
}