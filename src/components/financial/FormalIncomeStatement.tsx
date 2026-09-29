'use client';

import React from 'react';
import { ProfitLossResponse } from '@/lib/api/profitLoss';

interface FormalIncomeStatementProps {
  data: ProfitLossResponse;
  companyName?: string;
  currency?: string;
  className?: string;
}

export const FormalIncomeStatement: React.FC<FormalIncomeStatementProps> = ({
  data,
  companyName = 'CHAUHAN DAIRY FARMS',
  currency = 'PKR',
  className = '',
}) => {
  // Format numbers with comma separators, e.g. 6,143,595
  // Negative numbers in accounting parentheses: (22,423)
  const formatNumber = (amount: number, useParensForNegative: boolean = true) => {
    if (isNaN(amount) || amount === 0) return '—';
    const isNegative = amount < 0;
    const absVal = Math.round(Math.abs(amount)).toLocaleString('en-US');
    if (isNegative && useParensForNegative) {
      return `(${absVal})`;
    }
    return absVal;
  };

  const formatPercent = (percent: number) => {
    if (isNaN(percent)) return '0.0%';
    return `${percent.toFixed(1)}%`;
  };

  // Base for Common Size calculations: Gross Sales Revenue (or 1 if 0 to prevent division by zero)
  const grossSales = data.income.salesRevenue || 1;
  const calcCommonSize = (amount: number) => {
    return formatPercent((amount / grossSales) * 100);
  };

  // Group Operating Expenses according to the accounting format
  const opExp = data.operatingExpenses;
  const finExp = data.financialExpenses;

  // Operating items list
  const operatingExpenseItems = [
    { label: 'Salaries & Wages', amount: opExp.salaries },
    { label: 'Rent & Premises', amount: opExp.rent },
    { label: 'Electricity & Utilities', amount: opExp.utilities },
    { label: 'Transportation & Logistics', amount: opExp.transportation },
    { label: 'Marketing & Promotion', amount: opExp.marketing },
    { label: 'Facilities, Supplies & Office', amount: opExp.officeExpenses },
    { label: 'Equipment & Maintenance', amount: opExp.depreciation || opExp.otherExpenses ? (opExp.depreciation > 0 ? opExp.depreciation : opExp.otherExpenses) : 0 },
    { label: 'Other Operating Expenses', amount: opExp.depreciation > 0 ? opExp.otherExpenses : 0 },
  ].filter((item) => item.amount > 0);

  // If no detailed itemization, fall back to total operating expenses
  if (operatingExpenseItems.length === 0 && opExp.totalOperatingExpenses > 0) {
    operatingExpenseItems.push({
      label: 'General & Administrative Expenses',
      amount: opExp.totalOperatingExpenses,
    });
  }

  // Non-Operating / Financial items list
  const nonOperatingItems = [
    {
      label: 'Other Operating / Non-Operating Income',
      amount: data.income.otherIncome ? -Math.abs(data.income.otherIncome) : 0, // In parentheses as deduction to net expense
    },
    { label: 'Interest Expense', amount: finExp.interestExpense },
    { label: 'Bank Charges & Financial Fees', amount: finExp.bankCharges },
    { label: 'Other Financial Charges', amount: finExp.otherFinancialExpenses },
  ].filter((item) => Math.abs(item.amount) > 0);

  if (nonOperatingItems.length === 0 && finExp.totalFinancialExpenses > 0) {
    nonOperatingItems.push({
      label: 'Financial & Banking Expenses',
      amount: finExp.totalFinancialExpenses,
    });
  }

  // Operating Income = Gross Profit - Total Operating Expenses
  const operatingIncome = data.grossProfit - opExp.totalOperatingExpenses;
  const operatingIncomePct = (operatingIncome / grossSales) * 100;

  // Total Non-Operating Expenses
  const totalNonOperating = finExp.totalFinancialExpenses - (data.income.otherIncome || 0);

  // Net Income Before Taxes
  const netIncomeBeforeTaxes = operatingIncome - totalNonOperating;

  // Final Net Income (from backend)
  const netIncome = data.netProfit;
  const netIncomePct = data.netProfitMargin;

  return (
    <div
      className={`formal-accounting-document bg-white text-slate-900 font-serif w-full max-w-[850px] mx-auto p-6 sm:p-12 print:p-0 print:max-w-none print:shadow-none print:border-none shadow-md border border-slate-200/80 rounded-sm leading-relaxed ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. CORPORATE STATEMENT HEADER (Exact match to Image 1: ACME Corporation)  */}
      {/* ========================================================================= */}
      <header className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase">
          {companyName}
        </h1>
        <p className="text-sm sm:text-base text-slate-800 font-serif mt-1">
          Income Statement for the financial period ending {data.period.endDate}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 font-serif italic mt-0.5">
          (all values in {currency})
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 2. FORMAL STATEMENT DATA TABLE                                            */}
      {/* ========================================================================= */}
      <div className="w-full text-xs sm:text-sm">
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 pb-3 mb-4 border-b border-transparent font-serif text-slate-800">
          <div className="col-span-6 sm:col-span-7"></div>
          <div className="col-span-3 sm:col-span-3 text-right font-serif font-medium">
            Current Period
          </div>
          <div className="col-span-3 sm:col-span-2 text-right font-serif font-medium">
            Common Size<br />
            <span className="text-[10px] sm:text-xs text-slate-600 font-normal">
              (% of Gross Sales)
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION A: INCOME                                                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="mb-6 space-y-1.5">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif">
            Income
          </div>

          {/* Gross Sales */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
              Gross Sales
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.income.salesRevenue, false)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
              100.0%
            </div>
          </div>

          {/* Sales Returns (if any) */}
          {data.income.salesReturns > 0 && (
            <div className="grid grid-cols-12 py-0.5">
              <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
                Less: Sales Returns & Allowances
              </div>
              <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900">
                {formatNumber(-Math.abs(data.income.salesReturns))}
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
                {calcCommonSize(-data.income.salesReturns)}
              </div>
            </div>
          )}

          {/* Cost of Goods Sold */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
              Cost of Goods Sold
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.cogs.totalCogs, false)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
              {calcCommonSize(data.cogs.totalCogs)}
            </div>
          </div>

          {/* Gross Profit (Bold) */}
          <div className="grid grid-cols-12 py-1 font-bold">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-950 font-serif">
              Gross Profit
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-950">
              {formatNumber(data.grossProfit)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-950">
              {formatPercent(data.grossProfitMargin)}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION B: OPERATING EXPENSES                                           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="mb-6 space-y-1.5">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif">
            Operating Expenses
          </div>

          {operatingExpenseItems.map((item, idx) => {
            const isLast = idx === operatingExpenseItems.length - 1;
            return (
              <div key={item.label} className="grid grid-cols-12 py-0.5">
                <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
                  {item.label}
                </div>
                <div
                  className={`col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900 ${
                    isLast ? 'border-b border-slate-900 pb-0.5' : ''
                  }`}
                >
                  {formatNumber(item.amount, false)}
                </div>
                <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
                  {calcCommonSize(item.amount)}
                </div>
              </div>
            );
          })}

          {/* Total Operating Expenses */}
          <div className="grid grid-cols-12 py-1 font-serif">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-900 font-medium">
              Total Operating Expenses
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums font-semibold text-slate-950 border-b border-slate-900 pb-0.5">
              {formatNumber(opExp.totalOperatingExpenses, false)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums font-semibold text-slate-950">
              {calcCommonSize(opExp.totalOperatingExpenses)}
            </div>
          </div>

          {/* Operating Income (Bold) */}
          <div className="grid grid-cols-12 pt-3 pb-1 font-bold">
            <div className="col-span-6 sm:col-span-7 text-slate-950 font-serif">
              Operating Income
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-950">
              {formatNumber(operatingIncome)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-950">
              {formatPercent(operatingIncomePct)}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION C: NON-OPERATING EXPENSES / FINANCIAL                           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="mb-6 space-y-1.5">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif">
            Non-Operating Expenses
          </div>

          {nonOperatingItems.length > 0 ? (
            nonOperatingItems.map((item, idx) => {
              const isLast = idx === nonOperatingItems.length - 1;
              return (
                <div key={item.label} className="grid grid-cols-12 py-0.5">
                  <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
                    {item.label}
                  </div>
                  <div
                    className={`col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900 ${
                      isLast ? 'border-b border-slate-900 pb-0.5' : ''
                    }`}
                  >
                    {formatNumber(item.amount)}
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
                    {calcCommonSize(item.amount)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-12 py-0.5">
              <div className="col-span-6 sm:col-span-7 pl-6 text-slate-500 italic">
                No non-operating expenses incurred
              </div>
              <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900 border-b border-slate-900 pb-0.5">
                0
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
                0.0%
              </div>
            </div>
          )}

          {/* Total Non-Operating Expenses */}
          <div className="grid grid-cols-12 py-1 font-serif">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-900 font-medium">
              Total Non-Operating Expenses
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums font-semibold text-slate-950">
              {formatNumber(totalNonOperating)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums font-semibold text-slate-950">
              {calcCommonSize(totalNonOperating)}
            </div>
          </div>

          {/* Net Income before Taxes */}
          <div className="grid grid-cols-12 pt-3 pb-1 font-bold">
            <div className="col-span-6 sm:col-span-7 text-slate-950 font-serif">
              Net Income before Taxes
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-950">
              {formatNumber(netIncomeBeforeTaxes)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-950">
              {calcCommonSize(netIncomeBeforeTaxes)}
            </div>
          </div>

          {/* Taxes */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-6 sm:col-span-7 pl-6 text-slate-800">
              Taxes
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-900 border-b border-slate-900 pb-0.5">
              0
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-800">
              0.0%
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* FINAL GRAND TOTAL: NET INCOME (DOUBLE UNDERLINE)                     */}
          {/* ------------------------------------------------------------------- */}
          <div className="grid grid-cols-12 pt-4 pb-2 font-bold text-sm sm:text-base">
            <div className="col-span-6 sm:col-span-7 text-slate-950 font-serif">
              Net Income
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono tabular-nums text-slate-950 border-b-4 border-double border-slate-950 pb-1">
              {formatNumber(netIncome)}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right font-mono tabular-nums text-slate-950">
              {formatPercent(netIncomePct)}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FORMAL AUDIT / MANAGEMENT ATTESTATION FOOTER                           */}
      {/* ========================================================================= */}
      <div className="mt-14 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-serif text-slate-700">
        <div>
          <p className="text-[11px] text-slate-500 italic mb-10">
            This formal financial statement has been prepared from the underlying books of accounts in conformity with standard accounting principles.
          </p>
          <div className="border-t border-slate-800 w-44 pt-1">
            <p className="font-semibold text-slate-900">Prepared By</p>
            <p className="text-[11px] text-slate-600">Chief Accountant / Controller</p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-right text-[11px] text-slate-500">
            <span>Statement Cutoff: {data.period.endDate}</span>
          </div>
          <div className="border-t border-slate-800 w-44 pt-1 text-right">
            <p className="font-semibold text-slate-900">Approved By</p>
            <p className="text-[11px] text-slate-600">Managing Director / CEO</p>
          </div>
        </div>
      </div>
    </div>
  );
};
