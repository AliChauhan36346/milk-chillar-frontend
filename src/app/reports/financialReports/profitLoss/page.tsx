

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
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Calendar,
  PieChart,
  BarChart3,
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
                onClick={() => handleExport('pdf')}
                disabled={isExporting || !plData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
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
                <CenteredSpinner size="lg" />
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
                <CenteredSpinner size="lg" />
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
                <CenteredSpinner size="lg" />
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

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
          <CardDescription>{data.period.displayText}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Income Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Revenue</h3>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span>Sales Revenue</span>
                  <span className="font-medium">{formatCurrency(data.income.salesRevenue)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Less: Sales Returns</span>
                  <span className="font-medium">({formatCurrency(data.income.salesReturns)})</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Net Sales</span>
                  <span>{formatCurrency(data.income.netSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Income</span>
                  <span className="font-medium">{formatCurrency(data.income.otherIncome)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                  <span>Total Income</span>
                  <span>{formatCurrency(data.income.totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* COGS Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Cost of Goods Sold</h3>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span>Opening Stock</span>
                  <span className="font-medium">{formatCurrency(data.cogs.openingStock)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add: Purchases</span>
                  <span className="font-medium">{formatCurrency(data.cogs.purchases)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Less: Purchase Returns</span>
                  <span className="font-medium">({formatCurrency(data.cogs.purchaseReturns)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Add: Direct Expenses</span>
                  <span className="font-medium">{formatCurrency(data.cogs.directExpenses)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Less: Closing Stock</span>
                  <span className="font-medium">({formatCurrency(data.cogs.closingStock)})</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                  <span>Total COGS</span>
                  <span>{formatCurrency(data.cogs.totalCogs)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Gross Profit</span>
                <span className="text-base font-semibold text-emerald-800 tabular-nums">{formatCurrency(data.grossProfit)}</span>
              </div>
              <div className="text-[11px] text-emerald-700 text-right mt-0.5 font-medium tabular-nums">
                Margin: {formatPercentage(data.grossProfitMargin)}
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <h3 className="font-semibold text-sm text-slate-800 mb-2">Operating Expenses</h3>
              <div className="space-y-1.5 pl-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Salaries & Wages</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.salaries)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rent</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.rent)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Utilities</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.utilities)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transportation</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.transportation)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Marketing</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.marketing)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Office Expenses</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.officeExpenses)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Depreciation</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.depreciation)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Other Expenses</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.operatingExpenses.otherExpenses)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1.5">
                  <span>Total Operating Expenses</span>
                  <span className="tabular-nums">{formatCurrency(data.operatingExpenses.totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Financial Expenses */}
            <div>
              <h3 className="font-semibold text-sm text-slate-800 mb-2">Financial Expenses</h3>
              <div className="space-y-1.5 pl-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Interest Expense</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.financialExpenses.interestExpense)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Bank Charges</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.financialExpenses.bankCharges)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Other Financial Expenses</span>
                  <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(data.financialExpenses.otherFinancialExpenses)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1.5">
                  <span>Total Financial Expenses</span>
                  <span className="tabular-nums">{formatCurrency(data.financialExpenses.totalFinancialExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-xl">
              <div className="flex justify-between items-center font-semibold text-xs uppercase tracking-wider text-rose-800">
                <span>Total Expenses</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(data.totalExpenses)}</span>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' : 'bg-rose-50/80 border-rose-300 text-rose-900'}`}>
              <div className="flex justify-between items-center font-semibold text-base">
                <span>Net {isProfitable ? 'Profit' : 'Loss'}</span>
                <span className="tabular-nums text-lg">{formatCurrency(Math.abs(data.netProfit))}</span>
              </div>
              <div className="text-[11px] text-right mt-0.5 opacity-80 font-medium tabular-nums">
                Margin: {formatPercentage(data.netProfitMargin)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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