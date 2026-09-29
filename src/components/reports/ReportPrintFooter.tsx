'use client';

import React from 'react';

export interface ReportPrintFooterProps {
  notes?: string;
  showOnScreen?: boolean;
}

export function ReportPrintFooter({
  notes,
  showOnScreen = false,
}: ReportPrintFooterProps) {
  return (
    <div
      className={`${
        showOnScreen ? 'block' : 'hidden print:block'
      } mt-8 pt-4 border-t border-slate-300 text-slate-800 break-inside-avoid print:break-inside-avoid`}
    >
      {notes && (
        <div className="mb-4 text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
          <strong>Notes:</strong> {notes}
        </div>
      )}

      {/* Corporate Three-Party Signature Blocks */}
      <div className="grid grid-cols-3 gap-6 pt-6 pb-2 text-center text-[10px]">
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 mx-4"></div>
          <p className="font-bold text-slate-900 uppercase tracking-wide">Prepared By</p>
          <p className="text-slate-500 text-[9px]">Data Operator / Chillar Incharge</p>
        </div>

        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 mx-4"></div>
          <p className="font-bold text-slate-900 uppercase tracking-wide">Verified & Audited By</p>
          <p className="text-slate-500 text-[9px]">Senior Accountant / Controller</p>
        </div>

        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 mx-4"></div>
          <p className="font-bold text-slate-900 uppercase tracking-wide">Authorized Approval</p>
          <p className="text-slate-500 text-[9px]">Managing Director / Partner</p>
        </div>
      </div>

      {/* System Legal Declaration */}
      <div className="flex items-center justify-between mt-6 pt-2 border-t border-slate-200 text-[9px] text-slate-500">
        <span>
          Chauhan Dairy Farms Milk Chillar ERP • System-Generated Audit Document • Valid Without Physical Seal
        </span>
        <span className="font-mono">
          Confidential • For Internal & Statutory Audit Use
        </span>
      </div>
    </div>
  );
}
export default ReportPrintFooter;
