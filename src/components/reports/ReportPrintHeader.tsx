'use client';

import React from 'react';
import { Building2, Calendar, User, Clock, MapPin, Tag } from 'lucide-react';

export interface ReportPrintHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: { startDate?: string; endDate?: string } | string;
  asOfDate?: string;
  entityName?: string;
  chillarName?: string;
  currency?: string;
  showOnScreen?: boolean;
}

export function ReportPrintHeader({
  title,
  subtitle,
  dateRange,
  asOfDate,
  entityName,
  chillarName,
  currency = 'Pakistani Rupees (PKR)',
  showOnScreen = false,
}: ReportPrintHeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedPeriod = typeof dateRange === 'string'
    ? dateRange
    : dateRange?.startDate && dateRange?.endDate
    ? `${dateRange.startDate}  —  ${dateRange.endDate}`
    : asOfDate
    ? `As of ${asOfDate}`
    : `As of ${currentDate}`;

  return (
    <div
      className={`${
        showOnScreen ? 'block' : 'hidden print:block'
      } bg-white border-b-2 border-slate-900 pb-3 mb-4 text-slate-900`}
    >
      {/* Top Company Brand Letterhead */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-sm">
            CDF
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-tight">
              CHAUHAN DAIRY FARMS
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight">
              Milk Chillar Collection & Financial ERP System
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500 leading-tight">
          <p className="font-semibold text-slate-800">CENTRAL PROCESSING PLANT</p>
          <p>Main G.T. Road, Punjab • NTN: 8765432-1</p>
          <p>Contact: +92 300-1234567 • accounts@chauhandairy.com</p>
        </div>
      </div>

      {/* Report Document Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-600 font-normal mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Currency & Classification Notice */}
        <div className="text-right text-[10px] font-medium text-slate-600">
          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Official System Report
          </span>
          <p className="mt-0.5 text-slate-500">Amounts: <strong>{currency}</strong></p>
        </div>
      </div>

      {/* Metadata Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-600">
        <div>
          <span className="font-semibold text-slate-800 uppercase tracking-wide block">Reporting Period:</span>
          <span className="font-mono text-slate-900 font-medium">{formattedPeriod}</span>
        </div>

        <div>
          <span className="font-semibold text-slate-800 uppercase tracking-wide block">Generated Date & Time:</span>
          <span className="font-mono text-slate-900">{currentDate} at {currentTime}</span>
        </div>

        {entityName && (
          <div>
            <span className="font-semibold text-slate-800 uppercase tracking-wide block">Entity / Account:</span>
            <span className="font-medium text-slate-900 truncate block">{entityName}</span>
          </div>
        )}

        {chillarName && (
          <div>
            <span className="font-semibold text-slate-800 uppercase tracking-wide block">Chillar Center:</span>
            <span className="font-medium text-slate-900 truncate block">{chillarName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
export default ReportPrintHeader;
