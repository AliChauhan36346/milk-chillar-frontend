'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { CenteredSpinner } from '@/components/ui/spinner';
import { fetchAdminDashboardStats, AdminDashboardStats } from '@/lib/api/reports';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Wallet,
  Banknote,
  Building,
  Receipt,
  Clock,
  BookOpen,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Scale,
  Milk,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useFinancialYear } from '@/context/FinancialYearContext';

// Register required Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const { activeYear, selectedYear, isHistoricalMode } = useFinancialYear();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const data = await fetchAdminDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  // Derived financial computations
  const totalLiquidity = useMemo(() => {
    if (!stats) return 0;
    return (stats.totalLiquidity ?? (stats.cashBalance + stats.bankBalance)) || 0;
  }, [stats]);

  const netWorkingPosition = useMemo(() => {
    if (!stats) return 0;
    return (stats.netWorkingPosition ?? (stats.dueReceipts - stats.pendingPayments)) || 0;
  }, [stats]);

  // Chart data setup for Real Monthly Financial Trends
  const trendChartData = useMemo(() => {
    if (!stats?.monthlyTrends || stats.monthlyTrends.length === 0) {
      return {
        labels: ['No Data'],
        datasets: []
      };
    }

    const labels = stats.monthlyTrends.map((t) => t.monthLabel);
    const revenues = stats.monthlyTrends.map((t) => t.revenue);
    const expenses = stats.monthlyTrends.map((t) => t.expense);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue (Income)',
          data: revenues,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Operating & Milk Cost',
          data: expenses,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }, [stats?.monthlyTrends]);

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4">
          {/* HEADER & COMPACT QUICK-ACTION RIBBON */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Financial Cockpit</h1>
                {(selectedYear || activeYear) && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    isHistoricalMode ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <Calendar size={11} className={isHistoricalMode ? "text-amber-600" : "text-blue-500"} />
                    <span>FY: {(selectedYear || activeYear)?.name}</span>
                    {selectedYear?.isActive && (
                      <span className="text-[9px] px-1 bg-green-100 text-green-700 rounded font-bold">Active</span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Real-time liquidity, working capital, live P&L trends, and daily milk operations
              </p>
            </div>

            {/* Space-Saving Quick Action Strip */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <Link
                href="/Accounts/transactions/cashPayments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-colors shadow-2xs"
              >
                <Plus size={13} className="text-blue-600" />
                <span>Payment</span>
              </Link>

              <Link
                href="/Accounts/transactions/receipts/create"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-colors shadow-2xs"
              >
                <Plus size={13} className="text-emerald-600" />
                <span>Receipt</span>
              </Link>

              <Link
                href="/Purchase/SimplePurchase"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shadow-2xs"
              >
                <Milk size={13} className="text-indigo-600" />
                <span>Milk Purchase</span>
              </Link>

              <Link
                href="/Sales"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 transition-colors shadow-2xs"
              >
                <ShoppingCart size={13} className="text-purple-600" />
                <span>Milk Sale</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

              <Link
                href="/Accounts/accountLedger"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <BookOpen size={13} className="text-slate-500" />
                <span>Ledger</span>
              </Link>

              <Link
                href="/reports/financialReports/accountBalances"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <Scale size={13} className="text-slate-500" />
                <span>Balances</span>
              </Link>

              <button
                onClick={() => loadDashboardStats(true)}
                disabled={isRefreshing || loading}
                title="Refresh Metrics"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>

          {/* COMPACT KPI METRIC ROW (5 Slim Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Total Available Liquidity */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-blue-300 transition-all border-t-2 border-t-blue-600">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Liquidity</span>
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-base font-bold text-slate-800 font-mono">
                {loading ? '...' : `Rs. ${totalLiquidity.toLocaleString()}`}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Funds Available</span>
                <span className="text-blue-600 font-medium">Cash + Bank</span>
              </div>
            </div>

            {/* Card 2: Cash in Hand */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-emerald-300 transition-all border-t-2 border-t-emerald-500">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Cash in Hand</span>
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-base font-bold text-slate-800 font-mono">
                {loading ? '...' : `Rs. ${(stats?.cashBalance || 0).toLocaleString()}`}
              </p>
              <div className="mt-1 flex items-center text-[10px] text-slate-500">
                {(stats?.todayCashChange || 0) >= 0 ? (
                  <span className="text-emerald-600 font-semibold inline-flex items-center">
                    <ArrowUpRight size={11} />+Rs. {Math.abs(stats?.todayCashChange || 0).toLocaleString()} today
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold inline-flex items-center">
                    <ArrowDownRight size={11} />-Rs. {Math.abs(stats?.todayCashChange || 0).toLocaleString()} today
                  </span>
                )}
              </div>
            </div>

            {/* Card 3: Bank Accounts */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-purple-300 transition-all border-t-2 border-t-purple-500">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Bank Balance</span>
                <Building className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p className="text-base font-bold text-slate-800 font-mono">
                {loading ? '...' : `Rs. ${(stats?.bankBalance || 0).toLocaleString()}`}
              </p>
              <div className="mt-1 flex items-center text-[10px] text-slate-500">
                {(stats?.todayBankChange || 0) >= 0 ? (
                  <span className="text-emerald-600 font-semibold inline-flex items-center">
                    <ArrowUpRight size={11} />+Rs. {Math.abs(stats?.todayBankChange || 0).toLocaleString()} today
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold inline-flex items-center">
                    <ArrowDownRight size={11} />-Rs. {Math.abs(stats?.todayBankChange || 0).toLocaleString()} today
                  </span>
                )}
              </div>
            </div>

            {/* Card 4: Receivables (Due from Buyers) */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-teal-300 transition-all border-t-2 border-t-teal-500">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Receivables</span>
                <Receipt className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-base font-bold text-slate-800 font-mono">
                {loading ? '...' : `Rs. ${(stats?.dueReceipts || 0).toLocaleString()}`}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Due from Buyers</span>
                <span className="text-slate-700 font-medium">{stats?.dueReceiptsCount || 0} Accounts</span>
              </div>
            </div>

            {/* Card 5: Payables (Owed to Dodhis / Suppliers) */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-amber-300 transition-all border-t-2 border-t-amber-500">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Payables</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-base font-bold text-slate-800 font-mono">
                {loading ? '...' : `Rs. ${(stats?.pendingPayments || 0).toLocaleString()}`}
              </p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Owed to Suppliers</span>
                <span className="text-slate-700 font-medium">{stats?.pendingPaymentsCount || 0} Accounts</span>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: REAL FINANCIAL PERFORMANCE & WORKING CAPITAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart: Real Monthly Financial Trends (P&L Data) */}
            <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-600" />
                    Financial Trends & Performance (Last 6 Months)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live Revenue vs Operating Expenses from General Ledger
                  </p>
                </div>

                <Link
                  href="/reports/financialReports/profitLoss"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>P&L Statement</span>
                  <ExternalLink size={11} />
                </Link>
              </div>

              {loading ? (
                <div className="h-[210px] flex items-center justify-center text-slate-400">
                  <CenteredSpinner size="md" />
                </div>
              ) : error ? (
                <div className="h-[210px] flex flex-col items-center justify-center text-red-500 text-xs">
                  <AlertCircle size={20} className="mb-1" />
                  <span>{error}</span>
                </div>
              ) : (
                <div className="h-[210px] w-full">
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'end',
                          labels: {
                            boxWidth: 8,
                            boxHeight: 8,
                            usePointStyle: true,
                            font: { size: 11, weight: 'bold' }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: Rs. ${(ctx.raw as number).toLocaleString()}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: { size: 10 },
                            callback: (val) => `${Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val}`
                          },
                          grid: { color: 'rgba(226, 232, 240, 0.6)' }
                        },
                        x: {
                          ticks: { font: { size: 10 } },
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right: Working Capital & Liquidity Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Scale size={14} className="text-blue-600" />
                  Working Capital & Liquidity
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Balance sheet position and available reserves</p>

                {/* Net Position Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Net Working Position
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className={`text-base font-bold font-mono ${netWorkingPosition >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {netWorkingPosition >= 0 ? '+' : '-'}Rs. {Math.abs(netWorkingPosition).toLocaleString()}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        netWorkingPosition >= 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {netWorkingPosition >= 0 ? 'Surplus' : 'Deficit'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Calculated as Receivables (Rs. {(stats?.dueReceipts || 0).toLocaleString()}) minus Payables (Rs. {(stats?.pendingPayments || 0).toLocaleString()}).
                  </p>
                </div>

                {/* Cash vs Bank Distribution Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium text-slate-600">
                    <span>Funds Distribution</span>
                    <span>
                      {totalLiquidity > 0
                        ? `${Math.round(((stats?.cashBalance || 0) / totalLiquidity) * 100)}% Cash / ${Math.round(((stats?.bankBalance || 0) / totalLiquidity) * 100)}% Bank`
                        : '0% / 0%'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{
                        width: totalLiquidity > 0 ? `${((stats?.cashBalance || 0) / totalLiquidity) * 100}%` : '50%'
                      }}
                      className="h-full bg-emerald-500"
                      title="Cash Ratio"
                    />
                    <div
                      style={{
                        width: totalLiquidity > 0 ? `${((stats?.bankBalance || 0) / totalLiquidity) * 100}%` : '50%'
                      }}
                      className="h-full bg-purple-500"
                      title="Bank Ratio"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="pt-3 border-t border-slate-100 mt-3 grid grid-cols-2 gap-2 text-center">
                <Link
                  href="/reports/financialReports/accountBalances"
                  className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
                >
                  Payables Detail
                </Link>
                <Link
                  href="/Accounts/transactions"
                  className="py-1.5 px-2 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View Cash Flow
                </Link>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: TODAY'S OPERATIONAL PULSE & LIVE ROZNAMCHA FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Today's Milk Operational Pulse */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Milk size={14} className="text-indigo-600" />
                      Today's Milk Operations Pulse
                    </h3>
                    <p className="text-[11px] text-slate-400">Daily intake, sales volume, and gross procurement</p>
                  </div>
                  <Link
                    href="/reports/daily-totals"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Daily Totals &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Purchased Milk Card */}
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase">Milk Purchased Today</span>
                    <p className="text-base font-bold text-indigo-950 font-mono mt-1">
                      {(stats?.todayPurchaseLiters || 0).toLocaleString()} <span className="text-xs font-normal">Ltrs</span>
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-indigo-800/80 mt-1 pt-1 border-t border-indigo-200/60 font-mono">
                      <span>Total:</span>
                      <span>Rs. {(stats?.todayPurchaseAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Sold Milk Card */}
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                    <span className="text-[10px] font-semibold text-purple-700 uppercase">Milk Sold Today</span>
                    <p className="text-base font-bold text-purple-950 font-mono mt-1">
                      {(stats?.todaySalesLiters || 0).toLocaleString()} <span className="text-xs font-normal">Ltrs</span>
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-purple-800/80 mt-1 pt-1 border-t border-purple-200/60 font-mono">
                      <span>Total:</span>
                      <span>Rs. {(stats?.todaySalesAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                <span className="text-[11px] text-slate-400">Need to record daily milk intake?</span>
                <Link
                  href="/Purchase/SimplePurchase"
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Quick Milk Entry</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right: Live Roznamcha Stream (Recent Vouchers) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-amber-600" />
                      Live Roznamcha Stream (Recent Activity)
                    </h3>
                    <p className="text-[11px] text-slate-400">Latest financial vouchers and journal postings</p>
                  </div>
                  <Link
                    href="/Accounts/accountLedger"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Full Ledger &rarr;
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Loading activity...</div>
                ) : !stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No transactions recorded today yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.recentTransactions.map((tx) => (
                      <div key={tx.journalEntryId} className="py-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              tx.transactionType === 'Debit'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {tx.sourceTable}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{tx.accountName}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{tx.description}</p>
                          </div>
                        </div>

                        <div className="text-right font-mono font-bold">
                          <span className={tx.transactionType === 'Debit' ? 'text-blue-600' : 'text-emerald-600'}>
                            Rs. {tx.amount.toLocaleString()}
                          </span>
                          <p className="text-[9px] font-normal text-slate-400">
                            {new Date(tx.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-400">All vouchers post automatically to ledgers.</span>
                <Link
                  href="/Accounts/transactions/cashPayments"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Manage Transactions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}