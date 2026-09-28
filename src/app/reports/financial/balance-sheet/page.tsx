'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip } from '@/components/ui/StatStrip';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { CenteredSpinner } from '@/components/ui/spinner';
import { getAllAccountBalances, AccountLedgerSummary } from '@/lib/api/accountLedger';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Wallet,
  Building,
  Landmark,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function BalanceSheetPage() {
  const [data, setData] = useState<AccountLedgerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [hideZeroBalances, setHideZeroBalances] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllAccountBalances();
      setData(result || []);
    } catch (err: any) {
      console.error('Failed to load balance sheet accounts:', err);
      setError(err?.message || 'Failed to retrieve balance sheet records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group accounts according to standard accounting classifications
  const balanceSheet = useMemo(() => {
    // 100s: Assets
    const assetAccounts = data.filter(a => a.accountCode?.startsWith('1'));
    // 200s: Liabilities
    const liabilityAccounts = data.filter(a => a.accountCode?.startsWith('2'));
    // 300s: Equity
    const equityAccounts = data.filter(a => a.accountCode?.startsWith('3'));
    // 400s: Revenue & 500s: Expenses -> Calculate Net Profit to close into Retained Earnings / Equity
    const revenueAccounts = data.filter(a => a.accountCode?.startsWith('4'));
    const expenseAccounts = data.filter(a => a.accountCode?.startsWith('5'));

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + (Math.abs(a.closingBalance || 0)), 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + (Math.abs(a.closingBalance || 0)), 0);
    const currentPeriodNetEarnings = totalRevenue - totalExpenses;

    // Further classify Assets: Current vs Non-Current
    // Codes starting with 101, 102 (Cash/Bank) or 103 (Receivables) or 104 (Inventory) = Current Assets
    const currentAssets = assetAccounts.filter(a => {
      const prefix = a.accountCode?.substring(0, 3);
      return prefix === '101' || prefix === '102' || prefix === '103' || prefix === '104';
    });
    const nonCurrentAssets = assetAccounts.filter(a => {
      const prefix = a.accountCode?.substring(0, 3);
      return prefix !== '101' && prefix !== '102' && prefix !== '103' && prefix !== '104';
    });

    // Subtotals
    const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + Math.abs(a.closingBalance || 0), 0);
    const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, a) => sum + Math.abs(a.closingBalance || 0), 0);
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + Math.abs(a.closingBalance || 0), 0);
    const baseEquity = equityAccounts.reduce((sum, a) => sum + Math.abs(a.closingBalance || 0), 0);
    const totalEquity = baseEquity + currentPeriodNetEarnings;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = variance < 5.0; // Accounting parity check

    return {
      currentAssets: hideZeroBalances ? currentAssets.filter(a => Math.abs(a.closingBalance || 0) > 0.01) : currentAssets,
      nonCurrentAssets: hideZeroBalances ? nonCurrentAssets.filter(a => Math.abs(a.closingBalance || 0) > 0.01) : nonCurrentAssets,
      totalCurrentAssets,
      totalNonCurrentAssets,
      totalAssets,

      liabilityAccounts: hideZeroBalances ? liabilityAccounts.filter(a => Math.abs(a.closingBalance || 0) > 0.01) : liabilityAccounts,
      totalLiabilities,

      equityAccounts: hideZeroBalances ? equityAccounts.filter(a => Math.abs(a.closingBalance || 0) > 0.01) : equityAccounts,
      baseEquity,
      currentPeriodNetEarnings,
      totalEquity,

      totalLiabilitiesAndEquity,
      variance,
      isBalanced
    };
  }, [data, hideZeroBalances]);

  const handleExportCSV = () => {
    const headers = ['Category', 'Subcategory', 'Account Code', 'Account Name', 'Amount'];
    const rows: (string | number)[][] = [];

    // Current Assets
    balanceSheet.currentAssets.forEach(a => {
      rows.push(['Assets', 'Current Assets', a.accountCode, `"${a.accountName}"`, Math.abs(a.closingBalance)]);
    });
    // Non-Current Assets
    balanceSheet.nonCurrentAssets.forEach(a => {
      rows.push(['Assets', 'Non-Current Assets', a.accountCode, `"${a.accountName}"`, Math.abs(a.closingBalance)]);
    });
    // Liabilities
    balanceSheet.liabilityAccounts.forEach(a => {
      rows.push(['Liabilities', 'Current Liabilities', a.accountCode, `"${a.accountName}"`, Math.abs(a.closingBalance)]);
    });
    // Equity
    balanceSheet.equityAccounts.forEach(a => {
      rows.push(['Equity', 'Capital & Reserves', a.accountCode, `"${a.accountName}"`, Math.abs(a.closingBalance)]);
    });
    rows.push(['Equity', 'Retained Earnings', '-', 'Current Period Net Profit', balanceSheet.currentPeriodNetEarnings]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-sheet-${asOfDate}.csv`;
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
              title="Balance Sheet"
              subtitle="Statement of financial position showing assets, liabilities, and equity"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={loading || data.length === 0}
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

          {/* Print Title */}
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">CHAUHAN DAIRY FARMS</h1>
            <h2 className="text-sm font-semibold text-slate-700">BALANCE SHEET STATEMENT</h2>
            <p className="text-xs text-slate-500 mt-1">As of: {new Date(asOfDate).toLocaleDateString('en-PK', { dateStyle: 'long' })}</p>
          </div>

          {/* Compact Filters Toolbar - Hide on Print */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">As Of Date</span>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium ml-auto">
                <input
                  type="checkbox"
                  checked={hideZeroBalances}
                  onChange={(e) => setHideZeroBalances(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                />
                Hide Zero Balance Accounts
              </label>
            </div>
          </div>

          {/* StatStrip - Hide on Print */}
          <div className="print:hidden">
            <StatStrip
              items={[
                {
                  label: 'Total Assets',
                  value: formatCurrency(balanceSheet.totalAssets),
                  color: 'info',
                  icon: <Building className="w-4 h-4 text-blue-600" />,
                },
                {
                  label: 'Total Liabilities',
                  value: formatCurrency(balanceSheet.totalLiabilities),
                  color: 'danger',
                  icon: <Landmark className="w-4 h-4 text-rose-600" />,
                },
                {
                  label: 'Total Equity',
                  value: formatCurrency(balanceSheet.totalEquity),
                  subtext: `Incl. ${formatCurrency(balanceSheet.currentPeriodNetEarnings)} Profit`,
                  color: 'purple',
                  icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
                },
                {
                  label: 'Equation Parity',
                  value: balanceSheet.isBalanced ? 'Balanced' : 'Variance',
                  subtext: balanceSheet.isBalanced ? 'Assets = Liab. + Equity' : `Diff: ${formatCurrency(balanceSheet.variance)}`,
                  color: balanceSheet.isBalanced ? 'success' : 'danger',
                  icon: balanceSheet.isBalanced ? (
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
            <CenteredSpinner message="Compiling balance sheet statement..." />
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Balance Sheet Statement */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: ASSETS */}
              <div className="space-y-4">
                <TableContainer title="Assets">
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Current Assets</span>
                    <span className="text-xs font-semibold text-blue-700 tabular-nums">{formatCurrency(balanceSheet.totalCurrentAssets)}</span>
                  </div>
                  <Table dense>
                    <Table.Header sticky>
                      <Table.Row>
                        <Table.Head className="whitespace-nowrap">Code</Table.Head>
                        <Table.Head className="whitespace-nowrap">Account</Table.Head>
                        <Table.Head align="right" className="whitespace-nowrap">Balance</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {balanceSheet.currentAssets.length === 0 ? (
                        <Table.Row>
                          <td colSpan={3} className="text-center py-4 text-xs text-slate-400">No current assets</td>
                        </Table.Row>
                      ) : (
                        balanceSheet.currentAssets.map(a => (
                          <Table.Row key={a.accountId}>
                            <Table.Cell className="font-mono text-xs text-slate-500 whitespace-nowrap">{a.accountCode}</Table.Cell>
                            <Table.Cell className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.accountName}</Table.Cell>
                            <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-slate-900">
                              {formatCurrency(Math.abs(a.closingBalance))}
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>

                  {/* Non-Current Assets */}
                  {balanceSheet.nonCurrentAssets.length > 0 && (
                    <>
                      <div className="px-3.5 py-2 border-t border-b border-slate-100 bg-slate-50/60 flex items-center justify-between mt-2">
                        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Non-Current Assets</span>
                        <span className="text-xs font-semibold text-blue-700 tabular-nums">{formatCurrency(balanceSheet.totalNonCurrentAssets)}</span>
                      </div>
                      <Table dense>
                        <Table.Body>
                          {balanceSheet.nonCurrentAssets.map(a => (
                            <Table.Row key={a.accountId}>
                              <Table.Cell className="font-mono text-xs text-slate-500 whitespace-nowrap">{a.accountCode}</Table.Cell>
                              <Table.Cell className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.accountName}</Table.Cell>
                              <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-slate-900">
                                {formatCurrency(Math.abs(a.closingBalance))}
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </>
                  )}

                  {/* Total Assets Summary Footer */}
                  <div className="p-3.5 bg-blue-50/80 border-t-2 border-blue-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Total Assets</span>
                    <span className="text-sm font-bold text-blue-900 tabular-nums">{formatCurrency(balanceSheet.totalAssets)}</span>
                  </div>
                </TableContainer>
              </div>

              {/* Right Column: LIABILITIES & EQUITY */}
              <div className="space-y-4">
                {/* Liabilities */}
                <TableContainer title="Liabilities & Equity">
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Liabilities (Payables)</span>
                    <span className="text-xs font-semibold text-rose-700 tabular-nums">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                  </div>
                  <Table dense>
                    <Table.Header sticky>
                      <Table.Row>
                        <Table.Head className="whitespace-nowrap">Code</Table.Head>
                        <Table.Head className="whitespace-nowrap">Account</Table.Head>
                        <Table.Head align="right" className="whitespace-nowrap">Balance</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {balanceSheet.liabilityAccounts.length === 0 ? (
                        <Table.Row>
                          <td colSpan={3} className="text-center py-4 text-xs text-slate-400">No liabilities recorded</td>
                        </Table.Row>
                      ) : (
                        balanceSheet.liabilityAccounts.map(a => (
                          <Table.Row key={a.accountId}>
                            <Table.Cell className="font-mono text-xs text-slate-500 whitespace-nowrap">{a.accountCode}</Table.Cell>
                            <Table.Cell className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.accountName}</Table.Cell>
                            <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-rose-700">
                              {formatCurrency(Math.abs(a.closingBalance))}
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>

                  {/* Equity Section */}
                  <div className="px-3.5 py-2 border-t border-b border-slate-100 bg-slate-50/60 flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">Equity & Reserves</span>
                    <span className="text-xs font-semibold text-purple-700 tabular-nums">{formatCurrency(balanceSheet.totalEquity)}</span>
                  </div>
                  <Table dense>
                    <Table.Body>
                      {balanceSheet.equityAccounts.map(a => (
                        <Table.Row key={a.accountId}>
                          <Table.Cell className="font-mono text-xs text-slate-500 whitespace-nowrap">{a.accountCode}</Table.Cell>
                          <Table.Cell className="text-xs font-medium text-slate-800 whitespace-nowrap">{a.accountName}</Table.Cell>
                          <Table.Cell align="right" className="text-xs font-medium tabular-nums whitespace-nowrap text-slate-900">
                            {formatCurrency(Math.abs(a.closingBalance))}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {/* Retained Earnings / Current Period Net Earnings */}
                      <Table.Row>
                        <Table.Cell className="font-mono text-xs text-slate-400 whitespace-nowrap">-</Table.Cell>
                        <Table.Cell className="text-xs font-semibold text-purple-800 whitespace-nowrap">
                          Retained Earnings (Current Period Net Profit)
                        </Table.Cell>
                        <Table.Cell align="right" className="text-xs font-semibold tabular-nums whitespace-nowrap text-purple-800">
                          {formatCurrency(balanceSheet.currentPeriodNetEarnings)}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>

                  {/* Total Liabilities & Equity Footer */}
                  <div className="p-3.5 bg-purple-50/80 border-t-2 border-purple-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Total Liabilities & Equity</span>
                    <span className="text-sm font-bold text-purple-900 tabular-nums">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</span>
                  </div>
                </TableContainer>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
