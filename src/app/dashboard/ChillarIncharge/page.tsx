// app/dashboard/chillarIncharge/page.tsx
'use client';
import { Milk, Warehouse, ShoppingCart, Truck, ClipboardList, Scale } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function ChillarDashboard() {
    // Sample data - replace with real data
    const [isLoading, setIsLoading] = useState(true);
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Mock data
    const totalMilkReceived = 1385; // liters (chillar receive)
    const totalSales = 275; // liters
    const yesterdayStock = 120; // liters
    const currentStock = (yesterdayStock + totalMilkReceived) - totalSales;
    const pendingTasks = 3;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <ProtectedRoute requiredRole="chillarincharge">
            <FieldStaffLayout role="chillarIncharge">
                {isLoading}

                {/* Key Metrics - Simplified for better readability */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <SummaryCard
                        title="Old Stock"
                        value={`${yesterdayStock} Ltrs`}
                        icon={<Warehouse className="w-8 h-8" />}
                        color="purple"
                        className="text-center p-4"
                    />

                    <SummaryCard
                        title="Milk Received"
                        value={`${totalMilkReceived} Ltrs`}
                        icon={<Truck className="w-8 h-8" />}
                        color="blue"
                        className="text-center p-4"
                    />

                    <SummaryCard
                        title="Milk Sold"
                        value={`${totalSales} Ltrs`}
                        icon={<ShoppingCart className="w-8 h-8" />}
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
                </div>
            </FieldStaffLayout>
        </ProtectedRoute>
    );
}