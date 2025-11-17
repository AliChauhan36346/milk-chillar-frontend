

// 'use client';
// import React from 'react';
// import { ParchiDto } from '@/lib/api/parchi';

// interface ParchiPrintSlipProps {
//   parchi: ParchiDto;
//   startDate: string;
//   endDate: string;
//   companyName?: string;
//   companyLogo?: string;
// }

// export function ParchiPrintSlip({
//   parchi,
//   startDate,
//   endDate,
//   companyName = "CHAUHAN DAIRY FARMS", // ← CHANGED FROM "MILK CHILLAR"
//   companyLogo
// }: ParchiPrintSlipProps) {

//   const formatCurrency = (amount: number) => {
//     return `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-PK', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const getPeriodDays = () => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end.getTime() - start.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   return (
//     <div className="thermal-receipt">
//       {/* Header */}
//       <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-gray-900">
//         <h1 className="text-2xl font-black uppercase tracking-wide">{companyName}</h1>
//         <p className="text-sm font-semibold mt-1">Supplier Payment Statement</p>
//         <p className="text-base font-bold mt-2">Parchi #{parchi.khataNumber}</p>
//       </div>

//       {/* Date Range */}
//       <div className="text-center text-sm mb-3 pb-2 border-b border-dashed border-gray-800">
//         <p className="font-bold">{formatDate(startDate)} to {formatDate(endDate)}</p>
//         <p className="text-xs font-semibold">({getPeriodDays()} days)</p>
//       </div>

//       {/* Supplier Info - UPDATED */}
//       <div className="mb-3 pb-2 border-b border-dashed border-gray-800 text-base">
//         <div className="flex justify-between mb-2">
//           <span className="font-black">Supplier:</span>
//           <div className="text-right">
//             {/* English Name */}
//             <div className="font-bold text-base">
//               {parchi.accountName}
//             </div>
//             {/* Urdu Name - if available */}
//             {parchi.accountNameUrdu && (
//               <div 
//                 className="font-bold text-lg mt-0.5"
//                 style={{
//                   fontFamily: 'Noto Nastaliq Urdu, sans-serif',
//                   lineHeight: '1.6'
//                 }}
//               >
//                 {parchi.accountNameUrdu}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-between mb-2">
//           <span className="font-black">Code:</span>
//           <span className="font-bold">{parchi.accountCode}</span>
//         </div>
//         <div className="flex justify-between mb-2">
//           <span className="font-black">Khata:</span>
//           <span className="font-bold">{parchi.khataNumber}</span>
//         </div>
//         {parchi.dodhiName && (
//           <div className="flex justify-between">
//             <span className="font-black">Dodhi:</span>
//             <span className="font-bold">{parchi.dodhiName}</span>
//           </div>
//         )}
//       </div>

//       {/* Previous Balance */}
//       <div className="mb-3 pb-2 border-b border-dashed border-gray-800">
//         <div className="flex justify-between items-center">
//           <span className="font-black text-base">Previous Balance:</span>
//           <div className="text-right">
//             <div className={`text-lg font-black ${parchi.previousBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
//               {formatCurrency(parchi.previousBalance)}
//             </div>
//             <div className="text-xs font-bold">({parchi.previousBalanceType})</div>
//           </div>
//         </div>
//       </div>

//       {/* Period Summary */}
//       <div className="mb-3 pb-2 border-b border-dashed border-gray-800">
//         <p className="font-black text-base mb-2 text-center bg-gray-200 py-1.5 border-y-2 border-gray-900">PERIOD SUMMARY</p>
//         <div className="space-y-2">
//           <div className="flex justify-between text-base">
//             <span className="font-bold">Milk Supplied:</span>
//             <span className="font-black">{parchi.totalLiters.toFixed(2)} L</span>
//           </div>
//           <div className="flex justify-between text-base">
//             <span className="font-bold">Purchase Amount:</span>
//             <span className="font-black">{formatCurrency(parchi.purchaseAmount)}</span>
//           </div>
//           <div className="flex justify-between text-base">
//             <span className="font-bold">Payments Made:</span>
//             <span className="font-black">{formatCurrency(parchi.paymentsInPeriod)}</span>
//           </div>
//           {parchi.receiptsInPeriod > 0 && (
//             <div className="flex justify-between text-base">
//               <span className="font-bold">Receipts:</span>
//               <span className="font-black">{formatCurrency(parchi.receiptsInPeriod)}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Closing Balance */}
//       <div className="mb-3 pb-2 border-b-2 border-gray-900">
//         <div className="flex justify-between items-center">
//           <span className="font-black text-base">Closing Balance:</span>
//           <div className="text-right">
//             <div className={`text-lg font-black ${parchi.closingBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
//               {formatCurrency(parchi.closingBalance)}
//             </div>
//             <div className="text-xs font-bold">({parchi.closingBalanceType})</div>
//           </div>
//         </div>
//       </div>

