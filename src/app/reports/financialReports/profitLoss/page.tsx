

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getProfitLossReport,
  getExpenseBreakdown,
  getIncomeBreakdown,
  exportProfitLoss,
  ProfitLossResponse,
  ExpenseBreakdownResponse,
  IncomeBreakdownResponse,
} from '@/lib/api/profitLoss';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CenteredSpinner, Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/useToast';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { StatStrip } from '@/components/ui/StatStrip';
import { TableContainer } from '@/components/ui/Table/Table';
import { ReportPrintHeader } from '@/components/reports/ReportPrintHeader';
import { ReportPrintFooter } from '@/components/reports/ReportPrintFooter';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Building2,
  Printer,
  RefreshCw,
} from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

export default function ProfitLossPage() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'report' | 'expenses' | 'income'>('report');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch P&L Report
  const {
    data: plData,
    isLoading: isPlLoading,
    refetch: refetchPL,
  } = useQuery({
    queryKey: ['profitLoss', startDate, endDate],
    queryFn: () => getProfitLossReport({ startDate, endDate }),
    enabled: activeTab === 'report' && !!startDate && !!endDate,
  });

  // Fetch Expense Breakdown
  const {
    data: expenseData,
    isLoading: isExpenseLoading,
    refetch: refetchExpense,
  } = useQuery({
    queryKey: ['expenseBreakdown', startDate, endDate],
    queryFn: () => getExpenseBreakdown({ startDate, endDate }),
    enabled: activeTab === 'expenses' && !!startDate && !!endDate,
  });

  // Fetch Income Breakdown
  const {
    data: incomeData,
    isLoading: isIncomeLoading,
    refetch: refetchIncome,
  } = useQuery({
    queryKey: ['incomeBreakdown', startDate, endDate],
    queryFn: () => getIncomeBreakdown({ startDate, endDate }),
    enabled: activeTab === 'income' && !!startDate && !!endDate,
  });

  const handleGenerateReport = () => {
    if (activeTab === 'report') refetchPL();
    else if (activeTab === 'expenses') refetchExpense();
    else if (activeTab === 'income') refetchIncome();
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setIsExporting(true);
      await exportProfitLoss({ startDate, endDate, format });
      toast({
        title: 'Success',
        description: `Report exported as ${format.toUpperCase()}`,
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader
          title="Profit & Loss Statement"
          subtitle="Comprehensive financial performance and margin analysis"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting || !plData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Excel
              </button>
              <button
                onClick={() => window.print()}
                disabled={!plData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </div>
          }
        />

        {/* Compact Filters Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Report
            </button>
          </div>
        </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('report')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'report'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Full Report
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <PieChart className="w-4 h-4 inline mr-2" />
                Expense Breakdown
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'income'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Income Breakdown
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'report' && (
            <>
              {isPlLoading ? (
                <CenteredSpinner message="Calculating profit & loss statement..." />
              ) : plData ? (
                <PLReportView data={plData} formatCurrency={formatCurrency} formatPercentage={formatPercentage} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Select a date range and click "Generate Report" to view the Profit & Loss statement.
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'expenses' && (
            <>
              {isExpenseLoading ? (
                <CenteredSpinner message="Compiling expense breakdown..." />
              ) : expenseData ? (
                <ExpenseBreakdownView data={expenseData} formatCurrency={formatCurrency} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Select a date range and click "Generate Report" to view expense breakdown.
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'income' && (
            <>
              {isIncomeLoading ? (
                <CenteredSpinner message="Compiling income breakdown..." />
              ) : incomeData ? (
                <IncomeBreakdownView data={incomeData} formatCurrency={formatCurrency} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    Select a date range and click "Generate Report" to view income breakdown.
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
    </AdminLayout>
  );
}

// Sub-components for different views
function PLReportView({
  data,
  formatCurrency,
  formatPercentage,
}: {
  data: ProfitLossResponse;
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number) => string;
}) {
  const isProfitable = data.netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Stat Strip */}
      <StatStrip
        items={[
          {
            label: 'Total Revenue',
            value: formatCurrency(data.income.totalIncome),
            color: 'info',
            icon: <DollarSign className="w-4 h-4 text-blue-600" />,
          },
          {
            label: 'Gross Profit',
            value: formatCurrency(data.grossProfit),
            subtext: `Margin: ${formatPercentage(data.grossProfitMargin)}`,
            color: 'success',
            icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
          },
          {
            label: 'Total Expenses',
            value: formatCurrency(data.totalExpenses),
            color: 'danger',
            icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
          },
          {
            label: 'Net Profit / Loss',
            value: formatCurrency(Math.abs(data.netProfit)),
            subtext: `${isProfitable ? 'Profit' : 'Loss'} (${formatPercentage(data.netProfitMargin)})`,
            color: isProfitable ? 'purple' : 'warning',
            icon: isProfitable ? (
              <TrendingUp className="w-4 h-4 text-purple-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-600" />
            ),
          },
        ]}
      />

      {/* Standard Enterprise Print Header (Print Only) */}
      <ReportPrintHeader
        title="Statement of Profit or Loss (Income Statement)"
        subtitle="Operating Performance, Cost of Goods Sold, and Period Net Margin"
        dateRange={data.period.displayText}
      />

      {/* Screen Formal Letterhead - Hidden on Print */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left print:hidden">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Building2 className="w-4 h-4 text-blue-600 print:hidden" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
              CHAUHAN DAIRY FARMS • MILK CHILLAR ERP
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 uppercase">
            STATEMENT OF PROFIT OR LOSS
          </h1>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400 print:hidden" />
            Period: <strong className="text-slate-700 font-semibold">{data.period.displayText}</strong> • All amounts in PKR
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-center sm:self-auto px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs">
          <span className={isProfitable ? 'text-emerald-700' : 'text-rose-700'}>
            Net {isProfitable ? 'Profit' : 'Loss'}: {formatCurrency(Math.abs(data.netProfit))} ({formatPercentage(data.netProfitMargin)})
          </span>
        </div>
      </div>

      {/* Multi-Step Income Statement */}
      <TableContainer title="Statement of Profit or Loss (Income Statement)">
        <div className="divide-y divide-slate-100 text-xs">
          {/* 1. REVENUE SECTION */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-800">
            <span>1. Revenue & Operating Income</span>
            <span className="text-[11px] font-semibold text-slate-500 lowercase">Gross Sales & Operating Revenues</span>
          </div>

          <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50">
            <span className="text-slate-700">Gross Sales Revenue</span>
            <span className="font-mono tabular-nums text-slate-900 font-medium">{formatCurrency(data.income.salesRevenue)}</span>
          </div>

          {data.income.salesReturns > 0 && (
            <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50 text-rose-600">
              <span>Less: Sales Returns & Allowances</span>
              <span className="font-mono tabular-nums">({formatCurrency(data.income.salesReturns)})</span>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-2 bg-slate-50/30 font-semibold text-slate-800 border-t border-slate-150">
            <span>Net Sales Revenue</span>
            <span className="font-mono tabular-nums">{formatCurrency(data.income.netSales)}</span>
          </div>

          {data.income.otherIncome > 0 && (
            <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50">
              <span className="text-slate-700">Other Operating Income</span>
              <span className="font-mono tabular-nums text-slate-900 font-medium">{formatCurrency(data.income.otherIncome)}</span>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-bold border-t border-slate-300 text-slate-900">
            <span className="uppercase tracking-wide">Total Income</span>
            <span className="font-mono tabular-nums text-blue-900 font-bold">{formatCurrency(data.income.totalIncome)}</span>
          </div>

          {/* 2. COST OF GOODS SOLD SECTION */}
          <div className="p-3 bg-slate-50/70 border-t-2 border-b border-slate-200 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-800 mt-2">
            <span>2. Cost of Goods Sold (COGS)</span>
            <span className="text-[11px] font-semibold text-slate-500 lowercase">Direct Procurement & Production</span>
          </div>

          <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50">
            <span className="text-slate-700">Opening Milk Inventory / Stock</span>
            <span className="font-mono tabular-nums text-slate-900 font-medium">{formatCurrency(data.cogs.openingStock)}</span>
          </div>

          <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50">
            <span className="text-slate-700">Add: Raw Milk Purchases</span>
            <span className="font-mono tabular-nums text-slate-900 font-medium">{formatCurrency(data.cogs.purchases)}</span>
          </div>

          {data.cogs.purchaseReturns > 0 && (
            <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50 text-rose-600">
              <span>Less: Purchase Returns / Rejections</span>
              <span className="font-mono tabular-nums">({formatCurrency(data.cogs.purchaseReturns)})</span>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50">
            <span className="text-slate-700">Add: Direct Chilling & Processing Costs</span>
            <span className="font-mono tabular-nums text-slate-900 font-medium">{formatCurrency(data.cogs.directExpenses)}</span>
          </div>

          {data.cogs.closingStock > 0 && (
            <div className="flex items-center justify-between px-6 py-2 hover:bg-slate-50/50 text-emerald-700">
              <span>Less: Closing Milk Inventory / Stock</span>
              <span className="font-mono tabular-nums">({formatCurrency(data.cogs.closingStock)})</span>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-bold border-t border-slate-300 text-slate-900">
            <span className="uppercase tracking-wide">Total Cost of Goods Sold</span>
            <span className="font-mono tabular-nums text-rose-900 font-bold">{formatCurrency(data.cogs.totalCogs)}</span>
          </div>

          {/* GROSS PROFIT HIGHLIGHT */}
          <div className="p-3.5 bg-emerald-50/80 border-t-2 border-b border-emerald-200 flex items-center justify-between font-bold text-xs">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-emerald-950 text-sm">GROSS PROFIT / (LOSS)</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                Margin: {formatPercentage(data.grossProfitMargin)}
              </span>
            </div>
            <span className="text-sm font-extrabold font-mono tabular-nums text-emerald-950">
              {formatCurrency(data.grossProfit)}
            </span>
          </div>

          {/* 3. OPERATING EXPENSES SECTION */}
          <div className="p-3 bg-slate-50/70 border-t-2 border-b border-slate-200 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-800 mt-2">
            <span>3. Operating Expenses</span>
            <span className="text-[11px] font-semibold text-slate-500 lowercase">Administrative & Operations</span>
          </div>

          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Salaries & Wages</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.salaries)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Rent & Leases</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.rent)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Electricity & Chillar Utilities</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.utilities)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Transportation & Fuel</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.transportation)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Marketing & Promotion</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.marketing)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Office & General Supplies</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.officeExpenses)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Depreciation</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.depreciation)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Other Miscellaneous Expenses</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.operatingExpenses.otherExpenses)}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-bold border-t border-slate-300 text-slate-900">
            <span className="uppercase tracking-wide">Total Operating Expenses</span>
            <span className="font-mono tabular-nums text-rose-900 font-bold">{formatCurrency(data.operatingExpenses.totalOperatingExpenses)}</span>
          </div>

          {/* 4. FINANCIAL EXPENSES SECTION */}
          <div className="p-3 bg-slate-50/70 border-t-2 border-b border-slate-200 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-800 mt-2">
            <span>4. Financial & Banking Charges</span>
            <span className="text-[11px] font-semibold text-slate-500 lowercase">Financing Costs</span>
          </div>

          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Interest Expense</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.financialExpenses.interestExpense)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Bank Charges & Fees</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.financialExpenses.bankCharges)}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-1.5 hover:bg-slate-50/50">
            <span className="text-slate-600">Other Financial Charges</span>
            <span className="font-mono tabular-nums text-slate-900">{formatCurrency(data.financialExpenses.otherFinancialExpenses)}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 font-bold border-t border-slate-300 text-slate-900">
            <span className="uppercase tracking-wide">Total Financial Expenses</span>
            <span className="font-mono tabular-nums text-rose-900 font-bold">{formatCurrency(data.financialExpenses.totalFinancialExpenses)}</span>
          </div>

          {/* TOTAL EXPENSES */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-rose-50/60 font-bold border-t border-slate-300 text-rose-900">
            <span className="uppercase tracking-wide">Total Expenses (COGS + Operating + Financial)</span>
            <span className="font-mono tabular-nums text-rose-950 font-extrabold">{formatCurrency(data.totalExpenses)}</span>
          </div>

          {/* NET PROFIT / LOSS WITH CLASSIC DOUBLE UNDERLINE */}
          <div className={`p-4 border-t-2 border-slate-400 flex items-center justify-between font-bold text-xs ${isProfitable ? 'bg-emerald-50/90 text-emerald-950' : 'bg-rose-50/90 text-rose-950'}`}>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-sm">
                NET {isProfitable ? 'PROFIT' : 'LOSS'} FOR THE PERIOD
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${isProfitable ? 'bg-white/80 text-emerald-800 border-emerald-300' : 'bg-white/80 text-rose-800 border-rose-300'}`}>
                Net Margin: {formatPercentage(data.netProfitMargin)}
              </span>
            </div>
            <span className="text-base font-extrabold font-mono tabular-nums border-b-4 border-double border-slate-900">
              {formatCurrency(Math.abs(data.netProfit))}
            </span>
          </div>
        </div>
      </TableContainer>
      <ReportPrintFooter notes="Statement of Profit or Loss recognized under accrual basis. Subject to final statutory annual audit." />
    </div>
  );
}

function ExpenseBreakdownView({
  data,
  formatCurrency,
}: {
  data: ExpenseBreakdownResponse;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>{data.period.displayText}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{category.categoryName}</h4>
                  <p className="text-sm text-gray-600">{category.percentage.toFixed(2)}% of total expenses</p>
                </div>
                <span className="text-xl font-bold">{formatCurrency(category.amount)}</span>
              </div>
              {category.accounts.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Account Details:</p>
                  <div className="space-y-1">
                    {category.accounts.map((account, accIndex) => (
                      <div key={accIndex} className="flex justify-between text-sm pl-4">
                        <span className="text-gray-700">
                          {account.accountCode} - {account.accountName}
                        </span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between font-bold text-xl">
              <span>Total Expenses</span>
              <span>{formatCurrency(data.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IncomeBreakdownView({
  data,
  formatCurrency,
}: {
  data: IncomeBreakdownResponse;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Breakdown</CardTitle>
        <CardDescription>{data.period.displayText}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.categories.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{category.categoryName}</h4>
                  <p className="text-sm text-gray-600">{category.percentage.toFixed(2)}% of total income</p>
                </div>
                <span className="text-xl font-bold text-green-600">{formatCurrency(category.amount)}</span>
              </div>
              {category.accounts.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Account Details:</p>
                  <div className="space-y-1">
                    {category.accounts.map((account, accIndex) => (
                      <div key={accIndex} className="flex justify-between text-sm pl-4">
                        <span className="text-gray-700">
                          {account.accountCode} - {account.accountName}
                        </span>
                        <span className="font-medium">{formatCurrency(account.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between font-bold text-xl text-green-700">
              <span>Total Income</span>
              <span>{formatCurrency(data.totalIncome)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}