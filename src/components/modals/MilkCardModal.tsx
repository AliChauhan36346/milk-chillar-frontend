


// 'use client';
// import { useEffect, useState } from 'react';
// import { X, Calendar, Printer, Download } from 'lucide-react';
// import { getMilkCard, MilkCard } from '@/lib/api/accountLedger';
// import { useToast } from '@/hooks/useToast';

// interface MilkCardModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   accountId: number;
//   accountName: string;
//   date?: string;
//   transactionType: 'Purchase' | 'Sale';
// }

// export function MilkCardModal({
//   isOpen,
//   onClose,
//   accountId,
//   accountName,
//   date,
//   transactionType
// }: MilkCardModalProps) {
//   const [loading, setLoading] = useState(true);
//   const [milkCard, setMilkCard] = useState<MilkCard | null>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     if (isOpen && accountId) {
//       loadMilkCard();
//     }
//   }, [isOpen, accountId, date, transactionType]);

//   const loadMilkCard = async () => {
//     try {
//       setLoading(true);
//       const data = await getMilkCard({
//         accountId,
//         date: date || new Date().toISOString().split('T')[0],
//         transactionType
//       });
//       setMilkCard(data);
//     } catch (error: any) {
//       toast({
//         title: 'Failed to load milk card',
//         description: error?.message || 'An error occurred',
//         variant: 'error'
//       });
//       onClose();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     toast({
//       title: 'Download feature coming soon',
//       variant: 'info'
//     });
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       {/* Backdrop */}
//       <div 
//         className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
//         onClick={onClose}
//       />

//       {/* Modal - Narrower and Taller */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
//           {/* Header */}
//           <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Calendar className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-bold text-gray-900">Milk Card</h2>
//                 <p className="text-sm text-gray-600">{accountName}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handlePrint}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 title="Print"
//               >
//                 <Printer className="w-5 h-5 text-gray-600" />
//               </button>
//               <button
//                 onClick={handleDownload}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 title="Download PDF"
//               >
//                 <Download className="w-5 h-5 text-gray-600" />
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2 hover:bg-red-50 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-6 max-h-[calc(100vh-150px)] overflow-y-auto">
//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               </div>
//             ) : milkCard ? (
//               <div className="space-y-5">
//                 {/* Card Info Header */}
//                 <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 border border-gray-200">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-sm text-gray-600">Period</p>
//                       <p className="font-semibold text-gray-900">{milkCard.periodLabel}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm text-gray-600">Type</p>
//                       <p className="font-semibold text-gray-900">
//                         {milkCard.transactionType === 'Purchase' ? '🥛 Purchase' : '💰 Sale'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column Headers */}
//                 <div className="grid grid-cols-4 gap-3 px-1">
//                   <div className="text-center font-semibold text-gray-700 text-sm">Date</div>
//                   <div className="text-center font-semibold text-gray-700 text-sm">Morning</div>
//                   <div className="text-center font-semibold text-gray-700 text-sm">Evening</div>
//                   <div className="text-center font-semibold text-gray-700 text-sm">Amount</div>
//                 </div>

//                 {/* Milk Cards Grid */}
//                 <div className="space-y-3">
//                   {milkCard.lines.map((line, index) => (
//                     <div key={index} className="grid grid-cols-4 gap-3">
//                       {/* Date Card */}
//                       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center">
//                         <p className="text-xs text-blue-600 font-medium">
//                           {new Date(line.date).toLocaleDateString('en-US', { weekday: 'short' })}
//                         </p>
//                         <p className="text-lg font-bold text-blue-900">
//                           {new Date(line.date).getDate()}
//                         </p>
//                         <p className="text-xs text-blue-600">
//                           {new Date(line.date).toLocaleDateString('en-US', { month: 'short' })}
//                         </p>
//                       </div>

//                       {/* Morning Card */}
//                       <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-3 flex flex-col items-center justify-center">
//                         <p className="text-xs text-amber-600 mb-1">☀️</p>
//                         <p className="text-xl font-bold text-amber-900">
//                           {line.morningQuantity.toFixed(1)}
//                         </p>
//                         <p className="text-xs text-amber-600 mt-1">
//                           @ {line.morningRate > 0 ? line.morningRate.toFixed(0) : '-'}
//                         </p>
//                       </div>

//                       {/* Evening Card */}
//                       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-3 flex flex-col items-center justify-center">
//                         <p className="text-xs text-indigo-600 mb-1">🌙</p>
//                         <p className="text-xl font-bold text-indigo-900">
//                           {line.eveningQuantity.toFixed(1)}
//                         </p>
//                         <p className="text-xs text-indigo-600 mt-1">
//                           @ {line.eveningRate > 0 ? line.eveningRate.toFixed(0) : '-'}
//                         </p>
//                       </div>

