
// app/dashboard/admin/accounts/ledger/page.tsx
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { PageHeader } from '@/components/ui/PageHeader';
import SummaryCard from '@/components/ui/SummaryCard';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import ProtectedRoute from '@/components/ProtectedRoutes';
import MilkCardModal from '@/components/modals/MilkCardModal';
import { FullPageSpinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/useToast';
import {
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    Wallet,
    FileText,
    Eye,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import {
    getAccountLedger,
    getAccountLedgerSummary,
    getAllAccountBalances,
    AccountLedger,
    AccountLedgerSummary,
    AccountLedgerQueryParams
} from '@/lib/api/accountLedger';

interface AccountOption extends SearchableOption {
    id: number;
    code: string;
    label: string;
    secondaryLabel: string;
    balance: number;
}

function AccountLedgerInner() {
    const searchParams = useSearchParams();
    const [selectedAccount, setSelectedAccount] = useState<AccountOption | undefined>();
    const [ledgerData, setLedgerData] = useState<AccountLedger[]>([]);
    const [summaryData, setSummaryData] = useState<AccountLedgerSummary | null>(null);
    const [allAccounts, setAllAccounts] = useState<AccountLedgerSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(20);
    const router = useRouter();
    const { toast } = useToast();

    // Milk Card Modal State
    const [showMilkCard, setShowMilkCard] = useState(false);
    const [milkCardData, setMilkCardData] = useState<{
        accountId: number;
        accountName: string;
        date: string;
        transactionType: 'Purchase' | 'Sale';
    } | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        fromDate: '',
        toDate: '',
        sourceTable: '',
        groupPurchasesByPeriod: true
    });

    // Load all accounts on component mount
    useEffect(() => {
        loadAllAccounts();
    }, []);

    // Load ledger data when account is selected
    useEffect(() => {
        if (selectedAccount) {
            loadAccountLedger();
            loadAccountSummary();
        }
    }, [selectedAccount, currentPage, filters]);

    const loadAllAccounts = async () => {
        try {
            setLoading(true);
            const accounts = await getAllAccountBalances();
            setAllAccounts(accounts);

            // Auto-select account if accountId is passed in URL
            const urlAccountId = searchParams.get('accountId');
            if (urlAccountId) {
                const target = accounts.find(a => a.accountId === parseInt(urlAccountId));
                if (target) {
                    setSelectedAccount({
                        id: target.accountId,
                        code: target.accountCode,
                        label: target.accountName,
                        secondaryLabel: formatCurrency(target.closingBalance),
                        balance: target.closingBalance
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchAccounts = async (query: string): Promise<AccountOption[]> => {
        return allAccounts
            .filter(account =>
                account.accountCode.toLowerCase().includes(query.toLowerCase()) ||
                account.accountName.toLowerCase().includes(query.toLowerCase())
            )
            .map(account => ({
                id: account.accountId,
                code: account.accountCode,
                label: account.accountName,
                secondaryLabel: formatCurrency(account.closingBalance),
                balance: account.closingBalance
            }));
    };

    const loadAccountLedger = async () => {
        if (!selectedAccount) return;

        try {
            setLoading(true);
            const params: AccountLedgerQueryParams = {
                accountId: selectedAccount.id,
                pageNumber: currentPage,
                pageSize: pageSize,
                ...filters
            };

            const response = await getAccountLedger(params);
            setLedgerData(response.items);
            setTotalCount(response.totalCount);
        } catch (error) {
            console.error('Failed to load ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAccountSummary = async () => {
        if (!selectedAccount) return;

        try {
            const summary = await getAccountLedgerSummary(
                selectedAccount.id,
                filters.fromDate || undefined,
                filters.toDate || undefined
            );
            setSummaryData(summary);
        } catch (error) {
            console.error('Failed to load summary:', error);
        }
    };

    const handleAccountChange = (account: AccountOption | undefined) => {
        setSelectedAccount(account);
        setCurrentPage(1);
        if (!account) {
            setLedgerData([]);
            setSummaryData(null);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const getSourceInfo = (transaction: AccountLedger) => {
        if (!transaction.sourceTable) {
            return {
                prefix: 'JV',
                sourceType: 'Journal Voucher',
                id: transaction.journalEntryId
            };
        }

        const sourceTable = transaction.sourceTable.toLowerCase();
        const sourceMap: { [key: string]: { prefix: string; name: string; } } = {
            'sales': { prefix: 'SL', name: 'Sale' },
            'sales_grouped': { prefix: 'SL', name: 'Sales (Grouped)' },
            'purchase': { prefix: 'PV', name: 'Purchase' },
            'purchases': { prefix: 'PV', name: 'Purchase' },
            'purchase_grouped': { prefix: 'PV', name: 'Purchases (Grouped)' },
            'cash_payments': { prefix: 'CP', name: 'Cash Payment' },
            'bank_payments': { prefix: 'BP', name: 'Bank Payment' },
            'cash_receipts': { prefix: 'CR', name: 'Cash Receipt' },
            'bank_receipts': { prefix: 'BR', name: 'Bank Receipt' },
            'opening_balances': { prefix: 'OB', name: 'Opening Balance' },
            'openingbalance': { prefix: 'OB', name: 'Opening Balance' },
            'journal': { prefix: 'JV', name: 'Journal Voucher' }
        };

        const source = sourceMap[sourceTable] || { prefix: 'JV', name: 'Journal Voucher' };
        return {
            prefix: source.prefix,
            sourceType: source.name,
            id: transaction.sourceId || transaction.journalEntryId
        };
    };

    const generateTransactionNo = (transaction: AccountLedger) => {
        const { prefix, id } = getSourceInfo(transaction);

        // // For grouped entries, show period range
        // if (transaction.isGrouped) {
        //     return transaction.referenceNo || `${prefix}-Grouped`;
        // }

        return `${prefix}${id.toString().padStart(4, '0')}`;
    };

    const handleViewTransaction = async (transaction: AccountLedger) => {
        const sourceTable = transaction.sourceTable?.toLowerCase() || '';

        // Check if it's a grouped entry or sales/purchase
        if (transaction.isGrouped || sourceTable === 'sales_grouped' || sourceTable === 'purchases_grouped') {
            // Open Milk Card for grouped entries
            setMilkCardData({
                accountId: transaction.accountId,
                accountName: transaction.accountName,
                date: transaction.periodStart || transaction.entryDate,
                transactionType: sourceTable.includes('purchase') ? 'Purchase' : 'Sale'
            });
            setShowMilkCard(true);
            return;
        }

        // For regular sales/purchases, also open Milk Card
        if (sourceTable === 'sales' || sourceTable === 'sale') {
            setMilkCardData({
                accountId: transaction.accountId,
                accountName: transaction.accountName,
                date: transaction.entryDate,
                transactionType: 'Sale'
            });
            setShowMilkCard(true);
            return;
        }

        if (sourceTable === 'purchase' || sourceTable === 'purchases') {
            setMilkCardData({
                accountId: transaction.accountId,
                accountName: transaction.accountName,
                date: transaction.entryDate,
                transactionType: 'Purchase'
            });
            setShowMilkCard(true);
            return;
        }

        // For other transaction types, navigate to their respective pages
        if (!transaction.sourceId) {
            toast({
                title: "Error",
                description: "No source information available for this transaction",
                variant: "error"
            });
            return;
        }

        try {
            switch (sourceTable) {
                case 'cash_payments':
                case 'cashpayments':
                    router.push(`/Accounts/transactions/cashPayments/create?id=${transaction.sourceId}&type=cash`);
                    break;

                case 'bank_payments':
                case 'bankpayments':
                    router.push(`/Accounts/transactions/cashPayments/create?id=${transaction.sourceId}&type=bank`);
                    break;

                case 'cash_receipts':
                case 'cashreceipts':
                    router.push(`/Accounts/transactions/receipts/create?id=${transaction.sourceId}&type=cash`);
                    break;

                case 'bank_receipts':
                case 'bankreceipts':
                    router.push(`/Accounts/transactions/receipts/create?id=${transaction.sourceId}&type=bank`);
                    break;

                case 'openingbalance':
                case 'opening_balances':
                    toast({
                        title: "Opening Balance",
                        description: "Opening balance entries cannot be edited",
                        variant: "default"
                    });
                    break;

                default:
                    toast({
                        title: "Unsupported Transaction Type",
                        description: `Cannot view transactions of type: ${sourceTable}`,
                        variant: "error"
                    });
            }
        } catch (error) {
            console.error('Error loading transaction:', error);
            toast({
                title: "Error",
                description: "Failed to load transaction details",
                variant: "error"
            });
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <ProtectedRoute requiredRole="admin">
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <PageHeader
                        title="Account Ledger"
                        subtitle="Track all transactions and account movements"
                        icon={<FileText className="w-5 h-5 text-blue-600" />}
                        actions={
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs">
                                    <Download className="w-3.5 h-3.5" />
                                    Export
                                </button>
                                <button
                                    onClick={loadAllAccounts}
                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-200"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        }
                    />

                    {/* Account Selector and Filters Toolbar */}
                    <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2.5">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <div className="lg:col-span-2">
                                <SearchableSelect<AccountOption>
                                    value={selectedAccount}
                                    onSearch={searchAccounts}
                                    onChange={handleAccountChange}
                                    placeholder="Search accounts by name or code..."
                                    label="Select Account"
                                    clearable
                                    showBalanceInline={true}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">From</span>
                                    <input
                                        type="date"
                                        value={filters.fromDate}
                                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">To</span>
                                    <input
                                        type="date"
                                        value={filters.toDate}
                                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search and Source Filter */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400"
                                />
                            </div>
                            <div className="min-w-[150px]">
                                <select
                                    value={filters.sourceTable}
                                    onChange={(e) => handleFilterChange('sourceTable', e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white text-slate-700"
                                >
                                    <option value="">All Sources</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Purchases">Purchases</option>
                                    <option value="Cash_Payments">Cash Payments</option>
                                    <option value="Bank_Payments">Bank Payments</option>
                                    <option value="Cash_Receipts">Cash Receipts</option>
                                    <option value="Bank_Receipts">Bank Receipts</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={filters.groupPurchasesByPeriod}
                                        onChange={(e) => handleFilterChange('groupPurchasesByPeriod', e.target.checked)}
                                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-slate-600 font-medium">Group 15-day periods</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summaryData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                            <SummaryCard
                                title="Opening Balance"
                                value={formatCurrency(summaryData.openingBalance)}
                                icon={<Wallet className="w-4 h-4 text-blue-600" />}
                                color="blue"
                                subtitle={`${summaryData.accountCode} - ${summaryData.accountName}`}
                            />

                            <SummaryCard
                                title="Total Debits"
                                value={formatCurrency(summaryData.totalDebits)}
                                icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
                                color="green"
                            />

                            <SummaryCard
                                title="Total Credits"
                                value={formatCurrency(summaryData.totalCredits)}
                                icon={<TrendingDown className="w-4 h-4 text-rose-600" />}
                                color="red"
                            />

                            <SummaryCard
                                title="Closing Balance"
                                value={formatCurrency(summaryData.closingBalance)}
                                icon={<FileText className="w-4 h-4 text-indigo-600" />}
                                color="purple"
                                subtitle={`${summaryData.transactionCount} transactions`}
                            />
                        </div>
                    )}

                    {/* Ledger Table */}
                    {selectedAccount && (
                        <TableContainer title="Transaction History">
                            <div className="overflow-x-auto">
                                <Table dense className="min-w-full">
                                    <Table.Header sticky>
                                        <Table.Row>
                                            <Table.Head>Date</Table.Head>
                                            <Table.Head>Trans No.</Table.Head>
                                            <Table.Head>Source Type</Table.Head>
                                            <Table.Head>Description</Table.Head>
                                            <Table.Head className="text-right">Debit</Table.Head>
                                            <Table.Head className="text-right">Credit</Table.Head>
                                            <Table.Head className="text-right">Balance</Table.Head>
                                            <Table.Head className="text-center">Action</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {loading ? (
                                            <Table.Row>
                                                <Table.Cell colSpan={8} className="text-center py-10">
                                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                                                    <p className="text-xs text-slate-500">Loading transactions...</p>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : ledgerData.length === 0 ? (
                                            <Table.Row>
                                                <Table.Cell colSpan={8} className="text-center py-10">
                                                    <p className="text-xs text-slate-500">No transactions found for the selected criteria.</p>
                                                </Table.Cell>
                                            </Table.Row>
                                        ) : (
                                            ledgerData.map((transaction, index) => (
                                                <Table.Row
                                                    key={`${transaction.journalLineId}-${index}`}
                                                    className={transaction.isGrouped ? 'bg-blue-50/50 font-medium' : ''}
                                                >
                                                    <Table.Cell className="text-xs text-slate-700">
                                                        {formatDate(transaction.entryDate)}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline font-mono"
                                                        >
                                                            {generateTransactionNo(transaction)}
                                                        </button>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="text-xs font-medium text-slate-900">
                                                            {getSourceInfo(transaction).sourceType}
                                                        </div>
                                                        {transaction.isGrouped && (
                                                            <div className="text-[11px] text-blue-600">
                                                                {transaction.groupedTransactionCount} trans
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="max-w-[150px] sm:max-w-xs truncate text-xs text-slate-800" title={transaction.description || ''}>
                                                            {transaction.description || '-'}
                                                        </div>
                                                        {transaction.narration && (
                                                            <div className="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                                                                {transaction.narration}
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        {transaction.debit > 0 ? (
                                                            <span className="text-emerald-700 font-medium text-xs tabular-nums">
                                                                {formatCurrency(transaction.debit)}
                                                            </span>
                                                        ) : <span className="text-slate-400 text-xs">-</span>}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        {transaction.credit > 0 ? (
                                                            <span className="text-rose-600 font-medium text-xs tabular-nums">
                                                                {formatCurrency(transaction.credit)}
                                                            </span>
                                                        ) : <span className="text-slate-400 text-xs">-</span>}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        <span className={`font-medium text-xs tabular-nums ${transaction.runningBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                                            {formatCurrency(transaction.runningBalance)}
                                                        </span>
                                                    </Table.Cell>
                                                    <Table.Cell className="text-center">
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                                                            title={transaction.isGrouped ? "View Milk Card" : "View Transaction"}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))
                                        )}
                                    </Table.Body>
                                </Table>
                            </div>

                            {/* Pagination - Mobile optimized */}
                            {totalCount > pageSize && (
                                <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-xs text-slate-500 text-center sm:text-left">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium text-slate-700"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Previous</span>
                                        </button>
                                        <span className="px-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium text-slate-700"
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </TableContainer>
                    )}

                    {/* Milk Card Modal */}
                    {showMilkCard && milkCardData && (
                        <MilkCardModal
                            isOpen={showMilkCard}
                            onClose={() => {
                                setShowMilkCard(false);
                                setMilkCardData(null);
                            }}
                            accountId={milkCardData.accountId}
                            accountName={milkCardData.accountName}
                            date={milkCardData.date}
                            transactionType={milkCardData.transactionType}
                        />
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}

export default function AccountLedgerPage() {
    return (
        <Suspense fallback={<FullPageSpinner message="Loading account ledger..." />}>
            <AccountLedgerInner />
        </Suspense>
    );
}