// app/dashboard/chillar/page.tsx
'use client';
import { Milk, Warehouse, ShoppingCart, Truck, Bell, User, Home, ClipboardList, Scale } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import Link from 'next/link';
import MilkLoader from '@/components/ui/Loader';
import { useState, useEffect } from 'react';

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
    const notifications = 2;
    const pendingTasks = 3;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {isLoading && <MilkLoader />}
            
            {/* Header Section */}
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">Chillar Incharge Dashboard</h1>
                        <p className="text-gray-600">Today is {today}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <Bell className="w-5 h-5 text-gray-600" />
                            {notifications > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notifications}
                                </span>
                            )}
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="hidden sm:inline font-medium">Chillar Incharge</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-4 pb-20">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <SummaryCard
                        title="Total Milk Received"
                        value={`${totalMilkReceived} Ltrs`}
                        icon={<Truck className="w-6 h-6" />}
                        color="blue"
                        className="text-center"
                    />
                    
                    <SummaryCard
                        title="Total Sales"
                        value={`${totalSales} Ltrs`}
                        icon={<ShoppingCart className="w-6 h-6" />}
                        color="green"
                        className="text-center"
                    />
                    
                    <SummaryCard
                        title="Yesterday's Stock"
                        value={`${yesterdayStock} Ltrs`}
                        icon={<Warehouse className="w-6 h-6" />}
                        color="purple"
                        className="text-center"
                    />
                    
                    <SummaryCard
                        title="Current Stock"
                        value={`${currentStock} Ltrs`}
                        icon={<Scale className="w-6 h-6" />}
                        color={currentStock >= 0 ? 'yellow' : 'red'}
                        className="text-center"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link 
                        href="/ChilarReceive" 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 shadow-md transition-all flex flex-col items-center justify-center gap-3"
                    >
                        <Truck className="w-10 h-10 text-white" />
                        <span className="text-lg font-bold text-center">Record Chillar Receive</span>
                        <span className="text-blue-100 text-center text-sm">Add today's milk collection from dodhis</span>
                    </Link>

                    <Link 
                        href="/Sales" 
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 shadow-md transition-all flex flex-col items-center justify-center gap-3"
                    >
                        <ShoppingCart className="w-10 h-10 text-white" />
                        <span className="text-lg font-bold text-center">Record Sales</span>
                        <span className="text-green-100 text-center text-sm">Add milk sales to buyers</span>
                    </Link>

                    <Link 
                        href="/Stock"   
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 shadow-md transition-all flex flex-col items-center justify-center gap-3"
                    >
                        <Warehouse className="w-10 h-10 text-white" />
                        <span className="text-lg font-bold text-center">View Stock</span>
                        <span className="text-purple-100 text-center text-sm">Check current milk stock</span>
                    </Link>
                </div>

                {/* Pending Tasks & Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pending Tasks */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <ClipboardList className="w-5 h-5" />
                            Pending Tasks ({pendingTasks})
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex items-center p-3 bg-yellow-50 rounded-lg gap-3 border border-yellow-100">
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <Truck className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Complete Chillar Receive</p>
                                    <p className="text-sm text-gray-600">2 dodhis pending for today</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-red-50 rounded-lg gap-3 border border-red-100">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <ShoppingCart className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Record Evening Sales</p>
                                    <p className="text-sm text-gray-600">3 buyers remaining</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-blue-50 rounded-lg gap-3 border border-blue-100">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Scale className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Stock Reconciliation</p>
                                    <p className="text-sm text-gray-600">Verify today's stock</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <ClipboardList className="w-5 h-5" />
                            Recent Activity
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex items-center p-3 bg-green-50 rounded-lg gap-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Morning Sales Recorded</p>
                                    <p className="text-sm text-gray-600">175 liters to 5 buyers</p>
                                    <p className="text-xs text-gray-500">Today, 9:30 AM</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-blue-50 rounded-lg gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Chillar Received</p>
                                    <p className="text-sm text-gray-600">385 liters from 8 dodhis</p>
                                    <p className="text-xs text-gray-500">Today, 7:15 AM</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-purple-50 rounded-lg gap-3">
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <Warehouse className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Stock Updated</p>
                                    <p className="text-sm text-gray-600">Closing stock: 230 liters</p>
                                    <p className="text-xs text-gray-500">Yesterday, 8:45 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 md:hidden">
                <Link href="/dashboard/chillar" className="flex flex-col items-center text-blue-600">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Home className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/chillar/receive" className="flex flex-col items-center text-gray-500">
                    <Truck className="w-5 h-5" />
                    <span className="text-xs mt-1">Receive</span>
                </Link>
                <Link href="/sales" className="flex flex-col items-center text-gray-500">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-xs mt-1">Sales</span>
                </Link>
                <Link href="/stock" className="flex flex-col items-center text-gray-500">
                    <Warehouse className="w-5 h-5" />
                    <span className="text-xs mt-1">Stock</span>
                </Link>
            </nav>
        </div>
    );
}