//       {/* Credit Limit - Only if allowed */}
//       {parchi.isCreditAllowed && (
//         <div className="mb-3 pb-2 border-b-2 border-gray-900">
//           <div className="flex justify-between items-center">
//             <span className="font-black text-base">Credit Limit:</span>
//             <span className="text-lg font-black text-amber-800">
//               {formatCurrency(parchi.creditLimit)}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Parchi Amount - HIGHLIGHTED */}
//       <div className="mb-3 bg-gray-200 p-3 border-2 border-gray-900">
//         <div className="text-center">
//           <p className="text-sm font-black uppercase tracking-wide mb-1">PARCHI AMOUNT</p>
//           <p className="text-3xl font-black">
//             {formatCurrency(parchi.parchiAmount)}
//           </p>
//         </div>
//       </div>

//       {/* Final Balance */}
//       <div className="mb-3 pb-2 border-b-2 border-gray-900">
//         <div className="flex justify-between items-center">
//           <span className="font-black text-base">Final Balance:</span>
//           <div className="text-right">
//             <div className={`text-lg font-black ${parchi.finalBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
//               {formatCurrency(parchi.finalBalance)}
//             </div>
//             <div className="text-xs font-bold">({parchi.finalBalanceType})</div>
//           </div>
//         </div>
//       </div>

