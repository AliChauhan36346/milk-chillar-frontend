'use client';

import React, { useState } from 'react';
import { AccountLedgerSummary } from '@/lib/api/accountLedger';

export interface FormalBalanceSheetData {
  currentAssets: AccountLedgerSummary[];
  nonCurrentAssets: AccountLedgerSummary[];
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  currentLiabilities: AccountLedgerSummary[];
  nonCurrentLiabilities: AccountLedgerSummary[];
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  equityAccounts: AccountLedgerSummary[];
  baseEquity: number;
  currentPeriodNetEarnings: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

interface FormalBalanceSheetProps {
  data: FormalBalanceSheetData;
  asOfDate: string;
  companyName?: string;
  currency?: string;
  className?: string;
}

export const FormalBalanceSheet: React.FC<FormalBalanceSheetProps> = ({
  data,
  asOfDate,
  companyName = 'CHAUHAN DAIRY FARMS',
  currency = 'PKR',
  className = '',
}) => {
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  // Format numbers with comma separators, e.g. 22,075
  // Negative numbers in accounting parentheses: (5,474)
  const formatNumber = (amount: number, useParensForNegative: boolean = true) => {
    if (isNaN(amount) || Math.abs(amount) < 0.01) return '—';
    const isNegative = amount < 0;
    const absVal = Math.round(Math.abs(amount)).toLocaleString('en-US');
    if (isNegative && useParensForNegative) {
      return `(${absVal})`;
    }
    return absVal;
  };

  return (
    <div
      className={`formal-accounting-document bg-white text-slate-900 font-serif w-full max-w-[850px] mx-auto p-6 sm:p-12 print:p-0 print:max-w-none print:shadow-none print:border-none shadow-md border border-slate-200/80 rounded-sm leading-relaxed ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. CORPORATE STATEMENT HEADER (Exact match to Image 2: Grande Corp)       */}
      {/* ========================================================================= */}
      <header className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 uppercase">
              {companyName}
            </h1>
            <p className="text-sm sm:text-base text-slate-800 font-serif mt-1">
              Balance Sheet at {asOfDate}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-sm font-serif italic text-slate-600">
              Figures in {currency}
            </span>
          </div>
        </div>

        {/* Full-width Divider Line */}
        <div className="border-b border-slate-300 mt-4"></div>
      </header>

      {/* Screen toggle for account detail drilldown */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          type="button"
          onClick={() => setShowAccountDetails(!showAccountDetails)}
          className="text-xs font-sans text-slate-600 hover:text-slate-900 underline transition-colors"
        >
          {showAccountDetails ? 'Hide Detailed Account Lines' : 'Show Detailed Account Lines'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. FORMAL STATEMENT DATA TABLE                                            */}
      {/* Column Structure:                                                         */}
      {/* Col 1-7: Classification / Account Title                                    */}
      {/* Col 8-9: Inner Column (Sub-amounts)                                       */}
      {/* Col 10-12: Outer Column (Section & Grand Totals)                          */}
      {/* ========================================================================= */}
      <div className="w-full text-xs sm:text-sm space-y-6">

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 1: ASSETS                                                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-1.5">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif tracking-wide uppercase">
            ASSETS
          </div>

          {/* Current Assets */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Current Assets
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.totalCurrentAssets, false)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Optional Current Asset Account Breakdown */}
          {showAccountDetails && (
            <div className="space-y-0.5 pl-8 pr-2 my-1 text-[11px] sm:text-xs text-slate-600 border-l border-slate-200 ml-4">
              {data.currentAssets.map((a) => (
                <div key={a.accountId} className="grid grid-cols-12 py-0.5">
                  <div className="col-span-7 italic truncate">
                    {a.accountCode} • {a.accountName}
                  </div>
                  <div className="col-span-3 text-right font-mono tabular-nums">
                    {formatNumber(Math.abs(a.closingBalance))}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Long-Term Investments & Funds (if any, or 0) */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Long-Term Investments & Funds
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              —
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Property, Plant & Equipment (Non-Current Assets) */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Property, Plant & Equipment
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.totalNonCurrentAssets, false)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Optional Non-Current Asset Account Breakdown */}
          {showAccountDetails && (
            <div className="space-y-0.5 pl-8 pr-2 my-1 text-[11px] sm:text-xs text-slate-600 border-l border-slate-200 ml-4">
              {data.nonCurrentAssets.map((a) => (
                <div key={a.accountId} className="grid grid-cols-12 py-0.5">
                  <div className="col-span-7 italic truncate">
                    {a.accountCode} • {a.accountName}
                  </div>
                  <div className="col-span-3 text-right font-mono tabular-nums">
                    {formatNumber(Math.abs(a.closingBalance))}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Intangible Assets */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Intangible Assets
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              —
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Other Assets (with single hairline underline) */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Other Assets
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900 border-b border-slate-900 pb-0.5">
              —
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Total Assets (Outer column with double underline) */}
          <div className="grid grid-cols-12 pt-2 pb-1 font-bold text-slate-950">
            <div className="col-span-7 pl-12 text-slate-950 font-serif font-bold">
              Total Assets
            </div>
            <div className="col-span-3"></div>
            <div className="col-span-2 text-right font-mono tabular-nums text-slate-950 border-b-4 border-double border-slate-950 pb-1">
              {formatNumber(data.totalAssets, false)}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 2: LIABILITIES                                                  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-1.5 pt-2">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif tracking-wide uppercase">
            LIABILITIES
          </div>

          {/* Current Liabilities */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Current Liabilities
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.totalCurrentLiabilities, false)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Optional Current Liabilities Account Breakdown */}
          {showAccountDetails && (
            <div className="space-y-0.5 pl-8 pr-2 my-1 text-[11px] sm:text-xs text-slate-600 border-l border-slate-200 ml-4">
              {data.currentLiabilities.map((a) => (
                <div key={a.accountId} className="grid grid-cols-12 py-0.5">
                  <div className="col-span-7 italic truncate">
                    {a.accountCode} • {a.accountName}
                  </div>
                  <div className="col-span-3 text-right font-mono tabular-nums">
                    {formatNumber(Math.abs(a.closingBalance))}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Long-Term Liabilities (with single hairline underline) */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Long-Term Liabilities
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900 border-b border-slate-900 pb-0.5">
              {formatNumber(data.totalNonCurrentLiabilities, false)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Optional Long-Term Liabilities Account Breakdown */}
          {showAccountDetails && data.nonCurrentLiabilities.length > 0 && (
            <div className="space-y-0.5 pl-8 pr-2 my-1 text-[11px] sm:text-xs text-slate-600 border-l border-slate-200 ml-4">
              {data.nonCurrentLiabilities.map((a) => (
                <div key={a.accountId} className="grid grid-cols-12 py-0.5">
                  <div className="col-span-7 italic truncate">
                    {a.accountCode} • {a.accountName}
                  </div>
                  <div className="col-span-3 text-right font-mono tabular-nums">
                    {formatNumber(Math.abs(a.closingBalance))}
                  </div>
                  <div className="col-span-2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Total Liabilities (Outer column) */}
          <div className="grid grid-cols-12 pt-2 pb-1 font-bold text-slate-950">
            <div className="col-span-7 pl-12 text-slate-950 font-serif font-bold">
              Total Liabilities
            </div>
            <div className="col-span-3"></div>
            <div className="col-span-2 text-right font-mono tabular-nums text-slate-950">
              {formatNumber(data.totalLiabilities, false)}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 3: OWNERS EQUITY                                                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-1.5 pt-2">
          <div className="font-bold text-slate-950 text-sm sm:text-base font-serif tracking-wide uppercase">
            OWNERS EQUITY
          </div>

          {/* Contributed Capital */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Contributed Capital
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900">
              {formatNumber(data.baseEquity, false)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Retained Earnings (including current period net profit) (with single underline) */}
          <div className="grid grid-cols-12 py-0.5">
            <div className="col-span-7 pl-4 text-slate-900 font-medium">
              Retained Earnings / Current Period Net Earnings
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-900 border-b border-slate-900 pb-0.5">
              {formatNumber(data.currentPeriodNetEarnings)}
            </div>
            <div className="col-span-2"></div>
          </div>

          {/* Total Owners Equity (Outer column, single line above, double line below) */}
          <div className="grid grid-cols-12 pt-2 pb-1 font-bold text-slate-950">
            <div className="col-span-7 pl-12 text-slate-950 font-serif font-bold">
              Total Owners Equity
            </div>
            <div className="col-span-3"></div>
            <div className="col-span-2 text-right font-mono tabular-nums text-slate-950 border-b border-t border-slate-950 py-0.5">
              {formatNumber(data.totalEquity, false)}
            </div>
          </div>
        </div>

        {/* Full-width Divider Line */}
        <div className="border-b border-slate-300 my-4"></div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 4: TOTAL LIABILITIES AND EQUITIES (DOUBLE UNDERLINE)            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="grid grid-cols-12 pt-2 pb-2 font-bold text-sm sm:text-base text-slate-950">
          <div className="col-span-7 pl-12 text-slate-950 font-serif font-bold">
            Total Liabilities and Equities
          </div>
          <div className="col-span-3"></div>
          <div className="col-span-2 text-right font-mono tabular-nums text-slate-950 border-b-4 border-double border-slate-950 pb-1">
            {formatNumber(data.totalLiabilitiesAndEquity, false)}
          </div>
        </div>

        {/* Parity Notice (if any rounding variance exists) */}
        {!data.isBalanced && (
          <div className="text-right text-[11px] text-amber-700 font-sans italic pt-1">
            * Note: Equation variance of {formatNumber(data.variance)} PKR pending ledger reconciliation.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FORMAL AUDIT / MANAGEMENT ATTESTATION FOOTER                           */}
      {/* ========================================================================= */}
      <div className="mt-14 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs font-serif text-slate-700">
        <div>
          <p className="text-[11px] text-slate-500 italic mb-10">
            This statement of financial position presents fairly, in all material respects, the financial position of {companyName} in accordance with applicable accounting standards.
          </p>
          <div className="border-t border-slate-800 w-44 pt-1">
            <p className="font-semibold text-slate-900">Prepared By</p>
            <p className="text-[11px] text-slate-600">Chief Accountant / Controller</p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="text-right text-[11px] text-slate-500">
            <span>Cutoff Date: {asOfDate}</span>
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
