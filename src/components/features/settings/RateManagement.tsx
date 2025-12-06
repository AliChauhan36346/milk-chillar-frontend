'use client';
import { useState } from 'react';
import { Banknote, TrendingUp, Calendar, Save, RefreshCw } from 'lucide-react';

export function RateManagement() {
    const [activeRateTab, setActiveRateTab] = useState<'global' | 'dodhi' | 'history'>('global');
    const [buyerRate, setBuyerRate] = useState('');
    const [supplierRate, setSupplierRate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (type: 'buyer' | 'supplier') => {
        setIsSubmitting(true);
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        // Ideally show toast
    };

    return (
        <div className="space-y-6">
            {/* Rate Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Rate Management</h2>
                    <p className="text-sm text-gray-500">Manage global and specific rates for buyers and suppliers.</p>
                </div>
                <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                    <button
                        onClick={() => setActiveRateTab('global')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeRateTab === 'global' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Global Rates
                    </button>
                    <button
                        onClick={() => setActiveRateTab('dodhi')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeRateTab === 'dodhi' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Dodhi Specific
                    </button>
                    <button
                        onClick={() => setActiveRateTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeRateTab === 'history' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Rate History
                    </button>
                </div>
            </div>

            {/* Global Rates Content */}
            {activeRateTab === 'global' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Supplier Rate Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Mass Update Supplier Rate</h3>
                                <p className="text-xs text-gray-500">Updates purchase rate for ALL suppliers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">New Rate (PKR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₨</span>
                                    <input
                                        type="number"
                                        value={supplierRate}
                                        onChange={(e) => setSupplierRate(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpdate('supplier')}
                                disabled={!supplierRate || isSubmitting}
                                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update All Suppliers
                            </button>
                        </div>
                    </div>

                    {/* Buyer Rate Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Banknote className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Mass Update Buyer Rate</h3>
                                <p className="text-xs text-gray-500">Updates sales rate for ALL buyers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">New Rate (PKR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₨</span>
                                    <input
                                        type="number"
                                        value={buyerRate}
                                        onChange={(e) => setBuyerRate(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpdate('buyer')}
                                disabled={!buyerRate || isSubmitting}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update All Buyers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeRateTab === 'dodhi' && (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-gray-500">Select a Dodhi to update rates for their specific suppliers.</p>
                    <button className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                        Coming Soon
                    </button>
                </div>
            )}
            {activeRateTab === 'history' && (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-gray-500">View historical rate changes and logs.</p>
                </div>
            )}
        </div>
    );
}