//                       {/* Amount Card */}
//                       <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 flex flex-col items-center justify-center">
//                         <p className="text-xs text-green-600 mb-1">💵</p>
//                         <p className="text-lg font-bold text-green-900">
//                           ₨ {line.totalAmount.toFixed(0)}
//                         </p>
//                         <p className="text-xs text-green-600 mt-1">
//                           {line.totalQuantity.toFixed(1)} L
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Summary Section */}
//                 <div className="mt-6 pt-6 border-t-2 border-gray-200">
//                   <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                  
//                   {/* Summary Grid */}
//                   <div className="grid grid-cols-2 gap-4 mb-4">
//                     {/* Morning Summary */}
//                     <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-xl">☀️</span>
//                         <p className="font-semibold text-amber-900">Morning Total</p>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="flex justify-between">
//                           <span className="text-sm text-amber-700">Quantity:</span>
//                           <span className="font-bold text-amber-900">{milkCard.totalMorningQuantity.toFixed(1)} L</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-amber-700">Amount:</span>
//                           <span className="font-bold text-amber-900">₨ {milkCard.totalMorningAmount.toFixed(0)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-amber-700">Avg Rate:</span>
//                           <span className="font-bold text-amber-900">₨ {milkCard.averageMorningRate.toFixed(2)}/L</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Evening Summary */}
//                     <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
//                       <div className="flex items-center gap-2 mb-2">
//                         <span className="text-xl">🌙</span>
//                         <p className="font-semibold text-indigo-900">Evening Total</p>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="flex justify-between">
//                           <span className="text-sm text-indigo-700">Quantity:</span>
//                           <span className="font-bold text-indigo-900">{milkCard.totalEveningQuantity.toFixed(1)} L</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-indigo-700">Amount:</span>
//                           <span className="font-bold text-indigo-900">₨ {milkCard.totalEveningAmount.toFixed(0)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-sm text-indigo-700">Avg Rate:</span>
//                           <span className="font-bold text-indigo-900">₨ {milkCard.averageEveningRate.toFixed(2)}/L</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Grand Total */}
//                   <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-2 border-gray-300 rounded-lg p-5">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm text-gray-600 mb-1">Grand Total</p>
//                         <div className="flex items-baseline gap-2">
//                           <p className="text-3xl font-bold text-gray-900">
//                             ₨ {milkCard.grandTotalAmount.toFixed(2)}
//                           </p>
//                         </div>
//                         <p className="text-xs text-gray-600 mt-1">
//                           {milkCard.grandTotalQuantity.toFixed(1)} Liters @ ₨ {milkCard.averageTotalRate.toFixed(2)}/L
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-600">Transactions</p>
//                         <p className="text-2xl font-bold text-gray-900">{milkCard.transactionCount}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <p className="text-gray-500">No data available for the selected period</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';
import { useEffect, useState } from 'react';
import { X, Calendar, Printer, Download } from 'lucide-react';
import { getMilkCard, MilkCard } from '@/lib/api/accountLedger';
import { useToast } from '@/hooks/useToast';

interface MilkCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  accountName: string;
  date?: string;
  transactionType: 'Purchase' | 'Sale';
}

