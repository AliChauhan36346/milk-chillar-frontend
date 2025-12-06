'use client';
import { useState, useEffect } from 'react';
import { X, Search, Calendar, Save, RefreshCw, Calculator, AlertCircle, ArrowRight } from 'lucide-react';
import {
    searchAccounts,
    SearchAccountResult,
    getAccountsByCodePrefix
} from '@/lib/api/accounts';
import {
    getSupplierRateSummaryForPeriod,
    getBuyerRateSummaryForPeriod,
    updateSupplierRateForPeriod,
    updateBuyerRateForPeriod,
    SupplierRateSummary
} from '@/lib/api/maintenance';

interface UpdateRateModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Optional props for pre-filled data (e.g. from Ledger)
    initialAccountId?: number;
    initialAccountName?: string;
    initialAccountType?: 'supplier' | 'buyer';
}

export function UpdateRateModal({
    isOpen,
    onClose,
    initialAccountId,
    initialAccountName,
    initialAccountType
}: UpdateRateModalProps) {
    // Stage 1: Account Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchAccountResult[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<{ id: number, name: string, type: 'supplier' | 'buyer' } | null>(
        initialAccountId ? { id: initialAccountId, name: initialAccountName || '', type: initialAccountType || 'supplier' } : null
    );
    const [isSearching, setIsSearching] = useState(false);

    // Stage 2: Period Selection & Data
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [summary, setSummary] = useState<SupplierRateSummary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    // Stage 3: Rate Update
    const [newRate, setNewRate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Reset state when modal opens/closes or initial props change
    useEffect(() => {
        if (!isOpen) {
            // Optional: Partial reset logic if needed on close
        }
    }, [isOpen]);

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // We search both suppliers (200) and buyers (100) if type not specified, 
            // but user flow implies we should probably let user pick type or search globally.
            // For now, let's search generic or by type prefix if we can infer.
            // Given requirements: "give 100 for buyers and 200 for suppliers"
            // Let's just search all matching string and filter in UI or search generic.
            const results = await searchAccounts(term, undefined, 1); // Assuming TenantId 1 for now
            setSearchResults(results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectAccount = (account: SearchAccountResult) => {
        // Infer type from code prefix
        const type = account.accountCode.startsWith('100') ? 'buyer' : 'supplier';
        setSelectedAccount({
            id: account.accountId,
            name: account.name,
            type
        });
        setSearchResults([]);
        setSearchTerm('');
    };

    const fetchSummary = async () => {
        if (!selectedAccount || !startDate || !endDate) return;

        setIsLoadingSummary(true);
        try {
            // Note: Currently API says 'getSupplierRateSummary' - assuming this works for generic logic or we need a buyer equivalent?
            // User prompt says "fill the rate box with previous rate... and same for buyer"
            // Assuming the endpoints share structure or we might need to adjust for buyer summary if different.
            // For now using `getSupplierRateSummaryForPeriod` as generic since structure likely identical (liters/amount).
            let data: SupplierRateSummary;
            if (selectedAccount.type === 'supplier') {
                data = await getSupplierRateSummaryForPeriod(selectedAccount.id, startDate, endDate);
            } else {
                data = await getBuyerRateSummaryForPeriod(selectedAccount.id, startDate, endDate);
            }
            setSummary(data);
            setNewRate(data.previousRate.toString());
        } catch (err) {
            console.error(err);
            // handle error
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedAccount || !newRate || !startDate || !endDate) return;

        setIsUpdating(true);
        try {
            const rate = parseFloat(newRate);
            if (selectedAccount.type === 'supplier') {
                await updateSupplierRateForPeriod(selectedAccount.id, rate, startDate, endDate);
            } else {
                await updateBuyerRateForPeriod(selectedAccount.id, rate, startDate, endDate);
            }
            onClose();
            // Trigger success toast/refresh?
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculations
    const currentAmount = summary ? summary.totalAmount : 0;
    const projectedAmount = summary && newRate ? summary.totalLiters * parseFloat(newRate) : 0;
    const difference = projectedAmount - currentAmount;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white w-[500px] max-w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">

                {/* Header */}
                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        Update Rate for Period
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* content */}
                <div className="p-4 space-y-3">

                    {/* 1. Account Selection */}
                    {!selectedAccount ? (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Search Account (Supplier/Buyer)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type name or code..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                                {/* Dropdown Results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {searchResults.map(result => (
                                            <button
                                                key={result.accountId}
                                                onClick={() => selectAccount(result)}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-none"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{result.name}</p>
                                                    <p className="text-xs text-gray-500">{result.accountCode}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-lg p-2.5 flex justify-between items-center border border-blue-100">
                            <div>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{selectedAccount.type}</p>
                                <p className="font-bold text-gray-900 text-sm">{selectedAccount.name}</p>
                            </div>
                            {/* Only allow re-selection if not passed as initial prop */}
                            {!initialAccountId && (
                                <button onClick={() => { setSelectedAccount(null); setSummary(null); }} className="text-blue-600 text-xs hover:underline">Change</button>
                            )}
                        </div>
                    )}

                    {/* 2. Date Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Fetch Button (if not summary yet) */}
                    {!summary && (
                        <button
                            onClick={fetchSummary}
                            disabled={!startDate || !endDate || !selectedAccount || isLoadingSummary}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                            {isLoadingSummary ? 'Analyzing...' : 'Get Summary'}
                        </button>
                    )}

                    {/* 3. Summary & Update */}
                    {summary && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Total Liters</span>
                                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        {summary.totalLiters.toFixed(2)} L
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Current Amount</span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        ₨ {summary.totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1.5">New Rate</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₨</span>
                                    <input
                                        type="number"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-lg font-bold text-gray-900 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Impact Analysis */}
                            {newRate && parseFloat(newRate) !== summary.previousRate && (
                                <div className={`p-4 rounded-xl border ${difference >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: difference >= 0 ? '#166534' : '#991B1B' }}>
                                        Estimated Impact
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold" style={{ color: difference >= 0 ? '#15803d' : '#b91c1c' }}>
                                            {difference > 0 ? '+' : ''} {Math.round(difference).toLocaleString()}
                                        </span>
                                        <span className="text-sm font-medium mb-1 opacity-70" style={{ color: difference >= 0 ? '#15803d' : '#b91c1c' }}>PKR</span>
                                    </div>
                                    <p className="text-xs mt-1 opacity-70" style={{ color: difference >= 0 ? '#166534' : '#991B1B' }}>
                                        New Total: {Math.round(projectedAmount).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || !newRate}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isUpdating ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                Confirm Update
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
