'use client';
import { useState, useEffect } from 'react';
import { Calendar, Milk, Scale, Filter, ChevronDown } from 'lucide-react';

// new
import SummaryCard from '@/components/ui/SummaryCard';
//import { Milk, Scale } from 'lucide-react';


export default function DailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState<string>('today');
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Sample data - replace with your actual data fetching logic
    const [purchases, setPurchases] = useState([
        { date: '2023-06-01', supplierId: '001', name: 'Rajesh Dairy', quantity: 50 },
        { date: '2023-06-01', supplierId: '002', name: 'Ganesh Farm', quantity: 35 },
        { date: '2023-06-02', supplierId: '001', name: 'Rajesh Dairy', quantity: 45 },
        { date: '2023-06-02', supplierId: '003', name: 'Shivam Suppliers', quantity: 40 },
    ]);

    const [chillarReceives, setChillarReceives] = useState([
        { date: '2023-06-01', receiveId: 'CR001', grossLiters: 80, lr: 4.5, fat: 3.8, netLiters: 78 },
        { date: '2023-06-02', receiveId: 'CR002', grossLiters: 82, lr: 4.2, fat: 3.9, netLiters: 80 },
    ]);

    // Calculate date ranges
    useEffect(() => {
        const today = new Date();
        const newEndDate = today.toISOString().split('T')[0];

        if (dateRange === 'today') {
            setStartDate(newEndDate);
            setEndDate(newEndDate);
        } else if (dateRange === '7days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
            setEndDate(newEndDate);
        } else if (dateRange === '15days') {
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(today.getDate() - 15);
            setStartDate(fifteenDaysAgo.toISOString().split('T')[0]);
            setEndDate(newEndDate);
        }
    }, [dateRange]);

    // Filter records by date range
    const filteredPurchases = purchases.filter(p =>
        p.date >= startDate && p.date <= endDate
    );

    const filteredChillarReceives = chillarReceives.filter(c =>
        c.date >= startDate && c.date <= endDate
    );

    // Calculate totals
    const purchaseTotal = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const chillarTotal = filteredChillarReceives.reduce((sum, c) => sum + c.grossLiters, 0);
    const differenceTotal = chillarTotal - purchaseTotal;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                    <Calendar className="w-6 h-6" />
                    Daily Milk Report
                </h1>

                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            {dateRange === 'today' && 'Today'}
                            {dateRange === '7days' && 'Last 7 Days'}
                            {dateRange === '15days' && 'Last 15 Days'}
                            {dateRange === 'custom' && 'Custom Range'}
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showDatePicker && (
                            <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48">
                                <button
                                    onClick={() => { setDateRange('today'); setShowDatePicker(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-md ${dateRange === 'today' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => { setDateRange('7days'); setShowDatePicker(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-md ${dateRange === '7days' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    onClick={() => { setDateRange('15days'); setShowDatePicker(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-md ${dateRange === '15days' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Last 15 Days
                                </button>
                                <div className="border-t border-gray-200 mt-1 pt-1">
                                    <div className="px-3 py-2 text-sm text-gray-500">Custom Range</div>
                                    <div className="px-3 pb-2 flex flex-col gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
                                            className="border border-gray-300 rounded-md p-1 text-sm"
                                        />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
                                            className="border border-gray-300 rounded-md p-1 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-center">
                        {startDate === endDate ? (
                            <span>{new Date(startDate).toLocaleDateString()}</span>
                        ) : (
                            <span>
                                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SummaryCard
                    title="Total Purchased"
                    value={`${purchaseTotal} Ltrs`}
                    icon={<Milk className="w-5 h-5" />}
                    color="blue"
                />

                <SummaryCard
                    title="Total Chillar Receive"
                    value={`${chillarTotal} Ltrs`}
                    icon={<Scale className="w-5 h-5" />}
                    color="green"
                />

                <SummaryCard
                    title="Difference"
                    value={`${differenceTotal >= 0 ? '+' : ''}${differenceTotal} Ltrs`}
                    icon={<Scale className="w-5 h-5" />}
                    color={differenceTotal >= 0 ? 'yellow' : 'red'}
                />
            </div>

            {/* Purchase Records */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                    <Milk className="w-5 h-5" />
                    Purchase Records
                </h2>

                {filteredPurchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (Ltrs)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPurchases.map((purchase, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(purchase.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {purchase.supplierId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {purchase.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {purchase.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No purchase records found for selected date range
                    </div>
                )}
            </div>

            {/* Chillar Receive Records */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                    <Scale className="w-5 h-5" />
                    Chillar Receive Records
                </h2>

                {filteredChillarReceives.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receive ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Ltrs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Ltrs</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredChillarReceives.map((receive, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(receive.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {receive.receiveId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {receive.grossLiters}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {receive.lr}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {receive.fat}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {receive.netLiters}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No chillar receive records found for selected date range
                    </div>
                )}
            </div>
        </div>
    );
}