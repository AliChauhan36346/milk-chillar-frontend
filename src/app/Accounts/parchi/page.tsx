'use client';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ParchiPrintSlip } from '@/components/ui/ParchiPrintSlip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { PageHeader } from '@/components/ui/PageHeader';
import SummaryCard from '@/components/ui/SummaryCard';
import { Select } from '@/components/ui/Select';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PayParchiModal } from '@/components/modals/PayParchiModal';
import { cashPaymentsApi } from '@/lib/api/cashPayments';
import {
  Download,
  Calendar,
  TrendingUp,
  Wallet,
  FileText,
  RefreshCw,
  Printer,
  Search,
  Filter
} from 'lucide-react';
import {
  getSupplierParchi,
  ParchiDto,
  ParchiQueryParams,
  ParchiResult
} from '@/lib/api/parchi';
import { getEmployees, Employee } from '@/lib/api/employees';
import { useToast } from '@/hooks/useToast';

export default function ParchiPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedParchisForPayment, setSelectedParchisForPayment] = useState<ParchiDto[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parchiData, setParchiData] = useState<ParchiResult | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [selectedParchiForPrint, setSelectedParchiForPrint] = useState<ParchiDto[]>([]);

  // Set default dates (last 15 days)
  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 15);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();

  const [filters, setFilters] = useState<ParchiQueryParams>({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    dodhiId: undefined,
    search: '',
    isActive: true
  });

  useEffect(() => {
    loadEmployees();
    loadParchiData();
  }, []);



  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast({
        title: 'Failed to load employees',
        description: (error as Error)?.message || 'An error occurred',
        variant: 'error'
      });
    }
  };

  const loadParchiData = async () => {
    try {
      setLoading(true);
      const data = await getSupplierParchi(filters);
      setParchiData(data);
    } catch (error) {
      toast({
        title: 'Failed to load parchi data',
        description: (error as Error)?.message || 'An error occurred',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ParchiQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateParchi = () => {
    loadParchiData();
  };

  const handlePayAllParchis = () => {
    if (!parchiData || parchiData.items.length === 0) {
      toast({
        title: 'No parchis to pay',
        description: 'Generate parchi data first',
        variant: 'error'
      });
      return;
    }

    // Filter only parchis with amount > 0
    const payableParchis = parchiData.items.filter(p => p.parchiAmount > 0);

    if (payableParchis.length === 0) {
      toast({
        title: 'No payable parchis',
        description: 'All parchi amounts are zero',
        variant: 'error'
      });
      return;
    }

    setSelectedParchisForPayment(payableParchis);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayments = async (cashAccountId: number, confirmationText: string) => {
    try {
      // Group parchis into batches of 5
      const batches: ParchiDto[][] = [];
      for (let i = 0; i < selectedParchisForPayment.length; i += 5) {
        batches.push(selectedParchisForPayment.slice(i, i + 5));
      }

      let successCount = 0;
      let failCount = 0;

      // Helper function to format date
      const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
          day: '2-digit',
          month: 'short'
        });
      };

      // Create payments for each batch
      for (let i = 0; i < batches.length; i++) {
        try {
          const batch = batches[i];
          const totalAmount = batch.reduce((sum, p) => sum + p.parchiAmount, 0);

          // ✅ UPDATED: Create payment lines with new description format
          const paymentLines = batch.map(parchi => {
            // Format: "Parchi Payment 26-Sept to 11-Oct - 24.50 Ltrs"
            const description = `Parchi Payment ${formatDateShort(filters.startDate)} to ${formatDateShort(filters.endDate)} - ${parchi.totalLiters.toFixed(2)} Ltrs`;

            return {
              accountId: parchi.accountId,
              description: description,
              amount: parchi.parchiAmount
            };
          });

          // Create cash payment
          await cashPaymentsApi.createPayment({
            paymentDate: new Date(filters.endDate).toISOString(),
            jobDescription: `Parchi Payment ${i + 1}/${batches.length} - ${formatDateShort(filters.startDate)} to ${formatDateShort(filters.endDate)}`,
            cashAccountId: cashAccountId,
            totalAmount: totalAmount,
            remarks: `Bulk parchi payment for ${batch.length} suppliers`,
            paymentLines: paymentLines
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to create payment batch ${i + 1}:`, error);
          failCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: `Created ${successCount} payment(s) successfully`,
          description: failCount > 0 ? `${failCount} payment(s) failed` : undefined,
          variant: 'success'
        });
        setPaymentModalOpen(false); // ✅ Close modal on success
        loadParchiData(); // Refresh data
      } else {
        toast({
          title: 'Failed to create payments',
          description: 'Please try again or contact support',
          variant: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error creating payments',
        description: (error as Error)?.message || 'An error occurred',
        variant: 'error'
      });
      throw error;
    }
  };

  const handlePrintSelected = (parchi: ParchiDto) => {
    setSelectedParchiForPrint([parchi]);
    setPrintMode(true);
    setTimeout(() => window.print(), 100);
  };

  const handlePrintAll = () => {
    if (parchiData) {
      setSelectedParchiForPrint(parchiData.items);
      setPrintMode(true);
      setTimeout(() => window.print(), 100);
    }
  };



  // After print cleanup
  useEffect(() => {
    const afterPrint = () => {
      setPrintMode(false);
      setSelectedParchiForPrint([]);
    };

    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };


  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4 print:space-y-4">
          {/* Header - Hide on print */}
          <div className="print:hidden">
            <PageHeader
              title="Supplier Parchi"
              subtitle="Generate billing statements for suppliers"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              actions={
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePayAllParchis}
                    disabled={!parchiData || parchiData.items.length === 0 || loading}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Create Payments
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print All
                  </button>
                  <button
                    onClick={loadParchiData}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              }
            />
          </div>

          {/* Filters Toolbar - Hide on print */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs print:hidden">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Range */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Dodhi Filter */}
              <div className="min-w-[150px]">
                <Select
                  value={filters.dodhiId?.toString() || ''}
                  onChange={(value) => handleFilterChange('dodhiId', value ? Number(value) : undefined)}
                  options={[
                    { value: '', label: 'All Dodhis' },
                    ...employees.map(emp => ({
                      value: emp.employeeId.toString(),
                      label: emp.fullName
                    }))
                  ]}
                  placeholder="Select Dodhi"
                />
              </div>

              {/* Search Supplier */}
              <div className="relative min-w-[150px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Status */}
              <div className="min-w-[120px]">
                <Select
                  value={filters.isActive === undefined ? '' : String(filters.isActive)}
                  onChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'true', label: 'Active Only' },
                    { value: 'false', label: 'Inactive Only' },
                  ]}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateParchi}
                disabled={loading}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold shadow-xs ml-auto"
              >
                <Calendar className="w-3.5 h-3.5" />
                Generate Parchi
              </button>
            </div>
          </div>

          {/* Summary Cards - Hide on print */}
          {parchiData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 print:hidden">
              <SummaryCard
                title="Total Liters"
                value={`${parchiData.summary.totalLiters.toFixed(2)} L`}
                icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
                color="blue"
                subtitle="Total milk supplied"
              />

              <SummaryCard
                title="Purchase Amount"
                value={formatCurrency(parchiData.summary.totalPurchaseAmount)}
                icon={<Wallet className="w-4 h-4 text-emerald-600" />}
                color="green"
              />

              <SummaryCard
                title="Payments Made"
                value={formatCurrency(parchiData.summary.totalPayments)}
                icon={<FileText className="w-4 h-4 text-indigo-600" />}
                color="purple"
              />

              <SummaryCard
                title="Parchi Amount"
                value={formatCurrency(parchiData.summary.totalParchiAmount)}
                icon={<Calendar className="w-4 h-4 text-amber-600" />}
                color="orange"
                subtitle={`${parchiData.totalCount} suppliers`}
              />
            </div>
          )}

          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold">Supplier Parchi Report</h1>
            <p className="text-sm text-gray-600">
              Period: {formatDate(filters.startDate)} to {formatDate(filters.endDate)}
            </p>
            {filters.dodhiId && (
              <p className="text-sm text-gray-600">
                Dodhi: {employees.find(e => e.employeeId === filters.dodhiId)?.fullName}
              </p>
            )}
          </div>

          {/* Parchi Table */}
          <TableContainer title="Supplier Parchi Details">
            <div className="overflow-x-auto">
              <Table dense>
                <Table.Header sticky>
                  <Table.Row>
                    <Table.Head>Account</Table.Head>
                    <Table.Head>Khata No</Table.Head>
                    <Table.Head align="right">Prev. Balance</Table.Head>
                    <Table.Head align="right">Liters</Table.Head>
                    <Table.Head align="right">Purchase Amt</Table.Head>
                    <Table.Head align="right">Payments</Table.Head>
                    <Table.Head align="right">Closing Bal.</Table.Head>
                    <Table.Head align="right">Credit Limit</Table.Head>
                    <Table.Head align="right">Parchi Amt</Table.Head>
                    <Table.Head align="right">Final Bal.</Table.Head>
                    <Table.Head align="center" className="print:hidden">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loading ? (
                    <Table.Row>
                      <td colSpan={11} className="text-center py-10">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                        <p className="text-xs text-slate-500">Loading parchi data...</p>
                      </td>
                    </Table.Row>
                  ) : !parchiData || parchiData.items.length === 0 ? (
                    <Table.Row>
                      <td colSpan={11} className="text-center py-10">
                        <p className="text-xs text-slate-500">No data found. Please select filters and generate parchi.</p>
                      </td>
                    </Table.Row>
                  ) : (
                    parchiData.items.map((item, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          <div>
                            <div className="font-medium text-xs text-slate-900">{item.accountName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{item.accountCode}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-xs text-slate-600 font-mono">{item.khataNumber}</Table.Cell>
                        <Table.Cell align="right">
                          <span className={`text-xs font-medium tabular-nums ${item.previousBalanceType === 'Credit' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatCurrency(item.previousBalance)}
                            <span className="text-[10px] ml-0.5 text-slate-400 font-normal">({item.previousBalanceType})</span>
                          </span>
                        </Table.Cell>
                        <Table.Cell align="right" className="text-xs text-slate-900 font-medium tabular-nums">
                          {item.totalLiters.toFixed(2)}L
                        </Table.Cell>
                        <Table.Cell align="right" className="text-xs text-slate-900 font-medium tabular-nums">
                          {formatCurrency(item.purchaseAmount)}
                        </Table.Cell>
                        <Table.Cell align="right" className="text-xs text-slate-700 font-medium tabular-nums">
                          {formatCurrency(item.paymentsInPeriod)}
                        </Table.Cell>
                        <Table.Cell align="right">
                          <span className={`text-xs font-medium tabular-nums ${item.closingBalanceType === 'Credit' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatCurrency(item.closingBalance)}
                            <span className="text-[10px] ml-0.5 text-slate-400 font-normal">({item.closingBalanceType})</span>
                          </span>
                        </Table.Cell>
                        <Table.Cell align="right" className="text-xs text-slate-600 tabular-nums">
                          {item.isCreditAllowed ? formatCurrency(item.creditLimit) : '-'}
                        </Table.Cell>
                        <Table.Cell align="right">
                          <span className="font-medium text-xs text-blue-700 tabular-nums">
                            {formatCurrency(item.parchiAmount)}
                          </span>
                        </Table.Cell>
                        <Table.Cell align="right">
                          <span className={`text-xs font-medium tabular-nums ${item.finalBalanceType === 'Credit' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatCurrency(item.finalBalance)}
                            <span className="text-[10px] ml-0.5 text-slate-400 font-normal">({item.finalBalanceType})</span>
                          </span>
                        </Table.Cell>
                        <Table.Cell align="center" className="print:hidden">
                          <button
                            onClick={() => handlePrintSelected(item)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 hover:bg-emerald-50 rounded"
                            title="Print Parchi"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
          </TableContainer>

          {/* Print View */}
          {printMode && (
            <div className="print-container">
              {selectedParchiForPrint.map((parchi, index) => (
                <div key={index} className="receipt-wrapper">
                  <ParchiPrintSlip
                    parchi={parchi}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    companyName="CHAUHAN DAIRY FARMS"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <PayParchiModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onConfirm={handleConfirmPayments}
          parchis={selectedParchisForPayment}
          startDate={filters.startDate}
          endDate={filters.endDate}
        />

      </AdminLayout>
    </ProtectedRoute>
  );
}