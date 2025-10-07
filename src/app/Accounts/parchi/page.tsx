'use client';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ParchiPrintSlip } from '@/components/ui/ParchiPrintSlip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/components/ui/Table/Table';
import SummaryCard from '@/components/ui/SummaryCard';
import { Select } from '@/components/ui/Select';
import ProtectedRoute from '@/components/ProtectedRoutes';
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
        <div className="space-y-6 print:space-y-4">
          {/* Header - Hide on print */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supplier Parchi</h1>
              <p className="text-gray-600">Generate billing statements for suppliers</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrintAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={loadParchiData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Card - Hide on print */}
          <Card className="print:hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filters</CardTitle>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Dodhi Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dodhi
                  </label>
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
                  />
                </div>

                {/* Generate Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateParchi}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Generate Parchi
                  </button>
                </div>
              </div>

              {/* Advanced Filters - Collapsible */}
              {showFilters && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Select
                      value={filters.isActive?.toString() || 'true'}
                      onChange={(value) => handleFilterChange('isActive', value === 'true')}
                      options={[
                        { value: 'true', label: 'Active Only' },
                        { value: 'false', label: 'Inactive Only' },
                        { value: '', label: 'All Status' }
                      ]}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards - Hide on print */}
          {parchiData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
              <SummaryCard
                title="Total Liters"
                value={parchiData.summary.totalLiters.toFixed(2)}
                //icon should be milk drops etc
                icon={<TrendingUp className="w-6 h-6" />}
                color="blue"
                subtitle="Total milk supplied"
              />

              <SummaryCard
                title="Purchase Amount"
                value={formatCurrency(parchiData.summary.totalPurchaseAmount)}
                icon={<Wallet className="w-6 h-6" />}
                color="green"
              />

              <SummaryCard
                title="Payments Made"
                value={formatCurrency(parchiData.summary.totalPayments)}
                icon={<FileText className="w-6 h-6" />}
                color="purple"
              />

              <SummaryCard
                title="Parchi Amount"
                value={formatCurrency(parchiData.summary.totalParchiAmount)}
                icon={<Calendar className="w-6 h-6" />}
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
          <Card>
            <CardHeader className="print:hidden">
              <CardTitle>Supplier Parchi Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Account</Table.Head>
                    <Table.Head>Khata No</Table.Head>
                    <Table.Head className="text-right">Prev. Balance</Table.Head>
                    <Table.Head className="text-right">Liters</Table.Head>
                    <Table.Head className="text-right">Purchase Amt</Table.Head>
                    <Table.Head className="text-right">Payments</Table.Head>
                    <Table.Head className="text-right">Closing Bal.</Table.Head>
                    <Table.Head className="text-right">Credit Limit</Table.Head>
                    <Table.Head className="text-right">Parchi Amt</Table.Head>
                    <Table.Head className="text-right">Final Bal.</Table.Head>
                    <Table.Head className="text-center print:hidden">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loading ? (
                    <Table.Row>
                      <Table.Cell colSpan={10} className="text-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Loading parchi data...</p>
                      </Table.Cell>
                    </Table.Row>
                  ) : !parchiData || parchiData.items.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={10} className="text-center py-12">
                        <p className="text-gray-500">No data found. Please select filters and generate parchi.</p>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    parchiData.items.map((item, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          <div>
                            <div className="font-medium">{item.accountName}</div>
                            <div className="text-xs text-gray-500">{item.accountCode}</div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{item.khataNumber}</Table.Cell>
                        <Table.Cell className="text-right">
                          <div className={item.previousBalanceType === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.previousBalance)}
                            <span className="text-xs ml-1">({item.previousBalanceType})</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right">{item.totalLiters.toFixed(2)}</Table.Cell>
                        <Table.Cell className="text-right">{formatCurrency(item.purchaseAmount)}</Table.Cell>
                        <Table.Cell className="text-right">{formatCurrency(item.paymentsInPeriod)}</Table.Cell>
                        <Table.Cell className="text-right">
                          <div className={item.closingBalanceType === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.closingBalance)}
                            <span className="text-xs ml-1">({item.closingBalanceType})</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          {item.isCreditAllowed ? formatCurrency(item.creditLimit) : '-'}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <span className="font-bold text-blue-600">
                            {formatCurrency(item.parchiAmount)}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <div className={item.finalBalanceType === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.finalBalance)}
                            <span className="text-xs ml-1">({item.finalBalanceType})</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-center print:hidden">
                          <button
                            onClick={() => handlePrintSelected(item)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded"
                            title="Print Parchi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </CardContent>
          </Card>

          {/* Print View */}
          {printMode && (
            <div className="print:block hidden">
              {selectedParchiForPrint.map((parchi, index) => (
                <ParchiPrintSlip
                  key={index}
                  parchi={parchi}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  companyName="Milk Chillar"
                />
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}