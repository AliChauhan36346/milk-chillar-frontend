'use client';
import React from 'react';
import { ParchiDto } from '@/lib/api/parchi';

interface ParchiPrintSlipProps {
  parchi: ParchiDto;
  startDate: string;
  endDate: string;
  companyName?: string;
  companyLogo?: string;
}

export function ParchiPrintSlip({
  parchi,
  startDate,
  endDate,
  companyName = "MILK CHILLAR",
  companyLogo
}: ParchiPrintSlipProps) {

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPeriodDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="thermal-receipt">
      {/* Header */}
      <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-gray-800">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{companyName}</h1>
        <p className="text-sm mt-1">Supplier Payment Statement</p>
        <p className="text-base font-bold mt-2">Parchi #{parchi.khataNumber}</p>
      </div>

      {/* Date Range */}
      <div className="text-center text-sm mb-3 pb-2 border-b border-dashed border-gray-600">
        <p className="font-semibold">{formatDate(startDate)} to {formatDate(endDate)}</p>
        <p className="text-xs">({getPeriodDays()} days)</p>
      </div>

      {/* Supplier Info */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-600 text-base">
        {/* <div className="flex justify-between mb-2">
          <span className="font-bold">Supplier:</span>
          <span className="text-right font-semibold">{parchi.accountName}</span>
        </div> */}

        {/* Supplier Info */}
        <div className="flex justify-between mb-2">
          <span className="font-bold">Supplier:</span>
          <span
            className="text-right font-semibold"
            style={{
              fontFamily: parchi.accountNameUrdu
                ? 'Noto Nastaliq Urdu, sans-serif'
                : 'inherit'
            }}
          >
            {parchi.accountNameUrdu || parchi.accountName}
          </span>
        </div>

        <div className="flex justify-between mb-2">
          <span className="font-bold">Code:</span>
          <span className="font-semibold">{parchi.accountCode}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-bold">Khata:</span>
          <span className="font-semibold">{parchi.khataNumber}</span>
        </div>
        {parchi.dodhiName && (
          <div className="flex justify-between">
            <span className="font-bold">Dodhi:</span>
            <span className="font-semibold">{parchi.dodhiName}</span>
          </div>
        )}
      </div>

      {/* Previous Balance */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-600">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Previous Balance:</span>
          <div className="text-right">
            <div className={`text-lg font-bold ${parchi.previousBalanceType === 'Credit' ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(parchi.previousBalance)}
            </div>
            <div className="text-xs">({parchi.previousBalanceType})</div>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-600">
        <p className="font-bold text-base mb-2 text-center bg-gray-100 py-1.5 border-y-2 border-gray-800">PERIOD SUMMARY</p>
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-semibold">Milk Supplied:</span>
            <span className="font-bold">{parchi.totalLiters.toFixed(2)} L</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-semibold">Purchase Amount:</span>
            <span className="font-bold">{formatCurrency(parchi.purchaseAmount)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-semibold">Payments Made:</span>
            <span className="font-bold">{formatCurrency(parchi.paymentsInPeriod)}</span>
          </div>
          {parchi.receiptsInPeriod > 0 && (
            <div className="flex justify-between text-base">
              <span className="font-semibold">Receipts:</span>
              <span className="font-bold">{formatCurrency(parchi.receiptsInPeriod)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Closing Balance */}
      <div className="mb-3 pb-2 border-b-2 border-gray-800">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Closing Balance:</span>
          <div className="text-right">
            <div className={`text-lg font-bold ${parchi.closingBalanceType === 'Credit' ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(parchi.closingBalance)}
            </div>
            <div className="text-xs">({parchi.closingBalanceType})</div>
          </div>
        </div>
      </div>

      {/* Credit Limit - Only if allowed */}
      {parchi.isCreditAllowed && (
        <div className="mb-3 pb-2 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <span className="font-bold text-base">Credit Limit:</span>
            <span className="text-lg font-bold text-amber-700">
              {formatCurrency(parchi.creditLimit)}
            </span>
          </div>
        </div>
      )}

      {/* Parchi Amount - HIGHLIGHTED */}
      <div className="mb-3 bg-gray-100 p-3 border-2 border-gray-800">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide mb-1">PARCHI AMOUNT</p>
          <p className="text-3xl font-black">
            {formatCurrency(parchi.parchiAmount)}
          </p>
        </div>
      </div>

      {/* Final Balance */}
      <div className="mb-3 pb-2 border-b-2 border-gray-800">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Final Balance:</span>
          <div className="text-right">
            <div className={`text-lg font-bold ${parchi.finalBalanceType === 'Credit' ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(parchi.finalBalance)}
            </div>
            <div className="text-xs">({parchi.finalBalanceType})</div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-4 mb-3 text-sm">
        <div>
          <p className="font-bold mb-2 text-base">Authorized By:</p>
          <div className="border-b-2 border-gray-800 h-10 mb-1"></div>
          <p className="text-xs">Date: ____/____/____</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-4 pt-2 border-t-2 border-dashed border-gray-600">
        <p className="font-semibold mb-1">Thank you for your business!</p>
        <p className="text-[10px]">Printed: {new Date().toLocaleString('en-PK', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  );
}