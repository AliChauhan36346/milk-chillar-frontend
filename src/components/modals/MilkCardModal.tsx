'use client';
import { useEffect, useState } from 'react';
import { X, Calendar, Printer, Download } from 'lucide-react';

import { getMilkCard, MilkCard } from '@/lib/api/accountLedger';
import { useToast } from '@/hooks/useToast';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { getPurchaseById, updatePurchase, Purchase } from '@/lib/api/purchases';
import { getAccountsByComponent, SearchAccountResult } from '@/lib/api/accounts';

interface MilkCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
  accountName: string;
  date?: string;
  transactionType: 'Purchase' | 'Sale';
}

export default function MilkCardModal({
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

  // Purchase Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [expenseAccounts, setExpenseAccounts] = useState<SearchAccountResult[]>([]);
  const [modalData, setModalData] = useState<{
    supplier: { id: number; name: string; code: string; rate: number };
    availableTimes: ('morning' | 'evening')[];
    isUpdate: boolean;
    updateData?: {
      time: 'morning' | 'evening';
      purchaseId: number;
      currentQuantity: number;
    };
    initialDate: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && accountId) {
      loadMilkCard();
      loadExpenseAccounts();
    }
  }, [isOpen, accountId, date, transactionType]);

  const loadExpenseAccounts = async () => {
    try {
      const accounts = await getAccountsByComponent('expenses');
      setExpenseAccounts(accounts);
    } catch (error) {
      console.error('Failed to load expense accounts:', error);
    }
  };

  const loadMilkCard = async () => {
    try {
      setLoading(true);
      const data = await getMilkCard({
        accountId,
        date: date || new Date().toISOString().split('T')[0],
        transactionType
      });
      console.log('Milk Card Data:', data); // Debug log
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

  const handleEntryClick = async (purchaseId: number | undefined, time: 'morning' | 'evening', quantity: number, dateStr: string) => {
    if (!purchaseId) {
      console.warn('Purchase ID missing for entry:', { time, dateStr, quantity });
      toast({
        title: 'Cannot Edit',
        description: 'Purchase ID not found for this entry. Backend update required.',
        variant: 'error'
      });
      return;
    }

    try {
      const purchase = await getPurchaseById(purchaseId);

      setModalData({
        supplier: {
          id: accountId,
          name: accountName,
          code: milkCard?.accountCode || '',
          rate: purchase.rate
        },
        availableTimes: [time],
        isUpdate: true,
        updateData: {
          time: time,
          purchaseId: purchaseId,
          currentQuantity: quantity
        },
        initialDate: dateStr.split('T')[0]
      });
      setShowPurchaseModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load purchase details',
        variant: 'error'
      });
    }
  };

  const handlePurchaseSubmit = async (data: {
    morningQuantity?: number;
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => {
    if (!modalData?.updateData) return;

    try {
      const quantity = modalData.updateData.time === 'morning' ? data.morningQuantity : data.eveningQuantity;

      if (!quantity) return;

      await updatePurchase(modalData.updateData.purchaseId, {
        date: data.date,
        timeOfDay: modalData.updateData.time,
        accountId: accountId,
        expenseAccountId: data.expenseAccountId || 0, // Should handle this better if needed
        dodhiId: 0, // Backend should handle this or we need to fetch it
        grossLiters: quantity,
        rate: data.rate || modalData.supplier.rate,
        balance: 0
      });

      setShowPurchaseModal(false);
      setModalData(null);
      loadMilkCard(); // Reload to show updates

      toast({
        title: 'Success',
        description: 'Purchase updated successfully',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update purchase',
        variant: 'error'
      });
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

      {/* Modal - Responsive sizing */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          {/* Header - Sticky on mobile */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-2xl sm:rounded-t-xl sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Milk Card</h2>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate max-w-[150px] sm:max-w-none">
                  {accountName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePrint}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : milkCard ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Card Info Header */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-600">Period</p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {milkCard.periodLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-gray-600">Type</p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {milkCard.transactionType === 'Purchase' ? '🥛 Purchase' : '💰 Sale'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grand Total - Mobile Optimized */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-2.5 sm:p-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs text-green-700 font-medium">Grand Total</p>
                      <p className="text-lg sm:text-xl font-bold text-green-900">
                        ₨ {milkCard.grandTotalAmount.toFixed(2)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-green-700 mt-0.5">
                        {milkCard.grandTotalQuantity.toFixed(1)} Liters @ ₨ {milkCard.averageTotalRate.toFixed(2)}/L
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] sm:text-xs text-green-700">Transactions</p>
                      <p className="text-base sm:text-lg font-bold text-green-900">
                        {milkCard.transactionCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column Headers - Responsive */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 px-1 text-[10px] sm:text-xs font-semibold text-gray-700">
                  <div className="text-left">Date</div>
                  <div className="text-center">☀️ <span className="hidden sm:inline">Morning</span></div>
                  <div className="text-center">🌙 <span className="hidden sm:inline">Evening</span></div>
                  <div className="text-right"><span className="hidden sm:inline">Amount</span><span className="sm:hidden">Amt</span></div>
                </div>

                {/* Milk Cards Grid - Mobile Optimized */}
                <div className="space-y-1.5 sm:space-y-2">
                  {milkCard.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-4 gap-1 sm:gap-2 items-center">
                      {/* Date - No Box */}
                      <div className="text-[10px] sm:text-xs">
                        <p className="font-bold text-gray-900">
                          {new Date(line.date).getDate()} {new Date(line.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-gray-500">
                          {new Date(line.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                      </div>

                      {/* Morning Box - Clickable */}
                      <div
                        onClick={() => handleEntryClick(line.morningTransactionId, 'morning', line.morningQuantity, line.date)}
                        className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded p-1 sm:p-1.5 text-center ${line.morningTransactionId ? 'cursor-pointer hover:bg-amber-100 active:scale-95 transition-all' : ''}`}
                      >
                        <p className="text-xs sm:text-sm font-bold text-amber-900">
                          {line.morningQuantity.toFixed(1)}
                        </p>
                      </div>

                      {/* Evening Box - Clickable */}
                      <div
                        onClick={() => handleEntryClick(line.eveningTransactionId, 'evening', line.eveningQuantity, line.date)}
                        className={`bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded p-1 sm:p-1.5 text-center ${line.eveningTransactionId ? 'cursor-pointer hover:bg-indigo-100 active:scale-95 transition-all' : ''}`}
                      >
                        <p className="text-xs sm:text-sm font-bold text-indigo-900">
                          {line.eveningQuantity.toFixed(1)}
                        </p>
                      </div>

                      {/* Amount - No Box */}
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold text-gray-900">
                          ₨ {line.totalAmount.toFixed(0)}
                        </p>
                        <p className="text-[8px] sm:text-[10px] text-gray-500">
                          {line.totalQuantity.toFixed(1)} L
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Morning and Evening Totals - Mobile Stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  {/* Morning Summary */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm">☀️</span>
                      <p className="text-[10px] sm:text-xs font-semibold text-amber-900">Morning Total</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                      <div className="flex justify-between">
                        <span className="text-amber-700">Quantity:</span>
                        <span className="font-bold text-amber-900">
                          {milkCard.totalMorningQuantity.toFixed(1)} L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Amount:</span>
                        <span className="font-bold text-amber-900">
                          ₨ {milkCard.totalMorningAmount.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Avg Rate:</span>
                        <span className="font-bold text-amber-900">
                          ₨ {milkCard.averageMorningRate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evening Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2.5 sm:p-3">
                    <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm">🌙</span>
                      <p className="text-[10px] sm:text-xs font-semibold text-indigo-900">Evening Total</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Quantity:</span>
                        <span className="font-bold text-indigo-900">
                          {milkCard.totalEveningQuantity.toFixed(1)} L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Amount:</span>
                        <span className="font-bold text-indigo-900">
                          ₨ {milkCard.totalEveningAmount.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-700">Avg Rate:</span>
                        <span className="font-bold text-indigo-900">
                          ₨ {milkCard.averageEveningRate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add some bottom padding for mobile safe area */}
                <div className="h-4 sm:hidden"></div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && modalData && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSubmit={handlePurchaseSubmit}
          supplier={modalData.supplier}
          availableTimes={modalData.availableTimes}
          isAdmin={true} // Assuming admin for now as we are editing
          expenseAccounts={expenseAccounts}
          selectedExpenseAccount={null} // We might want to set this if we have it
          isUpdate={modalData.isUpdate}
          updateData={modalData.updateData}
          initialDate={modalData.initialDate}
        />
      )}
    </div>
  );
}