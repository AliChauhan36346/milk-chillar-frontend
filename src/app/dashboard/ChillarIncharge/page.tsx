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
    const totalMilkReceived = 385; // liters (chillar receive)
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
            <div className="grid grid-cols-2 gap-3 mb-6">
                <SummaryCard
                    title="Milk Received"
                    value={`${totalMilkReceived} L`}
                    icon={<Truck className="w-8 h-8" />}
                    color="blue"
                    className="text-center p-4"
                    titleSize="text-lg"
                    valueSize="text-2xl"
                />
                
                <SummaryCard
                    title="Milk Sold"
                    value={`${totalSales} L`}
                    icon={<ShoppingCart className="w-8 h-8" />}
                    color="green"
                    className="text-center p-4"
                    titleSize="text-lg"
                    valueSize="text-2xl"
                />
                
                <SummaryCard
                    title="Old Stock"
                    value={`${yesterdayStock} L`}
                    icon={<Warehouse className="w-8 h-8" />}
                    color="purple"
                    className="text-center p-4"
                    titleSize="text-lg"
                    valueSize="text-2xl"
                />
                
                <SummaryCard
                    title="Current Stock"
                    value={`${currentStock} L`}
                    icon={<Scale className="w-8 h-8" />}
                    color={currentStock >= 0 ? 'yellow' : 'red'}
                    className="text-center p-4"
                    titleSize="text-lg"
                    valueSize="text-2xl"
                />
            </div>

            {/* Big Action Buttons */}
            <div className="space-y-4 mb-8">
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
                    href="/Stock"   
                    className="block p-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all"
                >
                    <div className="flex items-center justify-center gap-3">
                        <Warehouse className="w-8 h-8 text-white" />
                        <span className="text-xl font-bold">Check Milk Stock</span>
                    </div>
                    <p className="text-purple-100 text-center mt-2">View current milk quantity</p>
                </Link>
            </div>

            {/* Pending Tasks - Simplified */}
            {/* <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-orange-500" />
                    <span>Pending Work ({pendingTasks})</span>
                </h2>
                
                <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="font-bold">Complete Milk Collection</p>
                        <p className="text-sm">2 dodhis remaining</p>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <p className="font-bold">Record Evening Sales</p>
                        <p className="text-sm">3 buyers remaining</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="font-bold">Check Milk Stock</p>
                        <p className="text-sm">Verify today's quantity</p>
                    </div>
                </div>
            </div> */}
        </FieldStaffLayout>
        </ProtectedRoute>
    );
}