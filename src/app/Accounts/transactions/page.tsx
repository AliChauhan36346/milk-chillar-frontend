'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getRoznamcha,
  getCashAccounts,
  getBankAccounts,
  exportRoznamcha,
  RoznamchaFilterRequest,
  RoznamchaEntryDto,
} from '@/lib/api/roznamcha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CenteredSpinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/useToast';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import {
  BookOpen,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';

export default function RoznamchaPage() {
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState<RoznamchaFilterRequest>({
    page: 1,
    limit: 50,
    viewType: 'ALL',
    transactionType: 'ALL',
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown data
  const { data: cashAccounts } = useQuery({
    queryKey: ['cashAccounts'],
    queryFn: getCashAccounts,
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: getBankAccounts,
  });

  // Fetch roznamcha data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['roznamcha', filters],
    queryFn: () => getRoznamcha(filters),
  });

  const handleFilterChange = (key: keyof RoznamchaFilterRequest, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      viewType: 'ALL',
      transactionType: 'ALL',
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setIsExporting(true);
      await exportRoznamcha(filters, format);
      toast({
        title: 'Success',
        description: `Roznamcha exported as ${format.toUpperCase()}`,
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export roznamcha',
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getVoucherBadgeColor = (type: string) => {
    switch (type) {
      case 'CASH_PAYMENT':
        return 'bg-red-100 text-red-700';
      case 'CASH_RECEIPT':
        return 'bg-green-100 text-green-700';
      case 'BANK_PAYMENT':
        return 'bg-orange-100 text-orange-700';
      case 'BANK_RECEIPT':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVoucherLabel = (type: string) => {
    switch (type) {
      case 'CASH_PAYMENT':
        return 'Cash Payment';
      case 'CASH_RECEIPT':
        return 'Cash Receipt';
      case 'BANK_PAYMENT':
        return 'Bank Payment';
      case 'BANK_RECEIPT':
        return 'Bank Receipt';
      default:
        return type;
    }
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (k) => !['page', 'limit', 'viewType', 'transactionType'].includes(k) && filters[k as keyof RoznamchaFilterRequest]
  ).length;

  const roznamchaStats: StatItem[] = data?.summary
    ? [
        {
          label: 'Payments',
          value: formatCurrency(data.summary.totalPayments),
          icon: <TrendingDown />,
          color: 'red',
          trend: 'down',
        },
        {
          label: 'Receipts',
          value: formatCurrency(data.summary.totalReceipts),
          icon: <TrendingUp />,
          color: 'green',
          trend: 'up',
        },
        {
          label: 'Net Balance',
          value: formatCurrency(data.summary.netAmount),
          icon: <DollarSign />,
          color: data.summary.netAmount >= 0 ? 'blue' : 'amber',
        },
        {
          label: 'Transactions',
          value: data.summary.totalTransactions,
          icon: <FileText />,
          color: 'purple',
        },
      ]
    : [];

  return (
    <DynamicLayout allowedRoles={['Admin', 'manager']}>
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Header */}
        <PageHeader
          title="Roznamcha"
          subtitle="Cash & Bank Payments and Receipts Daily Register"
          icon={<BookOpen />}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={isExporting || !data}
              className="inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          }
        />

        {/* Compact Stat Strip */}
        {data?.summary && <StatStrip items={roznamchaStats} />}

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.viewType === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('viewType', 'ALL')}
          >
            All
          </Button>
          <Button
            variant={filters.viewType === 'CASH' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('viewType', 'CASH')}
          >
            Cash Book
          </Button>
          <Button
            variant={filters.viewType === 'BANK' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('viewType', 'BANK')}
          >
            Bank Book
          </Button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <Button
            variant={filters.transactionType === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('transactionType', 'ALL')}
          >
            All
          </Button>
          <Button
            variant={filters.transactionType === 'PAYMENT' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('transactionType', 'PAYMENT')}
          >
            Payments
          </Button>
          <Button
            variant={filters.transactionType === 'RECEIPT' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('transactionType', 'RECEIPT')}
          >
            Receipts
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFilters();
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Input
                      placeholder="Search account or description..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cash Account</label>
                  <Select
                    value={filters.cashAccountId?.toString() || ''}
                    onChange={(value) => handleFilterChange('cashAccountId', value ? parseInt(value) : undefined)}
                    options={[
                      { value: '', label: 'All Cash Accounts' },
                      ...(cashAccounts || []).map((acc: any) => ({
                        value: acc.accountId.toString(),
                        label: `${acc.accountCode} - ${acc.name}`,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                  <Select
                    value={filters.bankAccountId?.toString() || ''}
                    onChange={(value) => handleFilterChange('bankAccountId', value ? parseInt(value) : undefined)}
                    options={[
                      { value: '', label: 'All Bank Accounts' },
                      ...(bankAccounts || []).map((acc: any) => ({
                        value: acc.accountId.toString(),
                        label: `${acc.accountCode} - ${acc.name}`,
                      })),
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Entries */}
        {isLoading ? (
          <CenteredSpinner message="Loading transactions..." size="lg" />
        ) : data && data.entries.length > 0 ? (
          <>
            {/* Desktop View */}
            <TableContainer className="hidden md:block">
              <Table dense>
                <Table.Header>
                  <Table.Row>
                    <Table.Head dense>Date</Table.Head>
                    <Table.Head dense>Voucher</Table.Head>
                    <Table.Head dense>Account Code</Table.Head>
                    <Table.Head dense>Account Name</Table.Head>
                    <Table.Head dense>Description</Table.Head>
                    <Table.Head dense>Cash / Bank Account</Table.Head>
                    <Table.Head dense className="text-right">Amount</Table.Head>
                    <Table.Head dense className="text-center">Type</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.entries.flatMap((entry) => 
                    entry.lines.map((line, lineIdx) => (
                      <Table.Row key={`${entry.id}-${lineIdx}`}>
                        <Table.Cell dense className="font-medium text-slate-900">{formatDate(entry.date)}</Table.Cell>
                        <Table.Cell dense>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{entry.voucherNo}</span>
                            {entry.jobDescription && (
                              <span className="text-[11px] text-slate-500">{entry.jobDescription}</span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell dense className="font-mono text-xs text-slate-600">{line.accountCode}</Table.Cell>
                        <Table.Cell dense className="font-medium text-slate-800">{line.accountName}</Table.Cell>
                        <Table.Cell dense className="text-slate-600 max-w-xs truncate">{line.description || '-'}</Table.Cell>
                        <Table.Cell dense className="text-slate-700">{entry.cashOrBankAccount}</Table.Cell>
                        <Table.Cell dense className="text-right">
                          <span className={`font-semibold ${entry.voucherType.includes('RECEIPT') ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {entry.voucherType.includes('RECEIPT') ? '+' : '-'}{formatCurrency(line.amount)}
                          </span>
                        </Table.Cell>
                        <Table.Cell dense className="text-center">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getVoucherBadgeColor(entry.voucherType)}`}>
                            {getVoucherLabel(entry.voucherType)}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {data.entries.flatMap((entry) => 
                entry.lines.map((line, lineIdx) => (
                  <Card key={`${entry.id}-${lineIdx}`} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm mb-1">{line.accountName}</p>
                          <p className="text-xs text-gray-600">{formatDate(entry.date)}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-sm font-semibold ${entry.voucherType.includes('RECEIPT') ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.voucherType.includes('RECEIPT') ? '+' : '-'}{formatCurrency(line.amount)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getVoucherBadgeColor(entry.voucherType)}`}>
                            {getVoucherLabel(entry.voucherType)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">Account Code:</p>
                          <p className="font-medium">{line.accountCode}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Bank/Cash Account:</p>
                          <p className="font-medium">{entry.cashOrBankAccount}</p>
                        </div>
                        {line.description && (
                          <div className="col-span-2">
                            <p className="text-gray-600">Description:</p>
                            <p className="font-medium">{line.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {((data.pagination.currentPage - 1) * data.pagination.perPage) + 1} to{' '}
                      {Math.min(data.pagination.currentPage * data.pagination.perPage, data.pagination.totalRecords)} of{' '}
                      {data.pagination.totalRecords} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                        disabled={!data.pagination.hasPrevious}
                      >
                        Previous
                      </Button>
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (data.pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (data.pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (data.pagination.currentPage >= data.pagination.totalPages - 2) {
                            pageNum = data.pagination.totalPages - 4 + i;
                          } else {
                            pageNum = data.pagination.currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === data.pagination.currentPage ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-10 h-10 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                        disabled={!data.pagination.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or date range</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DynamicLayout>
  );
}