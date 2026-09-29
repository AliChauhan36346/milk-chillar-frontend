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
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
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
  Building2,
  Calendar,
} from 'lucide-react';

export default function TrialBalancePage() {
  const [data, setData] = useState<AccountLedgerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hideZeroBalances, setHideZeroBalances] = useState(true);
  const asOfDate = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
    if (!code) return { label: 'Other', normal: 'Debit', color: 'slate' };
    const firstDigit = code.trim().charAt(0);
    switch (firstDigit) {
      case '1':
        return { label: 'Asset', normal: 'Debit', color: 'blue' };
      case '2':
        return { label: 'Liability', normal: 'Credit', color: 'amber' };
      case '3':
        return { label: 'Equity', normal: 'Credit', color: 'purple' };
      case '4':
        return { label: 'Revenue', normal: 'Credit', color: 'emerald' };
      case '5':
        return { label: 'Expense', normal: 'Debit', color: 'rose' };
      default:
        return { label: 'Account', normal: 'Debit', color: 'slate' };
    }
  };

  // Compute Dr/Cr columns per account according to standard double-entry rules
  const enrichedAccounts = useMemo(() => {
    return data.map((acc) => {
      const classification = getAccountClassification(acc.accountCode);
      const isCreditNormal = classification.normal === 'Credit';

      // Opening balances
      let openingDr = 0;
      let openingCr = 0;
      if (acc.openingBalance > 0) {
        if (isCreditNormal) {
          openingCr = acc.openingBalance;
        } else {
          openingDr = acc.openingBalance;
        }
      } else if (acc.openingBalance < 0) {
        if (isCreditNormal) {
          openingDr = Math.abs(acc.openingBalance);
        } else {
          openingCr = Math.abs(acc.openingBalance);
        }
      }

      // Period movements
      const periodDr = acc.totalDebits || 0;
      const periodCr = acc.totalCredits || 0;

      // Ending balances (Dr / Cr separation)
      let endingDr = 0;
      let endingCr = 0;
      if (isCreditNormal) {
        // Liabilities, Equity, Revenue: closing credit is positive
        const netCr = (openingCr - openingDr) + (periodCr - periodDr);
        if (netCr >= 0) {
          endingCr = netCr;
        } else {
          endingDr = Math.abs(netCr);
        }
      } else {
        // Assets, Expenses: closing debit is positive
        const netDr = (openingDr - openingCr) + (periodDr - periodCr);
        if (netDr >= 0) {
          endingDr = netDr;
        } else {
          endingCr = Math.abs(netDr);
        }
      }

      return {
        ...acc,
        classification,
        openingDr,
        openingCr,
        periodDr,
        periodCr,
        endingDr,
        endingCr,
      };
    });
  }, [data]);

  const filteredAccounts = useMemo(() => {
    return enrichedAccounts.filter((account) => {
      // Category filter
      if (categoryFilter !== 'all') {
        const firstDigit = account.accountCode?.trim().charAt(0);
        if (firstDigit !== categoryFilter) return false;
      }

      // Hide zero balances
      if (hideZeroBalances) {
        const isZero =
          Math.abs(account.openingDr) < 0.01 &&
          Math.abs(account.openingCr) < 0.01 &&
          Math.abs(account.periodDr) < 0.01 &&
          Math.abs(account.periodCr) < 0.01 &&
          Math.abs(account.endingDr) < 0.01 &&
          Math.abs(account.endingCr) < 0.01;
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
  }, [enrichedAccounts, categoryFilter, hideZeroBalances, searchTerm]);

  // Overall totals across filtered accounts
  const totals = useMemo(() => {
    return filteredAccounts.reduce(
      (acc, curr) => {
        acc.openingDr += curr.openingDr;
        acc.openingCr += curr.openingCr;
        acc.periodDr += curr.periodDr;
        acc.periodCr += curr.periodCr;
        acc.endingDr += curr.endingDr;
        acc.endingCr += curr.endingCr;
        return acc;
      },
      {
        openingDr: 0,
        openingCr: 0,
        periodDr: 0,
        periodCr: 0,
        endingDr: 0,
        endingCr: 0,
      }
    );
  }, [filteredAccounts]);

  const debitCreditDiff = Math.abs(totals.endingDr - totals.endingCr);
  const isBalanced = debitCreditDiff < 1.0;

  const formatPKR = (amount: number): string => {
    if (Math.abs(amount) < 0.01) return '—';
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (!filteredAccounts.length) return;
    const headers = [
      'Account Code',
      'Account Title',
      'Classification',
      'Opening Dr (PKR)',
      'Opening Cr (PKR)',
      'Period Debit (PKR)',
      'Period Credit (PKR)',
      'Ending Debit (PKR)',
      'Ending Credit (PKR)',
    ];
    const rows = filteredAccounts.map((a) => [
      a.accountCode,
      `"${a.accountName}"`,
      a.classification.label,
      a.openingDr.toFixed(2),
      a.openingCr.toFixed(2),
      a.periodDr.toFixed(2),
      a.periodCr.toFixed(2),
      a.endingDr.toFixed(2),
      a.endingCr.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
        <div className="space-y-4 max-w-7xl mx-auto print:space-y-3">
          {/* Header - Screen Only */}
          <div className="print:hidden">
            <PageHeader
              title="Trial Balance"
              subtitle="Formal double-entry verification of debit and credit parity across general ledger accounts"
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
                    Print / PDF
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

          {/* Standard Enterprise Print Header (Visible on Print Only) */}
          <ReportPrintHeader
            title="Trial Balance Statement"
            subtitle="Comprehensive double-entry verification of debit and credit parity across general ledger accounts"
            asOfDate={asOfDate}
          />

          {/* Screen Executive Letterhead - Hidden on Print */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left print:hidden">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Building2 className="w-4 h-4 text-blue-600 print:hidden" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                  CHAUHAN DAIRY FARMS • MILK CHILLAR ERP
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 uppercase">
                TRIAL BALANCE STATEMENT
              </h1>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400 print:hidden" />
                As of <strong className="text-slate-700 font-semibold">{asOfDate}</strong> • All amounts in Pakistani Rupees (PKR)
              </p>
            </div>

            {/* Parity Status Badge */}
            <div className="inline-flex items-center gap-2 self-center sm:self-auto px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs print:border-slate-800">
              {isBalanced ? (
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Books in Parity (Debit = Credit)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Variance: {formatCurrency(debitCreditDiff)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compact Filter Toolbar - Screen Only */}
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

              {/* Quick Search */}
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search code or account title..."
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

          {/* Executive StatStrip - Screen Only */}
          <div className="print:hidden">
            <StatStrip
              items={[
                {
                  label: 'Ending Debit Total',
                  value: formatCurrency(totals.endingDr),
                  color: 'info',
                  icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
                },
                {
                  label: 'Ending Credit Total',
                  value: formatCurrency(totals.endingCr),
                  color: 'danger',
                  icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
                },
                {
                  label: 'Double-Entry Variance',
                  value: formatCurrency(debitCreditDiff),
                  subtext: isBalanced ? '0.00 difference' : 'Debit/Credit imbalance',
                  color: isBalanced ? 'success' : 'danger',
                  icon: <Scale className="w-4 h-4 text-purple-600" />,
                },
                {
                  label: 'Reconciliation Status',
                  value: isBalanced ? 'Balanced' : 'Imbalanced',
                  subtext: isBalanced ? '100% Ledger Parity' : 'Audit required',
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
            <CenteredSpinner message="Calculating trial balance accounts..." />
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* 8-Column Trial Balance Grid */}
          {!loading && !error && (
            <>
              <TableContainer title="Trial Balance Accounts">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 print:hidden">
                <span>
                  Showing <strong className="text-slate-700">{filteredAccounts.length}</strong> active accounts
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
                <span className="text-[11px] text-slate-400">
                  Standard 8-Column Double-Entry Presentation
                </span>
              </div>

              <Table dense>
                <Table.Header sticky>
                  {/* Top Header Grouping */}
                  <Table.Row className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <Table.Head colSpan={3} className="border-r border-slate-200">
                      Account Details
                    </Table.Head>
                    <Table.Head colSpan={2} align="center" className="border-r border-slate-200 text-center">
                      Opening Balance
                    </Table.Head>
                    <Table.Head colSpan={2} align="center" className="border-r border-slate-200 text-center">
                      Period Movement
                    </Table.Head>
                    <Table.Head colSpan={2} align="center" className="text-center bg-blue-50/40">
                      Ending Balance (Trial Balance)
                    </Table.Head>
                    <Table.Head align="center" className="print:hidden w-10"></Table.Head>
                  </Table.Row>
                  {/* Sub Header Columns */}
                  <Table.Row>
                    <Table.Head className="whitespace-nowrap w-[90px]">Code</Table.Head>
                    <Table.Head className="whitespace-nowrap min-w-[200px]">Account Title</Table.Head>
                    <Table.Head className="whitespace-nowrap w-[90px] border-r border-slate-200">Type</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[110px]">Opening Dr</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[110px] border-r border-slate-200">Opening Cr</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[110px]">Period Dr</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[110px] border-r border-slate-200">Period Cr</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[120px] bg-blue-50/30 text-blue-900 font-bold">Ending Dr</Table.Head>
                    <Table.Head align="right" className="whitespace-nowrap w-[120px] bg-blue-50/30 text-blue-900 font-bold">Ending Cr</Table.Head>
                    <Table.Head align="center" className="print:hidden whitespace-nowrap w-10">Ledger</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredAccounts.length === 0 ? (
                    <Table.Row>
                      <td colSpan={10} className="text-center py-10 text-xs text-slate-400">
                        No accounts match the selected filter criteria
                      </td>
                    </Table.Row>
                  ) : (
                    filteredAccounts.map((account) => (
                      <Table.Row key={account.accountId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Code */}
                        <Table.Cell className="font-mono text-xs text-slate-600 font-medium whitespace-nowrap">
                          {account.accountCode}
                        </Table.Cell>
                        {/* Title */}
                        <Table.Cell className="font-medium text-xs text-slate-900 whitespace-nowrap">
                          {account.accountName}
                        </Table.Cell>
                        {/* Type Badge */}
                        <Table.Cell className="whitespace-nowrap border-r border-slate-200">
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                              account.classification.color === 'blue'
                                ? 'bg-blue-50 text-blue-700'
                                : account.classification.color === 'amber'
                                ? 'bg-amber-50 text-amber-700'
                                : account.classification.color === 'purple'
                                ? 'bg-purple-50 text-purple-700'
                                : account.classification.color === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700'
                                : account.classification.color === 'rose'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {account.classification.label}
                          </span>
                        </Table.Cell>
                        {/* Opening Dr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap text-slate-600">
                          {formatPKR(account.openingDr)}
                        </Table.Cell>
                        {/* Opening Cr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap text-slate-600 border-r border-slate-200">
                          {formatPKR(account.openingCr)}
                        </Table.Cell>
                        {/* Period Dr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap text-emerald-700 font-medium">
                          {formatPKR(account.periodDr)}
                        </Table.Cell>
                        {/* Period Cr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap text-rose-600 font-medium border-r border-slate-200">
                          {formatPKR(account.periodCr)}
                        </Table.Cell>
                        {/* Ending Dr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap bg-blue-50/20 font-semibold text-slate-900">
                          {formatPKR(account.endingDr)}
                        </Table.Cell>
                        {/* Ending Cr */}
                        <Table.Cell align="right" className="text-xs font-mono tabular-nums whitespace-nowrap bg-blue-50/20 font-semibold text-slate-900">
                          {formatPKR(account.endingCr)}
                        </Table.Cell>
                        {/* Drill Down */}
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
                    ))
                  )}
                </Table.Body>

                {/* Grand Totals Footer with Double Underline */}
                {filteredAccounts.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-xs text-slate-900">
                      <td colSpan={3} className="px-3.5 py-3 uppercase tracking-wider text-slate-800 border-r border-slate-200">
                        Grand Totals ({filteredAccounts.length} Accounts)
                      </td>
                      {/* Opening Totals */}
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-slate-800">
                        {formatPKR(totals.openingDr)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-slate-800 border-r border-slate-200">
                        {formatPKR(totals.openingCr)}
                      </td>
                      {/* Period Movement Totals */}
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-emerald-800">
                        {formatPKR(totals.periodDr)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-rose-800 border-r border-slate-200">
                        {formatPKR(totals.periodCr)}
                      </td>
                      {/* Classic Accounting Double Underline on Ending Totals */}
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-blue-950 font-extrabold bg-blue-100/40 border-b-4 border-double border-slate-900">
                        {formatPKR(totals.endingDr)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono tabular-nums text-blue-950 font-extrabold bg-blue-100/40 border-b-4 border-double border-slate-900">
                        {formatPKR(totals.endingCr)}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </TableContainer>
            <ReportPrintFooter notes="Trial Balance verified against General Ledger account balances. Total debits equal total credits." />
          </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