export function MilkCardModal({
  isOpen,
  onClose,
  accountId,
  accountName,
  date,
  transactionType
}: MilkCardModalProps) {
  const [loading, setLoading] = useState(true);
  const [milkCard, setMilkCard] = useState<MilkCard | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && accountId) {
      loadMilkCard();
    }
  }, [isOpen, accountId, date, transactionType]);

  const loadMilkCard = async () => {
    try {
      setLoading(true);
      const data = await getMilkCard({
        accountId,
        date: date || new Date().toISOString().split('T')[0],
        transactionType
      });
      setMilkCard(data);
    } catch (error: any) {
      toast({
        title: 'Failed to load milk card',
        description: error?.message || 'An error occurred',
        variant: 'error'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!milkCard) return;
    
    // Create print window
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    // Generate thermal print HTML
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Milk Card - ${accountName}</title>
        <style>
          @media print {
            @page { 
              size: 80mm auto;
              margin: 0;
            }
            body { margin: 0; }
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            padding: 5mm;
            margin: 0;
            font-size: 12px;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 3px 0;
            text-transform: uppercase;
          }
          
          .header p {
            font-size: 11px;
            margin: 2px 0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            font-size: 11px;
          }
          
          .info-row strong {
            font-weight: bold;
          }
          
          .section-title {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            background: #e5e5e5;
            padding: 4px;
            margin: 8px 0 5px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          
          .milk-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
            font-size: 11px;
          }
          
          .milk-table th {
            font-weight: bold;
            padding: 3px 2px;
            text-align: center;
            border-bottom: 1px solid #000;
          }
          
          .milk-table td {
            padding: 3px 2px;
            text-align: center;
          }
          
          .milk-table td.date {
            text-align: left;
          }
          
          .milk-table td.amount {
            text-align: right;
          }
          
          .totals {
            margin-top: 8px;
            padding-top: 5px;
            border-top: 2px solid #000;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: 12px;
          }
          
          .grand-total {
            font-weight: bold;
            font-size: 14px;
            padding: 5px;
            background: #e5e5e5;
            margin: 5px 0;
            text-align: center;
            border: 2px solid #000;
          }
          
          .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
            padding-top: 5px;
            border-top: 2px dashed #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MILK CARD</h1>
          <p><strong>${accountName}</strong></p>
          <p>${milkCard.periodLabel}</p>
          <p>${milkCard.transactionType}</p>
        </div>
        
        <div class="section-title">DAILY RECORD</div>
        
        <table class="milk-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Morning</th>
              <th>Evening</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${milkCard.lines.map(line => `
              <tr>
                <td class="date">${new Date(line.date).getDate()} ${new Date(line.date).toLocaleDateString('en-US', { month: 'short' })}</td>
                <td>${line.morningQuantity.toFixed(1)}</td>
                <td>${line.eveningQuantity.toFixed(1)}</td>
                <td class="amount">Rs ${line.totalAmount.toFixed(0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="grand-total">
          TOTAL: Rs ${milkCard.grandTotalAmount.toFixed(2)}<br>
          ${milkCard.grandTotalQuantity.toFixed(1)} Liters
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span><strong>Morning Total:</strong></span>
            <span>${milkCard.totalMorningQuantity.toFixed(1)} L</span>
          </div>
          <div class="total-row">
            <span><strong>Morning Avg Rate:</strong></span>
            <span>Rs ${milkCard.averageMorningRate.toFixed(2)}/L</span>
          </div>
          <div class="total-row">
            <span><strong>Evening Total:</strong></span>
            <span>${milkCard.totalEveningQuantity.toFixed(1)} L</span>
          </div>
          <div class="total-row">
            <span><strong>Evening Avg Rate:</strong></span>
            <span>Rs ${milkCard.averageEveningRate.toFixed(2)}/L</span>
          </div>
          <div class="total-row">
            <span><strong>Overall Avg Rate:</strong></span>
            <span>Rs ${milkCard.averageTotalRate.toFixed(2)}/L</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Transactions: ${milkCard.transactionCount}</p>
          <p>Printed: ${new Date().toLocaleString('en-PK', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownload = () => {
    toast({
      title: 'Download feature coming soon',
      //variant: 'info'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Milk Card</h2>
                <p className="text-xs text-gray-600">{accountName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(100vh-150px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : milkCard ? (
              <div className="space-y-4">
                {/* Card Info Header */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-xs text-gray-600">Period</p>
                      <p className="font-semibold text-gray-900">{milkCard.periodLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Type</p>
                      <p className="font-semibold text-gray-900">
                        {milkCard.transactionType === 'Purchase' ? '🥛 Purchase' : '💰 Sale'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grand Total - Moved Up */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Grand Total</p>
                      <p className="text-xl font-bold text-green-900">
                        ₨ {milkCard.grandTotalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        {milkCard.grandTotalQuantity.toFixed(1)} Liters @ ₨ {milkCard.averageTotalRate.toFixed(2)}/L
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-700">Transactions</p>
                      <p className="text-lg font-bold text-green-900">{milkCard.transactionCount}</p>
                    </div>
                  </div>
                </div>

                {/* Column Headers */}
                <div className="grid grid-cols-4 gap-2 px-1 text-xs font-semibold text-gray-700">
                  <div className="text-left">Date</div>
                  <div className="text-center">☀️ Morning</div>
                  <div className="text-center">🌙 Evening</div>
                  <div className="text-right">Amount</div>
                </div>

                {/* Milk Cards Grid - Smaller Boxes */}
                <div className="space-y-2">
                  {milkCard.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      {/* Date - No Box */}
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">
                          {new Date(line.date).getDate()} {new Date(line.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(line.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>

                      {/* Morning Box - Smaller */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded p-1.5 text-center">
                        <p className="text-sm font-bold text-amber-900">
                          {line.morningQuantity.toFixed(1)}
                        </p>
                      </div>

                      {/* Evening Box - Smaller */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded p-1.5 text-center">
                        <p className="text-sm font-bold text-indigo-900">
                          {line.eveningQuantity.toFixed(1)}
                        </p>
                      </div>

                      {/* Amount - No Box */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ₨ {line.totalAmount.toFixed(0)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {line.totalQuantity.toFixed(1)} L
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Morning and Evening Totals - At Bottom */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                  {/* Morning Summary */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-sm">☀️</span>
                      <p className="text-xs font-semibold text-amber-900">Morning Total</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-700">Quantity:</span>
                        <span className="font-bold text-amber-900">{milkCard.totalMorningQuantity.toFixed(1)} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Amount:</span>
                        <span className="font-bold text-amber-900">₨ {milkCard.totalMorningAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Avg Rate:</span>
                        <span className="font-bold text-amber-900">₨ {milkCard.averageMorningRate.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evening Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-sm">🌙</span>
                      <p className="text-xs font-semibold text-indigo-900">Evening Total</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Quantity:</span>
                        <span className="font-bold text-indigo-900">{milkCard.totalEveningQuantity.toFixed(1)} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Amount:</span>
                        <span className="font-bold text-indigo-900">₨ {milkCard.totalEveningAmount.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Avg Rate:</span>
                        <span className="font-bold text-indigo-900">₨ {milkCard.averageEveningRate.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}