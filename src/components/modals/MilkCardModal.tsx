// components/modals/MilkCardModal.tsx
'use client';
import { useEffect, useState } from 'react';
import { Calendar, Printer, Download } from 'lucide-react';

import { getMilkCard, MilkCard } from '@/lib/api/accountLedger';
import { useToast } from '@/hooks/useToast';
import PurchaseModal from '@/components/modals/PurchaseModal';
import { SalesFormModal } from '@/components/modals/SalesFormModal';
import { getPurchaseById, updatePurchase, Purchase } from '@/lib/api/purchases';
import { getSaleById, updateSale, SaleDto } from '@/lib/api/sales';
import { getAccountsByComponent, SearchAccountResult } from '@/lib/api/accounts';
import { BaseModal } from '@/components/ui/Modal/BaseModal';

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
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
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
    selectedExpenseAccount: number | null;
  } | null>(null);

  // Sales Modal State
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [revenueAccounts, setRevenueAccounts] = useState<SearchAccountResult[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleDto | null>(null);
  const [salesModalData, setSalesModalData] = useState<{
    buyer: { id: number; name: string; code: string };
    initialDate: string;
    selectedRevenueAccount: number | null;
    saleId: number;
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
      console.log('Milk Card Data:', data);
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

  const handleEntryClick = async (transactionId: number | undefined, time: 'morning' | 'evening', quantity: number, dateStr: string) => {
    if (!transactionId) {
      console.warn('Transaction ID missing for entry:', { time, dateStr, quantity });
      toast({
        title: 'Cannot Edit',
        description: 'Transaction ID not found for this entry. Backend update required.',
        variant: 'error'
      });
      return;
    }

    try {
      if (transactionType === 'Purchase') {
        const purchase = await getPurchaseById(transactionId);
        setCurrentPurchase(purchase);

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
            purchaseId: transactionId,
            currentQuantity: quantity
          },
          initialDate: dateStr.split('T')[0],
          selectedExpenseAccount: purchase.expenseAccountId || null
        });
        setShowPurchaseModal(true);
      } else {
        const sale = await getSaleById(transactionId);

        let accounts = revenueAccounts;
        if (accounts.length === 0) {
          const loadedAccounts = await getAccountsByComponent('revenue');
          accounts = loadedAccounts;
          setRevenueAccounts(loadedAccounts);
        }

        if (sale.revenueAccountId && sale.revenueAccountName) {
          const accountExists = accounts.some(acc => acc.accountId === sale.revenueAccountId);
          if (!accountExists) {
            const newAccount: SearchAccountResult = {
              accountId: sale.revenueAccountId,
              accountCode: '',
              name: sale.revenueAccountName,
              balance: 0
            };
            accounts = [...accounts, newAccount];
            setRevenueAccounts(accounts);
          }
        }

        setCurrentSale(sale);

        setSalesModalData({
          buyer: {
            id: accountId,
            name: accountName,
            code: milkCard?.accountCode || ''
          },
          initialDate: dateStr.split('T')[0],
          selectedRevenueAccount: sale.revenueAccountId || null,
          saleId: transactionId
        });
        setShowSalesModal(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load ${transactionType.toLowerCase()} details`,
        variant: 'error'
      });
    }
  };

  const handlePurchaseSubmit = async (data: any) => {
    if (!modalData?.updateData || !currentPurchase) return;

    try {
      const quantity = modalData.updateData.time === 'morning' ? data.morningQuantity : data.eveningQuantity;
      if (!quantity || quantity <= 0) {
        toast({ title: 'Error', description: 'Please enter a valid quantity', variant: 'error' });
        return;
      }

      const dodhiId = currentPurchase.dodhiId;
      if (!dodhiId || dodhiId <= 0) {
        toast({ title: 'Error', description: 'Dodhi ID is missing. Cannot update.', variant: 'error' });
        return;
      }

      const expenseAccountId = data.expenseAccountId || currentPurchase.expenseAccountId;
      if (!expenseAccountId || expenseAccountId <= 0) {
        toast({ title: 'Error', description: 'Please select an expense account', variant: 'error' });
        return;
      }

      await updatePurchase(modalData.updateData.purchaseId, {
        date: data.date,
        timeOfDay: modalData.updateData.time,
        accountId: accountId,
        expenseAccountId: expenseAccountId,
        dodhiId: dodhiId,
        grossLiters: quantity,
        rate: data.rate || modalData.supplier.rate,
        balance: 0
      });

      setShowPurchaseModal(false);
      setModalData(null);
      setCurrentPurchase(null);
      loadMilkCard();

      toast({ title: 'Success', description: 'Purchase updated successfully', variant: 'default' });
    } catch (error: any) {
      console.error('Failed to update purchase:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Failed to update purchase',
        variant: 'error'
      });
    }
  };

  const handleSalesSubmit = async (data: any) => {
    if (!salesModalData || !currentSale) return;

    try {
      const chillarId = currentSale.chillarId;
      if (!chillarId || chillarId <= 0) {
        toast({ title: 'Error', description: 'Chillar ID is missing. Cannot update.', variant: 'error' });
        return;
      }

      const revenueAccountId = data.revenueAccountId || currentSale.revenueAccountId;
      if (!revenueAccountId || revenueAccountId <= 0) {
        toast({ title: 'Error', description: 'Please select a revenue account', variant: 'error' });
        return;
      }

      await updateSale(salesModalData.saleId, {
        date: data.date,
        accountId: accountId,
        revenueAccountId: revenueAccountId,
        chillarId: chillarId,
        grossLiters: data.grossLiters,
        lr: data.lr,
        fat: data.fat,
        netLiters: data.netLiters,
        rate: data.rate,
        amountReceived: data.amountReceived
      });

      setShowSalesModal(false);
      setSalesModalData(null);
      setCurrentSale(null);
      loadMilkCard();

      toast({ title: 'Success', description: 'Sale updated successfully', variant: 'default' });
    } catch (error: any) {
      console.error('Failed to update sale:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Failed to update sale',
        variant: 'error'
      });
    }
  };

  // Re-declare salesFormValues state for the modal integration
  const [salesFormValues, setSalesFormValues] = useState({
    grossLiters: 0,
    lr: 0,
    fat: 0,
    netLiters: 0,
    rate: 0,
    amount: 0,
    amountReceived: 0,
    revenueAccountId: 0
  });

  // Effect to sync SalesFormValues with currentSale
  useEffect(() => {
    if (currentSale) {
      setSalesFormValues({
        grossLiters: currentSale.grossLiters,
        lr: currentSale.lr,
        fat: currentSale.fat,
        netLiters: currentSale.netLiters,
        rate: currentSale.rate,
        amount: currentSale.totalAmount,
        amountReceived: currentSale.amountReceived,
        revenueAccountId: currentSale.revenueAccountId
      });
    }
  }, [currentSale]);

  const handleSalesInputChange = (field: string, value: number) => {
    setSalesFormValues(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'grossLiters' || field === 'lr' || field === 'fat') {
        const gross = field === 'grossLiters' ? value : updated.grossLiters;
        const lr = field === 'lr' ? value : updated.lr;
        const fat = field === 'fat' ? value : updated.fat;
        const netLiters = gross - (gross * lr / 100) - (gross * fat / 100);
        updated.netLiters = Math.max(0, netLiters);
      }
      if (field === 'netLiters' || field === 'rate') {
        const net = field === 'netLiters' ? value : updated.netLiters;
        const rate = field === 'rate' ? value : updated.rate;
        updated.amount = net * rate;
      }
      return updated;
    });
  };

  const handlePrint = () => {
    if (!milkCard) return;
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    // ... print logic (condensed for brevity, effectively the same as before)
    const printContent = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Milk Card - ${accountName}</title>
      <style>
        @media print { @page { size: 80mm auto; margin: 0; } body { margin: 0; } }
        body { font-family: 'Courier New', monospace; width: 80mm; padding: 5mm; margin: 0; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 5px; margin-bottom: 8px; }
        .header h1 { font-size: 18px; font-weight: bold; margin: 0 0 3px 0; text-transform: uppercase; }
        .header p { font-size: 11px; margin: 2px 0; }
        .milk-table { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 11px; }
        .milk-table th { font-weight: bold; padding: 3px 2px; text-align: center; border-bottom: 1px solid #000; }
        .milk-table td { padding: 3px 2px; text-align: center; }
        .milk-table td.date { text-align: left; }
        .milk-table td.amount { text-align: right; }
        .grand-total { font-weight: bold; font-size: 14px; padding: 5px; background: #e5e5e5; margin: 5px 0; text-align: center; border: 2px solid #000; }
        .totals { margin-top: 8px; padding-top: 5px; border-top: 2px solid #000; }
        .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
        .footer { text-align: center; font-size: 10px; margin-top: 10px; padding-top: 5px; border-top: 2px dashed #000; }
      </style></head>
      <body>
        <div class="header"><h1>MILK CARD</h1><p><strong>${accountName}</strong></p><p>${milkCard.periodLabel}</p><p>${milkCard.transactionType}</p></div>
        <div style="text-align: center; font-weight: bold; font-size: 12px; background: #e5e5e5; padding: 4px; margin: 8px 0 5px 0; border-top: 1px solid #000; border-bottom: 1px solid #000;">DAILY RECORD</div>
        <table class="milk-table">
          <thead><tr><th>Date</th><th>Morning</th><th>Evening</th><th>Amount</th></tr></thead>
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
        <div class="grand-total">TOTAL: Rs ${milkCard.grandTotalAmount.toFixed(2)}<br>${milkCard.grandTotalQuantity.toFixed(1)} Liters</div>
        <div class="totals">
          <div class="total-row"><span><strong>Morning Total:</strong></span><span>${milkCard.totalMorningQuantity.toFixed(1)} L</span></div>
          <div class="total-row"><span><strong>Morning Avg Rate:</strong></span><span>Rs ${milkCard.averageMorningRate.toFixed(2)}/L</span></div>
          <div class="total-row"><span><strong>Evening Total:</strong></span><span>${milkCard.totalEveningQuantity.toFixed(1)} L</span></div>
          <div class="total-row"><span><strong>Evening Avg Rate:</strong></span><span>Rs ${milkCard.averageEveningRate.toFixed(2)}/L</span></div>
          <div class="total-row"><span><strong>Overall Avg Rate:</strong></span><span>Rs ${milkCard.averageTotalRate.toFixed(2)}/L</span></div>
        </div>
        <div class="footer"><p>Transactions: ${milkCard.transactionCount}</p><p>Printed: ${new Date().toLocaleString('en-PK')}</p></div>
        <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
      </body></html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownload = () => {
    toast({ title: 'Download feature coming soon' });
  };

  const headerAction = (
    <div className="flex items-center gap-1 sm:gap-2">
      <button onClick={handlePrint} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors" title="Print">
        <Printer size={16} />
      </button>
      <button onClick={handleDownload} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors hidden sm:block" title="Download">
        <Download size={16} />
      </button>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Milk Card"
        subtitle={accountName}
        icon={<Calendar size={18} />}
        iconClassName="bg-blue-50 text-blue-600"
        maxWidth="max-w-2xl"
        headerAction={headerAction}
      >
        {/* Content - Scrollable */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 max-h-[80vh]">
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

              {/* Grand Total */}
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

              {/* Column Headers */}
              <div className="grid grid-cols-4 gap-1 sm:gap-2 px-1 text-[10px] sm:text-xs font-semibold text-gray-700">
                <div className="text-left">Date</div>
                <div className="text-center">☀️ <span className="hidden sm:inline">Morning</span></div>
                <div className="text-center">🌙 <span className="hidden sm:inline">Evening</span></div>
                <div className="text-right"><span className="hidden sm:inline">Amount</span><span className="sm:hidden">Amt</span></div>
              </div>

              {/* Milk Cards Grid */}
              <div className="space-y-1.5 sm:space-y-2">
                {milkCard.lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-4 gap-1 sm:gap-2 items-center">
                    <div className="text-[10px] sm:text-xs">
                      <p className="font-bold text-gray-900">
                        {new Date(line.date).getDate()} {new Date(line.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-[8px] sm:text-[10px] text-gray-500">
                        {new Date(line.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                    </div>

                    <div
                      onClick={() => handleEntryClick(line.morningTransactionId, 'morning', line.morningQuantity, line.date)}
                      className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded p-1 sm:p-1.5 text-center ${line.morningTransactionId ? 'cursor-pointer hover:bg-amber-100 active:scale-95 transition-all' : ''}`}
                    >
                      <p className="text-xs sm:text-sm font-bold text-amber-900">
                        {line.morningQuantity.toFixed(1)}
                      </p>
                    </div>

                    <div
                      onClick={() => handleEntryClick(line.eveningTransactionId, 'evening', line.eveningQuantity, line.date)}
                      className={`bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded p-1 sm:p-1.5 text-center ${line.eveningTransactionId ? 'cursor-pointer hover:bg-indigo-100 active:scale-95 transition-all' : ''}`}
                    >
                      <p className="text-xs sm:text-sm font-bold text-indigo-900">
                        {line.eveningQuantity.toFixed(1)}
                      </p>
                    </div>

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

              {/* Morning and Evening Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm">☀️</span>
                    <p className="text-[10px] sm:text-xs font-semibold text-amber-900">Morning Total</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
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

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-300 rounded-lg p-2.5 sm:p-3">
                  <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm">🌙</span>
                    <p className="text-[10px] sm:text-xs font-semibold text-indigo-900">Evening Total</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
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
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </BaseModal>

      {/* Nested Modals */}
      {showPurchaseModal && modalData && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setModalData(null);
            setCurrentPurchase(null);
          }}
          onSubmit={handlePurchaseSubmit}
          supplier={modalData.supplier}
          availableTimes={modalData.availableTimes}
          isAdmin={true}
          expenseAccounts={expenseAccounts}
          selectedExpenseAccount={modalData.selectedExpenseAccount}
          isUpdate={modalData.isUpdate}
          updateData={modalData.updateData}
          initialDate={modalData.initialDate}
        />
      )}

      {showSalesModal && salesModalData && currentSale && (
        <SalesFormModal
          isOpen={showSalesModal}
          onClose={() => {
            setShowSalesModal(false);
            setSalesModalData(null);
            setCurrentSale(null);
          }}
          onSubmit={handleSalesSubmit}
          buyerName={salesModalData.buyer.name}
          buyerId={salesModalData.buyer.id.toString()}
          date={salesModalData.initialDate}
          isAdmin={true}
          isFromAddedList={true}
          revenueAccounts={revenueAccounts}
          initialData={{
            grossLiters: currentSale.grossLiters,
            lr: currentSale.lr,
            fat: currentSale.fat,
            netLiters: currentSale.netLiters,
            rate: currentSale.rate,
            amountReceived: currentSale.amountReceived,
            revenueAccountId: currentSale.revenueAccountId
          }}
          formValues={salesFormValues}
          onInputChange={handleSalesInputChange}
        />
      )}
    </>
  );
}