//       {/* Signature Section */}
//       <div className="mt-4 mb-3 text-sm">
//         <div>
//           <p className="font-black mb-2 text-base">Authorized By:</p>
//           <div className="border-b-2 border-gray-900 h-10 mb-1"></div>
//           <p className="text-xs font-bold">Date: ____/____/____</p>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="text-center text-xs mt-4 pt-2 border-t-2 border-dashed border-gray-800">
//         <p className="font-bold mb-1">Thank you for your business!</p>
//         <p className="text-[10px] font-semibold">Printed: {new Date().toLocaleString('en-PK', {
//           day: '2-digit',
//           month: 'short',
//           hour: '2-digit',
//           minute: '2-digit'
//         })}</p>
//       </div>
//     </div>
//   );
// }


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
  companyName = "CHAUHAN DAIRY FARMS",
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
      <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-gray-900">
        <h1 className="text-2xl font-black uppercase tracking-wide">{companyName}</h1>
        <p className="text-sm font-semibold mt-1">
          Supplier Payment Statement <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(رسید)</span>
        </p>
        <p className="text-base font-bold mt-2">
          Parchi <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(پرچی)</span> #{parchi.khataNumber}
        </p>
      </div>

      {/* Date Range */}
      <div className="text-center text-sm mb-3 pb-2 border-b border-dashed border-gray-800">
        <p className="font-bold">{formatDate(startDate)} to {formatDate(endDate)}</p>
        <p className="text-xs font-semibold">({getPeriodDays()} days)</p>
      </div>

      {/* Supplier Info - UPDATED */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-800 text-base">
        <div className="flex justify-between mb-2">
          <span className="font-black">
            Supplier <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(فراہم کنندہ)</span>:
          </span>
          <div className="text-right">
            {/* English Name */}
            <div className="font-bold text-base">
              {parchi.accountName}
            </div>
            {/* Urdu Name - if available */}
            {parchi.accountNameUrdu && (
              <div 
                className="font-bold text-lg mt-0.5"
                style={{
                  fontFamily: 'Noto Nastaliq Urdu, sans-serif',
                  lineHeight: '1.6'
                }}
              >
                {parchi.accountNameUrdu}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mb-2">
          <span className="font-black">
            Code <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(کوڈ)</span>:
          </span>
          <span className="font-bold">{parchi.accountCode}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-black">
            Khata <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(کھاتہ)</span>:
          </span>
          <span className="font-bold">{parchi.khataNumber}</span>
        </div>
        {parchi.dodhiName && (
          <div className="flex justify-between">
            <span className="font-black">
              Dodhi <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(دودھی)</span>:
            </span>
            <span className="font-bold">{parchi.dodhiName}</span>
          </div>
        )}
      </div>

      {/* Previous Balance */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-800">
        <div className="flex justify-between items-center">
          <span className="font-black text-base">
            Previous Balance <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(سابقہ)</span>:
          </span>
          <div className="text-right">
            <div className={`text-lg font-black ${parchi.previousBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(parchi.previousBalance)}
            </div>
            <div className="text-xs font-bold">
              ({parchi.previousBalanceType === 'Credit' ? (
                <span>Credit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(جمع)</span></span>
              ) : (
                <span>Debit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(واجب)</span></span>
              )})
            </div>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      <div className="mb-3 pb-2 border-b border-dashed border-gray-800">
        <p className="font-black text-base mb-2 text-center bg-gray-200 py-1.5 border-y-2 border-gray-900">
          PERIOD SUMMARY <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(مدت کا خلاصہ)</span>
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-base">
            <span className="font-bold">
              Milk Supplied <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(دودھ کی فراہمی)</span>:
            </span>
            <span className="font-black">{parchi.totalLiters.toFixed(2)} L</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-bold">
              Purchase Amount <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(خریداری)</span>:
            </span>
            <span className="font-black">{formatCurrency(parchi.purchaseAmount)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-bold">
              Payments Made <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(ادائیگی)</span>:
            </span>
            <span className="font-black">{formatCurrency(parchi.paymentsInPeriod)}</span>
          </div>
          {parchi.receiptsInPeriod > 0 && (
            <div className="flex justify-between text-base">
              <span className="font-bold">
                Receipts <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(وصولی)</span>:
              </span>
              <span className="font-black">{formatCurrency(parchi.receiptsInPeriod)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Closing Balance */}
      <div className="mb-3 pb-2 border-b-2 border-gray-900">
        <div className="flex justify-between items-center">
          <span className="font-black text-base">
            Closing Balance <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(اختتامی)</span>:
          </span>
          <div className="text-right">
            <div className={`text-lg font-black ${parchi.closingBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(parchi.closingBalance)}
            </div>
            <div className="text-xs font-bold">
              ({parchi.closingBalanceType === 'Credit' ? (
                <span>Credit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(جمع)</span></span>
              ) : (
                <span>Debit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(واجب)</span></span>
              )})
            </div>
          </div>
        </div>
      </div>

      {/* Credit Limit - Only if allowed */}
      {parchi.isCreditAllowed && (
        <div className="mb-3 pb-2 border-b-2 border-gray-900">
          <div className="flex justify-between items-center">
            <span className="font-black text-base">
              Credit Limit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(قرض کی حد)</span>:
            </span>
            <span className="text-lg font-black text-amber-800">
              {formatCurrency(parchi.creditLimit)}
            </span>
          </div>
        </div>
      )}

      {/* Parchi Amount - HIGHLIGHTED */}
      <div className="mb-3 bg-gray-200 p-3 border-2 border-gray-900">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-wide mb-1">
            PARCHI AMOUNT <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(پرچی رقم)</span>
          </p>
          <p className="text-3xl font-black">
            {formatCurrency(parchi.parchiAmount)}
          </p>
        </div>
      </div>

      {/* Final Balance */}
      <div className="mb-3 pb-2 border-b-2 border-gray-900">
        <div className="flex justify-between items-center">
          <span className="font-black text-base">
            Final Balance <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(حتمی بیلنس)</span>:
          </span>
          <div className="text-right">
            <div className={`text-lg font-black ${parchi.finalBalanceType === 'Credit' ? 'text-green-800' : 'text-red-800'}`}>
              {formatCurrency(parchi.finalBalance)}
            </div>
            <div className="text-xs font-bold">
              ({parchi.finalBalanceType === 'Credit' ? (
                <span>Credit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(جمع)</span></span>
              ) : (
                <span>Debit <span style={{fontFamily: 'Noto Nastaliq Urdu, sans-serif'}}>(واجب)</span></span>
              )})
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-4 mb-3 text-sm">
        <div>
          <p className="font-black mb-2 text-base">Authorized By:</p>
          <div className="border-b-2 border-gray-900 h-10 mb-1"></div>
          <p className="text-xs font-bold">Date: ____/____/____</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-4 pt-2 border-t-2 border-dashed border-gray-800">
        <p className="font-bold mb-1">Thank you for your business!</p>
        <p className="text-[10px] font-semibold">Printed: {new Date().toLocaleString('en-PK', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  );
}