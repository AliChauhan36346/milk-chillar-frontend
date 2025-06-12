// app/dashboard/dodhi/page.tsx
'use client';
import { Milk, Scale, Calendar, ClipboardList, User, Bell } from 'lucide-react';
import SummaryCard from '@/components/ui/SummaryCard';
import Link from 'next/link';
import MilkLoader from '@/components/ui/Loader';
import { useState, useEffect } from 'react';
import { FieldStaffLayout } from '@/components/layouts/FieldStaffLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function DodhiDashboard() {
    // Sample data - replace with real data
    const dodhiName = "Mehar Dodhi";
    const todayPurchase = 42; // liters
    const todayChillar = 38; // liters
    const difference = todayChillar - todayPurchase;
    const lastPurchaseDate = '2023-06-15';
    const pendingPayments = 2;
    const notifications = 1;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000); // Simulate loading
        return () => clearTimeout(timer);
    }, []);

    return (
        <ProtectedRoute requiredRole="dodhi">
        <FieldStaffLayout role="dodhi">
            {isLoading}
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <SummaryCard
                    title="Today's Milk"
                    value={`${todayPurchase} Ltrs`}
                    icon={<Milk className="w-8 h-8" />}
                    color="blue"
                    className="text-center"
                />
                
                <SummaryCard
                    title="Chillar Received"
                    value={`${todayChillar} Ltrs`}
                    icon={<Scale className="w-8 h-8" />}
                    color="green"
                    className="text-center"
                />
                
                <SummaryCard
                    title="Difference"
                    value={`${difference >= 0 ? '+' : ''}${difference} Ltrs`}
                    icon={<Scale className="w-8 h-8" />}
                    color={difference >= 0 ? 'yellow' : 'red'}
                    className="text-center"
                />
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link 
                    href="/Purchase/SimplePurchase" 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 shadow-md transition-all flex flex-col items-center justify-center gap-3"
                >
                    <Milk className="w-12 h-12 text-white" />
                    <span className="text-xl font-bold text-center">Record Milk Purchase</span>
                    <span className="text-blue-100 text-center">Add today's milk collection</span>
                </Link>

                <Link 
                    href="/reports/purchase/dodhiPurchaseReport" 
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 shadow-md transition-all flex flex-col items-center justify-center gap-3"
                >
                    <ClipboardList className="w-12 h-12 text-white" />
                    <span className="text-xl font-bold text-center">View Reports</span>
                    <span className="text-green-100 text-center">Check your records</span>
                </Link>
            </div>

            {/* Recent Activity
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                </h2>
                
                <div className="space-y-3">
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Milk className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium">Last Milk Purchase</p>
                            <p className="text-sm text-gray-600">
                                {new Date(lastPurchaseDate).toLocaleDateString('en-IN')} - {todayPurchase} Liters
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-green-50 rounded-lg gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <Scale className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium">Last Chillar Receive</p>
                            <p className="text-sm text-gray-600">
                                {new Date().toLocaleDateString('en-IN')} - {todayChillar} Liters
                            </p>
                        </div>
                    </div>

                    {pendingPayments > 0 && (
                        <div className="flex items-center p-4 bg-yellow-50 rounded-lg gap-4">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <ClipboardList className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-medium">Pending Payments</p>
                                <p className="text-sm text-gray-600">
                                    {pendingPayments} payment(s) to be received
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div> */}
        </FieldStaffLayout>
        </ProtectedRoute>
    );
}