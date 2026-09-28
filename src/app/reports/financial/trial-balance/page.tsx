'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip } from '@/components/ui/StatStrip';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { Select } from '@/components/ui/Select';
import { CenteredSpinner } from '@/components/ui/spinner';
import { getAllAccountBalances, AccountLedgerSummary } from '@/lib/api/accountLedger';
import {
  Scale,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function TrialBalancePage() {
  const [data, setData] = useState<AccountLedgerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hideZeroBalances, setHideZeroBalances] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllAccountBalances();
      setData(result || []);
    } catch (err: any) {
      console.error('Failed to load trial balance data:', err);
      setError(err?.message || 'Failed to retrieve trial balance accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAccountClassification = (code: string) => {
    if (!code) return { label: 'Other', color: 'slate' };
    const firstDigit = code.trim().charAt(0);
    switch (firstDigit) {
      case '1':
        return { label: 'Asset', color: 'blue' };
      case '2':
        return { label: 'Liability', color: 'amber' };
      case '3':
        return { label: 'Equity', color: 'purple' };
      case '4':
        return { label: 'Revenue', color: 'emerald' };
      case '5':
        return { label: 'Expense', color: 'rose' };
      default:
        return { label: 'Account', color: 'slate' };
    }
  };

  const filteredAccounts = useMemo(() => {
    return data.filter(account => {
      // Category filter
      if (categoryFilter !== 'all') {
        const firstDigit = account.accountCode?.trim().charAt(0);
        if (firstDigit !== categoryFilter) return false;
      }

      // Hide zero balances
      if (hideZeroBalances) {
        const isZero =
          Math.abs(account.openingBalance || 0) < 0.01 &&
          Math.abs(account.totalDebits || 0) < 0.01 &&
          Math.abs(account.totalCredits || 0) < 0.01 &&
          Math.abs(account.closingBalance || 0) < 0.01;
        if (isZero) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const codeMatch = account.accountCode?.toLowerCase().includes(term);
        const nameMatch = account.accountName?.toLowerCase().includes(term);
        if (!codeMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [data, categoryFilter, hideZeroBalances, searchTerm]);

  // Overall totals across all accounts (or filtered accounts)
  const totals = useMemo(() => {
    return filteredAccounts.reduce(
      (acc, curr) => {
        acc.openingDebit += curr.openingBalance > 0 ? curr.openingBalance : 0;
        acc.openingCredit += curr.openingBalance < 0 ? Math.abs(curr.openingBalance) : 0;
        acc.totalDebits += curr.totalDebits || 0;
        acc.totalCredits += curr.totalCredits || 0;
        acc.closingDebit += curr.closingBalance > 0 ? curr.closingBalance : 0;
        acc.closingCredit += curr.closingBalance < 0 ? Math.abs(curr.closingBalance) : 0;
        return acc;
      },
      {
        openingDebit: 0,
        openingCredit: 0,
        totalDebits: 0,
        totalCredits: 0,
        closingDebit: 0,
        closingCredit: 0,
      }
    );
  }, [filteredAccounts]);

  const debitCreditDiff = Math.abs(totals.totalDebits - totals.totalCredits);
  const isBalanced = debitCreditDiff < 1.0; // Tolerance for fractional rounding

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (!filteredAccounts.length) return;
    const headers = [
      'Account Code',
      'Account Name',
      'Classification',
      'Opening Balance',
      'Period Debits',
      'Period Credits',
      'Closing Balance',
    ];
    const rows = filteredAccounts.map(a => [
      a.accountCode,
      `"${a.accountName}"`,
      getAccountClassification(a.accountCode).label,
      a.openingBalance,
      a.totalDebits,
      a.totalCredits,
      a.closingBalance,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trial-balance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4 print:space-y-4">
          {/* Header - Hide on Print */}
          <div className="print:hidden">
            <PageHeader
              title="Trial Balance"
              subtitle="Comprehensive verification of ledger debit & credit parity"
              icon={<Scale className="w-5 h-5 text-blue-600" />}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={loading || filteredAccounts.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              }
            />
          </div>

          {/* Print Title - Visible on Print */}
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">CHAUHAN DAIRY FARMS</h1>
            <h2 className="text-sm font-semibold text-slate-700">TRIAL BALANCE STATEMENT</h2>
            <p className="text-xs text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
          </div>

          {/* Compact Filters Toolbar - Hide on Print */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="min-w-[170px]">
                <Select
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  options={[
                    { value: 'all', label: 'All Accounts' },
                    { value: '1', label: '100s - Assets' },
                    { value: '2', label: '200s - Liabilities' },
                    { value: '3', label: '300s - Equity' },
                    { value: '4', label: '400s - Revenue' },
                    { value: '5', label: '500s - Expenses' },
                  ]}
                />
              </div>

              {/* Search by Code / Name */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search code or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Hide Zero Balances Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium ml-auto">
                <input
                  type="checkbox"
                  checked={hideZeroBalances}
                  onChange={(e) => setHideZeroBalances(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                />
                Hide Zero Balances
              </label>
            </div>
          </div>

          {/* Executive StatStrip - Hide on Print */}
          <div className="print:hidden">
            <StatStrip
              items={[
                {
                  label: 'Total Debits',
                  value: formatCurrency(totals.totalDebits),
                  color: 'info',
                  icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
                },
                {
                  label: 'Total Credits',
                  value: formatCurrency(totals.totalCredits),
                  color: 'danger',
                  icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
                },
                {
                  label: 'Net Variance',
                  value: formatCurrency(debitCreditDiff),
                  subtext: isBalanced ? '0 difference' : 'Dr/Cr out of sync',
                  color: isBalanced ? 'success' : 'danger',
                  icon: <Scale className="w-4 h-4 text-purple-600" />,
                },
                {
                  label: 'Status',
                  value: isBalanced ? 'Balanced' : 'Imbalance',
                  subtext: isBalanced ? 'Debits equal Credits' : `${formatCurrency(debitCreditDiff)} difference`,
                  color: isBalanced ? 'success' : 'danger',
                  icon: isBalanced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ),
                },
              ]}
            />
          </div>

          {/* Loading */}
          {loading && (
            <CenteredSpinner message="Calculating trial balance..." />
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Table Container */}
          {!loading && !error && (
            <TableContainer title="Trial Balance Accounts">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 print:hidden">
                <span>
                  Showing <strong className="text-slate-700">{filteredAccounts.length}</strong> accounts
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  {isBalanced ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Balanced
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-rose-600" /> Out of Balance
                    </span>
                  )}
                </span>
              </div>

              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head className="whitespace-nowrap">Code</Table.Head>
                    <Table.Head className="whitespace-nowrap">Account Name</Table.Head>
                    <Table.Head className="whitespace-nowrap">Type</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap">Opening Bal.</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap">Period Debit</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap">Period Credit</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap">Closing Bal.</Table.Head>
                    <Table.Head align="center" className="print:hidden whitespace-nowrap">Ledger</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredAccounts.length === 0 ? (
                    <Table.Row>
                      <td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                        No accounts match the selected criteria
                      </td>
                    </Table.Row>
                  ) : (
                    filteredAccounts.map(account => {
                      const classification = getAccountClassification(account.accountCode);
                      return (
                        <Table.Row key={account.accountId}>
                          <Table.Cell className="font-mono text-xs text-slate-600 whitespace-nowrap">
                            {account.accountCode}
                          </Table.Cell>
                          <Table.Cell className="font-medium text-xs text-slate-900 whitespace-nowrap">
                            {account.accountName}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                classification.color === 'blue'
                                  ? 'bg-blue-50 text-blue-700'
                                  : classification.color === 'amber'
                                  ? 'bg-amber-50 text-amber-700'
                                  : classification.color === 'purple'
                                  ? 'bg-purple-50 text-purple-700'
                                  : classification.color === 'emerald'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : classification.color === 'rose'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {classification.label}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-slate-700">
                            {formatCurrency(account.openingBalance)}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-emerald-700">
                            {account.totalDebits > 0 ? formatCurrency(account.totalDebits) : '-'}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-rose-600">
                            {account.totalCredits > 0 ? formatCurrency(account.totalCredits) : '-'}
                          </Table.Cell>
                          <Table.Cell align="right" className="text-xs font-semibold tabular-nums whitespace-nowrap">
                            <span className={account.closingBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}>
                              {formatCurrency(account.closingBalance)}
                            </span>
                          </Table.Cell>
                          <Table.Cell align="center" className="print:hidden whitespace-nowrap">
                            <Link
                              href={`/Accounts/accountLedger?accountId=${account.accountId}`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="View Account Ledger"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
                {/* Grand Totals Footer */}
                {filteredAccounts.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-semibold text-xs text-slate-800">
                      <td colSpan={3} className="px-3.5 py-2.5 uppercase tracking-wider text-slate-700">
                        Total ({filteredAccounts.length} Accounts)
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-700">
                        {formatCurrency(totals.openingDebit - totals.openingCredit)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-800 font-bold">
                        {formatCurrency(totals.totalDebits)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-rose-800 font-bold">
                        {formatCurrency(totals.totalCredits)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-900 font-bold">
                        {formatCurrency(totals.closingDebit - totals.closingCredit)}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </TableContainer>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
