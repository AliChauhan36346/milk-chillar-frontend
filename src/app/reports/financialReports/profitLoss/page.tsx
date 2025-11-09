

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
import  ProtectedRoute from '@/components/ProtectedRoutes';
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
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-2 space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Statement</h1>
            <p className="text-gray-600 mt-1">Comprehensive financial performance report</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={isExporting || !plData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || !plData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Full Report
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Expense Breakdown
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'income'
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
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
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
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
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
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.income.totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.grossProfit)}
                </p>
                <p className="text-sm text-gray-500">{formatPercentage(data.grossProfitMargin)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </p>
                <p className="text-sm text-gray-500">{formatPercentage(data.netProfitMargin)}</p>
              </div>
              <div className={`p-3 rounded-full ${isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
                {isProfitable ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between font-bold text-xl text-green-700">
                <span>Gross Profit</span>
                <span>{formatCurrency(data.grossProfit)}</span>
              </div>
              <div className="text-sm text-green-600 text-right mt-1">
                Margin: {formatPercentage(data.grossProfitMargin)}
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Operating Expenses</h3>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span>Salaries & Wages</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.salaries)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rent</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilities</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.utilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.transportation)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.marketing)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Office Expenses</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.officeExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Depreciation</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.depreciation)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Expenses</span>
                  <span className="font-medium">{formatCurrency(data.operatingExpenses.otherExpenses)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                  <span>Total Operating Expenses</span>
                  <span>{formatCurrency(data.operatingExpenses.totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Financial Expenses */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Financial Expenses</h3>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span>Interest Expense</span>
                  <span className="font-medium">{formatCurrency(data.financialExpenses.interestExpense)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Charges</span>
                  <span className="font-medium">{formatCurrency(data.financialExpenses.bankCharges)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Financial Expenses</span>
                  <span className="font-medium">{formatCurrency(data.financialExpenses.otherFinancialExpenses)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                  <span>Total Financial Expenses</span>
                  <span>{formatCurrency(data.financialExpenses.totalFinancialExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between font-bold text-xl text-red-700">
                <span>Total Expenses</span>
                <span>{formatCurrency(data.totalExpenses)}</span>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-6 rounded-lg ${isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={`flex justify-between font-bold text-2xl ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
                <span>Net {isProfitable ? 'Profit' : 'Loss'}</span>
                <span>{formatCurrency(Math.abs(data.netProfit))}</span>
              </div>
              <div className={`text-sm text-right mt-2 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
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