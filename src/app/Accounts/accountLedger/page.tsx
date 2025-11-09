
// app/dashboard/admin/accounts/ledger/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/components/ui/Table/Table';
import SummaryCard from '@/components/ui/SummaryCard';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { MilkCardModal } from '@/components/modals/MilkCardModal';
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

export default function AccountLedgerPage() {
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
        groupPurchasesByPeriod: false
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
            'purchases_grouped': { prefix: 'PV', name: 'Purchases (Grouped)' },
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
        
        // For grouped entries, show period range
        if (transaction.isGrouped) {
            return transaction.referenceNo || `${prefix}-Grouped`;
        }
        
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
                    router.push(`/Accounts/transactions/payments/create?id=${transaction.sourceId}`);
                    break;

                case 'bank_payments':
                case 'bankpayments':
                    router.push(`/Accounts/transactions/payments/create?id=${transaction.sourceId}`);
                    break;

                case 'cash_receipts':
                case 'cashreceipts':
                    router.push(`/Accounts/transactions/receipts/create?id=${transaction.sourceId}`);
                    break;

                case 'bank_receipts':
                case 'bankreceipts':
                    router.push(`/Accounts/transactions/receipts/create?id=${transaction.sourceId}`);
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
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Account Ledger</h1>
                            <p className="text-gray-600">Track all transactions and account movements</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={loadAllAccounts}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Account Selector and Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Selection & Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <SearchableSelect<AccountOption>
                                        value={selectedAccount}
                                        onSearch={searchAccounts}
                                        onChange={handleAccountChange}
                                        placeholder="Search accounts..."
                                        label="Select Account"
                                        clearable
                                        showBalanceInline={true}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.fromDate}
                                            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.toDate}
                                            onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search and Source Filter */}
                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <select
                                    value={filters.sourceTable}
                                    onChange={(e) => handleFilterChange('sourceTable', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Sources</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Purchases">Purchases</option>
                                    <option value="Cash_Payments">Cash Payments</option>
                                    <option value="Bank_Payments">Bank Payments</option>
                                    <option value="Cash_Receipts">Cash Receipts</option>
                                    <option value="Bank_Receipts">Bank Receipts</option>
                                </select>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.groupPurchasesByPeriod}
                                            onChange={(e) => handleFilterChange('groupPurchasesByPeriod', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Group by 15-day periods</span>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    {summaryData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <SummaryCard
                                title="Opening Balance"
                                value={formatCurrency(summaryData.openingBalance)}
                                icon={<Wallet className="w-6 h-6" />}
                                color="blue"
                                subtitle={`${summaryData.accountCode} - ${summaryData.accountName}`}
                            />

                            <SummaryCard
                                title="Total Debits"
                                value={formatCurrency(summaryData.totalDebits)}
                                icon={<TrendingUp className="w-6 h-6" />}
                                color="green"
                            />

                            <SummaryCard
                                title="Total Credits"
                                value={formatCurrency(summaryData.totalCredits)}
                                icon={<TrendingDown className="w-6 h-6" />}
                                color="red"
                            />

                            <SummaryCard
                                title="Closing Balance"
                                value={formatCurrency(summaryData.closingBalance)}
                                icon={<FileText className="w-6 h-6" />}
                                color="purple"
                                subtitle={`${summaryData.transactionCount} transactions`}
                            />
                        </div>
                    )}

                    {/* Ledger Table */}
                    {selectedAccount && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.Head>Date</Table.Head>
                                            <Table.Head>Trans No.</Table.Head>
                                            <Table.Head>Source Type</Table.Head>
                                            <Table.Head>Description</Table.Head>
                                            <Table.Head><div className="text-right">Debit</div></Table.Head>
                                            <Table.Head><div className="text-right">Credit</div></Table.Head>
                                            <Table.Head><div className="text-right">Balance</div></Table.Head>
                                            <Table.Head><div className="text-center">Action</div></Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {loading ? (
                                            <Table.Row>
                                                <td colSpan={8} className="text-center py-12">
                                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                                                    <p className="text-gray-500">Loading transactions...</p>
                                                </td>
                                            </Table.Row>
                                        ) : ledgerData.length === 0 ? (
                                            <Table.Row>
                                                <td colSpan={8} className="text-center py-12">
                                                    <p className="text-gray-500">No transactions found for the selected criteria.</p>
                                                </td>
                                            </Table.Row>
                                        ) : (
                                            ledgerData.map((transaction, index) => (
                                                <tr 
                                                    key={`${transaction.journalLineId}-${index}`}
                                                    className={transaction.isGrouped ? 'bg-blue-50 font-medium' : ''}
                                                >
                                                    <Table.Cell>
                                                        {formatDate(transaction.entryDate)}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                        >
                                                            {generateTransactionNo(transaction)}
                                                        </button>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <div className="font-medium">
                                                            {getSourceInfo(transaction).sourceType}
                                                        </div>
                                                        {transaction.isGrouped && (
                                                            <div className="text-xs text-blue-600">
                                                                {transaction.groupedTransactionCount} transactions
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="max-w-xs">
                                                        <div className="truncate" title={transaction.description || ''}>
                                                            {transaction.description || '-'}
                                                        </div>
                                                        {transaction.narration && (
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {transaction.narration}
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        {transaction.debit > 0 ? (
                                                            <span className="text-green-600 font-medium">
                                                                {formatCurrency(transaction.debit)}
                                                            </span>
                                                        ) : '-'}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right">
                                                        {transaction.credit > 0 ? (
                                                            <span className="text-red-600 font-medium">
                                                                {formatCurrency(transaction.credit)}
                                                            </span>
                                                        ) : '-'}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-right font-medium">
                                                        <span className={transaction.runningBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {formatCurrency(transaction.runningBalance)}
                                                        </span>
                                                    </Table.Cell>
                                                    <Table.Cell className="text-center">
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                                                            title={transaction.isGrouped ? "View Milk Card Details" : "View Transaction"}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </Table.Cell>
                                                </tr>
                                            ))
                                        )}
                                    </Table.Body>
                                </Table>

                                {/* Pagination */}
                                {totalCount > pageSize && (
                                    <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-1"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Previous
                                            </button>
                                            <span className="px-4 py-2 text-sm font-medium">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-1"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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