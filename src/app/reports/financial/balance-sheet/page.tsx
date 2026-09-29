'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip } from '@/components/ui/StatStrip';
import { TableContainer } from '@/components/ui/Table/Table';
import { CenteredSpinner } from '@/components/ui/spinner';
import { getAllAccountBalances, AccountLedgerSummary } from '@/lib/api/accountLedger';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  TrendingUp,
  Wallet,
  Landmark,
  ShieldCheck,
  Scale,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { FormalBalanceSheet } from '@/components/financial/FormalBalanceSheet';

export default function BalanceSheetPage() {
  const [data, setData] = useState<AccountLedgerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideZeroBalances, setHideZeroBalances] = useState(true);
  const [activeTab, setActiveTab] = useState<'statement' | 'dashboard'>('statement');
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
      console.error('Failed to load balance sheet accounts:', err);
      setError(err?.message || 'Failed to retrieve balance sheet records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Group accounts according to standard accounting classifications (IFRS / GAAP)
  const balanceSheet = useMemo(() => {
    // 100s: Assets
    const assetAccounts = data.filter((a) => a.accountCode?.startsWith('1'));
    // 200s: Liabilities
    const liabilityAccounts = data.filter((a) => a.accountCode?.startsWith('2'));
    // 300s: Equity
    const equityAccounts = data.filter((a) => a.accountCode?.startsWith('3'));

    // 400s & 500s: Net Profit to close into Retained Earnings / Equity
    const revenueAccounts = data.filter((a) => a.accountCode?.startsWith('4'));
    const expenseAccounts = data.filter((a) => a.accountCode?.startsWith('5'));

    const totalRevenue = revenueAccounts.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalExpenses = expenseAccounts.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const currentPeriodNetEarnings = totalRevenue - totalExpenses;

    // Classify Assets: Current vs Non-Current
    // 101: Cash, 102: Bank, 103: Receivables, 104: Inventory = Current Assets
    const currentAssets = assetAccounts.filter((a) => {
      const prefix = a.accountCode?.substring(0, 3);
      return prefix === '101' || prefix === '102' || prefix === '103' || prefix === '104';
    });
    const nonCurrentAssets = assetAccounts.filter((a) => {
      const prefix = a.accountCode?.substring(0, 3);
      return prefix !== '101' && prefix !== '102' && prefix !== '103' && prefix !== '104';
    });

    // Classify Liabilities: Current vs Long-Term
    // 201: Payables, 202: Accruals = Current Liabilities
    const currentLiabilities = liabilityAccounts.filter((a) => {
      const prefix = a.accountCode?.substring(0, 3);
      return prefix === '201' || prefix === '202' || !a.accountCode?.startsWith('205');
    });
    const nonCurrentLiabilities = liabilityAccounts.filter((a) => {
      return a.accountCode?.startsWith('205');
    });

    // Subtotals
    const totalCurrentAssets = currentAssets.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalNonCurrentAssets = nonCurrentAssets.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

    const totalCurrentLiabilities = currentLiabilities.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

    const baseEquity = equityAccounts.reduce(
      (sum, a) => sum + Math.abs(a.closingBalance || 0),
      0
    );
    const totalEquity = baseEquity + currentPeriodNetEarnings;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
    const isBalanced = variance < 5.0; // Rounding tolerance

    return {
      currentAssets: hideZeroBalances
        ? currentAssets.filter((a) => Math.abs(a.closingBalance || 0) > 0.01)
        : currentAssets,
      nonCurrentAssets: hideZeroBalances
        ? nonCurrentAssets.filter((a) => Math.abs(a.closingBalance || 0) > 0.01)
        : nonCurrentAssets,
      totalCurrentAssets,
      totalNonCurrentAssets,
      totalAssets,

      currentLiabilities: hideZeroBalances
        ? currentLiabilities.filter((a) => Math.abs(a.closingBalance || 0) > 0.01)
        : currentLiabilities,
      nonCurrentLiabilities: hideZeroBalances
        ? nonCurrentLiabilities.filter((a) => Math.abs(a.closingBalance || 0) > 0.01)
        : nonCurrentLiabilities,
      totalCurrentLiabilities,
      totalNonCurrentLiabilities,
      totalLiabilities,

      equityAccounts: hideZeroBalances
        ? equityAccounts.filter((a) => Math.abs(a.closingBalance || 0) > 0.01)
        : equityAccounts,
      baseEquity,
      currentPeriodNetEarnings,
      totalEquity,

      totalLiabilitiesAndEquity,
      variance,
      isBalanced,
    };
  }, [data, hideZeroBalances]);

  const handleExportCSV = () => {
    const rows = [
      ['STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)'],
      [`As of ${asOfDate}`, 'Amounts in PKR'],
      [''],
      ['SECTION / ACCOUNT CODE', 'ACCOUNT TITLE', 'AMOUNT (PKR)'],
      ['ASSETS'],
      ['Current Assets'],
      ...balanceSheet.currentAssets.map((a) => [
        a.accountCode,
        `"${a.accountName}"`,
        Math.abs(a.closingBalance || 0).toFixed(2),
      ]),
      ['Total Current Assets', '', balanceSheet.totalCurrentAssets.toFixed(2)],
      ['Non-Current Assets'],
      ...balanceSheet.nonCurrentAssets.map((a) => [
        a.accountCode,
        `"${a.accountName}"`,
        Math.abs(a.closingBalance || 0).toFixed(2),
      ]),
      ['Total Non-Current Assets', '', balanceSheet.totalNonCurrentAssets.toFixed(2)],
      ['TOTAL ASSETS', '', balanceSheet.totalAssets.toFixed(2)],
      [''],
      ['LIABILITIES'],
      ['Current Liabilities'],
      ...balanceSheet.currentLiabilities.map((a) => [
        a.accountCode,
        `"${a.accountName}"`,
        Math.abs(a.closingBalance || 0).toFixed(2),
      ]),
      ['Total Current Liabilities', '', balanceSheet.totalCurrentLiabilities.toFixed(2)],
      ['TOTAL LIABILITIES', '', balanceSheet.totalLiabilities.toFixed(2)],
      [''],
      ['EQUITY'],
      ...balanceSheet.equityAccounts.map((a) => [
        a.accountCode,
        `"${a.accountName}"`,
        Math.abs(a.closingBalance || 0).toFixed(2),
      ]),
      [
        'Retained Earnings / Current Period Net Earnings',
        '',
        balanceSheet.currentPeriodNetEarnings.toFixed(2),
      ],
      ['TOTAL EQUITY', '', balanceSheet.totalEquity.toFixed(2)],
      [''],
      ['TOTAL LIABILITIES AND EQUITY', '', balanceSheet.totalLiabilitiesAndEquity.toFixed(2)],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-sheet-${new Date().toISOString().split('T')[0]}.csv`;
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
              title="Balance Sheet"
              subtitle="Statement of Financial Position presenting categorized assets, liabilities, and owner's equity"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={loading}
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

          {/* Navigation Tabs - Hidden on Print */}
          <div className="border-b border-gray-200 print:hidden">
            <nav className="-mb-px flex space-x-6 sm:space-x-8">
              <button
                onClick={() => setActiveTab('statement')}
                className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'statement'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2 text-blue-600" />
                Formal Statement (CPA Report)
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3.5 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Executive Breakdown
              </button>
            </nav>
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

          {/* Screen Formal Statement View */}
          {!loading && !error && activeTab === 'statement' && (
            <div className="py-2 print:hidden">
              <FormalBalanceSheet
                data={balanceSheet}
                asOfDate={asOfDate}
                companyName="CHAUHAN DAIRY FARMS"
                currency="PKR"
              />
            </div>
          )}

          {/* Screen Dashboard View */}
          {!loading && !error && activeTab === 'dashboard' && (
            <div className="space-y-4 print:hidden">
              {/* Screen Formal Letterhead */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                      CHAUHAN DAIRY FARMS • MILK CHILLAR ERP
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 uppercase">
                    STATEMENT OF FINANCIAL POSITION
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    As of <strong className="text-slate-700 font-semibold">{asOfDate}</strong> • All amounts in Pakistani Rupees (PKR)
                  </p>
                </div>

                {/* Parity Status Badge */}
                <div className="inline-flex items-center gap-2 self-center sm:self-auto px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs">
                  {balanceSheet.isBalanced ? (
                    <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Equation Balanced (Assets = Liab. + Equity)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Parity Variance: {formatCurrency(balanceSheet.variance)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Screen Toolbar */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Classified Balance Sheet Format (Report Form)
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={hideZeroBalances}
                    onChange={(e) => setHideZeroBalances(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-3.5 h-3.5"
                  />
                  Hide Zero Balances
                </label>
              </div>

              {/* Executive StatStrip */}
              <StatStrip
                items={[
                  {
                    label: 'Total Assets',
                    value: formatCurrency(balanceSheet.totalAssets),
                    color: 'info',
                    icon: <Wallet className="w-4 h-4 text-blue-600" />,
                  },
                  {
                    label: 'Total Liabilities',
                    value: formatCurrency(balanceSheet.totalLiabilities),
                    color: 'danger',
                    icon: <Landmark className="w-4 h-4 text-rose-600" />,
                  },
                  {
                    label: 'Total Equity & Reserves',
                    value: formatCurrency(balanceSheet.totalEquity),
                    subtext: `Incl. ${formatCurrency(balanceSheet.currentPeriodNetEarnings)} Profit`,
                    color: 'purple',
                    icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
                  },
                  {
                    label: 'Equation Parity',
                    value: balanceSheet.isBalanced ? 'Balanced' : 'Variance',
                    subtext: balanceSheet.isBalanced
                      ? 'Assets = Liab. + Equity'
                      : `Diff: ${formatCurrency(balanceSheet.variance)}`,
                    color: balanceSheet.isBalanced ? 'success' : 'danger',
                    icon: balanceSheet.isBalanced ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ),
                  },
                ]}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* LEFT COLUMN: ASSETS */}
              <div className="space-y-4">
                <TableContainer title="Assets (Statement of Financial Position)">
                  <div className="divide-y divide-slate-100 text-xs">
                    {/* CURRENT ASSETS SECTION */}
                    <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        1. Current Assets
                      </span>
                      <span className="font-semibold text-slate-600 text-[11px]">
                        Cash, Receivables & Inventories
                      </span>
                    </div>

                    {balanceSheet.currentAssets.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic">No current asset accounts recorded</div>
                    ) : (
                      balanceSheet.currentAssets.map((a) => (
                        <div
                          key={a.accountId}
                          className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 text-[11px] w-14">
                              {a.accountCode}
                            </span>
                            <span className="font-medium text-slate-800">{a.accountName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-slate-900 font-medium">
                              {formatPKR(Math.abs(a.closingBalance))}
                            </span>
                            <Link
                              href={`/Accounts/accountLedger?accountId=${a.accountId}`}
                              className="print:hidden text-slate-400 hover:text-blue-600 transition-colors"
                              title="View Ledger"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Subtotal: Current Assets */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-semibold border-t border-slate-200 text-slate-800">
                      <span>Total Current Assets</span>
                      <span className="font-mono tabular-nums text-blue-900 font-bold border-t border-slate-400">
                        {formatPKR(balanceSheet.totalCurrentAssets)}
                      </span>
                    </div>

                    {/* NON-CURRENT ASSETS SECTION */}
                    <div className="p-3 bg-slate-50/70 border-t-2 border-b border-slate-200 flex items-center justify-between mt-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        2. Non-Current Assets
                      </span>
                      <span className="font-semibold text-slate-600 text-[11px]">
                        Chillars, Equipment & Plant
                      </span>
                    </div>

                    {balanceSheet.nonCurrentAssets.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic">No non-current asset accounts recorded</div>
                    ) : (
                      balanceSheet.nonCurrentAssets.map((a) => (
                        <div
                          key={a.accountId}
                          className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 text-[11px] w-14">
                              {a.accountCode}
                            </span>
                            <span className="font-medium text-slate-800">{a.accountName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-slate-900 font-medium">
                              {formatPKR(Math.abs(a.closingBalance))}
                            </span>
                            <Link
                              href={`/Accounts/accountLedger?accountId=${a.accountId}`}
                              className="print:hidden text-slate-400 hover:text-blue-600 transition-colors"
                              title="View Ledger"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Subtotal: Non-Current Assets */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-semibold border-t border-slate-200 text-slate-800">
                      <span>Total Non-Current Assets</span>
                      <span className="font-mono tabular-nums text-blue-900 font-bold border-t border-slate-400">
                        {formatPKR(balanceSheet.totalNonCurrentAssets)}
                      </span>
                    </div>

                    {/* GRAND TOTAL ASSETS WITH DOUBLE UNDERLINE */}
                    <div className="p-4 bg-blue-50/80 border-t-2 border-slate-300 flex items-center justify-between font-bold text-xs">
                      <span className="uppercase tracking-wider text-blue-950 text-sm">
                        TOTAL ASSETS
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-blue-950 border-b-4 border-double border-slate-900">
                        {formatCurrency(balanceSheet.totalAssets)}
                      </span>
                    </div>
                  </div>
                </TableContainer>
              </div>

              {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
              <div className="space-y-4">
                <TableContainer title="Liabilities & Equity (Statement of Financial Position)">
                  <div className="divide-y divide-slate-100 text-xs">
                    {/* CURRENT LIABILITIES SECTION */}
                    <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        1. Current Liabilities
                      </span>
                      <span className="font-semibold text-slate-600 text-[11px]">
                        Payables, Dodhi Dues & Accruals
                      </span>
                    </div>

                    {balanceSheet.currentLiabilities.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic">No current liabilities recorded</div>
                    ) : (
                      balanceSheet.currentLiabilities.map((a) => (
                        <div
                          key={a.accountId}
                          className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 text-[11px] w-14">
                              {a.accountCode}
                            </span>
                            <span className="font-medium text-slate-800">{a.accountName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-rose-700 font-medium">
                              {formatPKR(Math.abs(a.closingBalance))}
                            </span>
                            <Link
                              href={`/Accounts/accountLedger?accountId=${a.accountId}`}
                              className="print:hidden text-slate-400 hover:text-blue-600 transition-colors"
                              title="View Ledger"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Subtotal: Current Liabilities */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-semibold border-t border-slate-200 text-slate-800">
                      <span>Total Current Liabilities</span>
                      <span className="font-mono tabular-nums text-rose-900 font-bold border-t border-slate-400">
                        {formatPKR(balanceSheet.totalCurrentLiabilities)}
                      </span>
                    </div>

                    {/* Subtotal: Total Liabilities */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50/50 font-bold border-t border-slate-300 text-rose-900">
                      <span className="uppercase tracking-wide">TOTAL LIABILITIES</span>
                      <span className="font-mono tabular-nums text-rose-950 font-bold">
                        {formatPKR(balanceSheet.totalLiabilities)}
                      </span>
                    </div>

                    {/* EQUITY SECTION */}
                    <div className="p-3 bg-slate-50/70 border-t-2 border-b border-slate-200 flex items-center justify-between mt-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        2. Equity & Reserves
                      </span>
                      <span className="font-semibold text-slate-600 text-[11px]">
                        Capital, Reserves & Earnings
                      </span>
                    </div>

                    {balanceSheet.equityAccounts.map((a) => (
                      <div
                        key={a.accountId}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500 text-[11px] w-14">
                            {a.accountCode}
                          </span>
                          <span className="font-medium text-slate-800">{a.accountName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums text-slate-900 font-medium">
                            {formatPKR(Math.abs(a.closingBalance))}
                          </span>
                          <Link
                            href={`/Accounts/accountLedger?accountId=${a.accountId}`}
                            className="print:hidden text-slate-400 hover:text-blue-600 transition-colors"
                            title="View Ledger"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Current Period Net Income transferred from P&L */}
                    <div className="flex items-center justify-between px-4 py-2 bg-purple-50/40">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-600 text-[11px] w-14">P&L</span>
                        <span className="font-semibold text-purple-900">
                          Current Period Net Earnings (from P&L)
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-purple-900 font-semibold">
                        {formatPKR(balanceSheet.currentPeriodNetEarnings)}
                      </span>
                    </div>

                    {/* Subtotal: Total Equity */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-semibold border-t border-slate-200 text-slate-800">
                      <span>Total Equity & Reserves</span>
                      <span className="font-mono tabular-nums text-purple-900 font-bold border-t border-slate-400">
                        {formatPKR(balanceSheet.totalEquity)}
                      </span>
                    </div>

                    {/* GRAND TOTAL LIABILITIES & EQUITY WITH DOUBLE UNDERLINE */}
                    <div className="p-4 bg-purple-50/80 border-t-2 border-slate-300 flex items-center justify-between font-bold text-xs">
                      <span className="uppercase tracking-wider text-purple-950 text-sm">
                        TOTAL LIABILITIES & EQUITY
                      </span>
                      <span className="text-base font-extrabold font-mono tabular-nums text-purple-950 border-b-4 border-double border-slate-900">
                        {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                      </span>
                    </div>
                  </div>
                </TableContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRINT-ONLY CONTAINER: Strictly renders the Formal Accounting Statement    */}
        {/* ========================================================================= */}
        {!loading && !error && (
          <div className="hidden print:block w-full">
            <FormalBalanceSheet
              data={balanceSheet}
              asOfDate={asOfDate}
              companyName="CHAUHAN DAIRY FARMS"
              currency="PKR"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  </ProtectedRoute>
);
}
