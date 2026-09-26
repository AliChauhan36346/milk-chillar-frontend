'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Truck,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { getSuppliersPaged, Supplier } from '@/lib/api/suppliers';
import { useToast } from '@/hooks/useToast';
import MilkLoader from '@/components/ui/Loader';

export default function SupplierListPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch suppliers when debounced search, filters, or pagination changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) return; // Wait for debounce
    setPageNumber(1); // Reset to first page when search changes
    fetchSuppliers();
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter, pageNumber, pageSize]);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const data = await getSuppliersPaged({
        pageNumber,
        pageSize,
        search: debouncedSearch,
        isActive,
        mainAccountCode: '202',
      });
      setSuppliers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalCount);
    } catch (error) {
      toast({
        title: 'Error fetching suppliers',
        description: (error as Error)?.message || 'An error occurred',
        variant: 'error'
      });
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, debouncedSearch, statusFilter, toast]);

  const handleRefresh = () => {
    fetchSuppliers();
  };

  // Extract just the account number from full account code
  const getAccountNumber = (accountCode: string) => {
    // If account code is like "202-001", return "001"
    // If account code is just a number, return it as is
    const parts = accountCode.split('-');
    return parts.length > 1 ? parts[parts.length - 1] : accountCode;
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-7xl mx-auto space-y-3.5">
          {/* Header */}
          <PageHeader
            title="Suppliers"
            subtitle={`${totalItems} total milk suppliers & farmers`}
            icon={<Truck />}
            actions={
              <button
                onClick={() => router.push('/Suppliers/createSupplier')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            }
          />

          {/* Compact Filters Toolbar */}
          <CompactToolbar
            left={
              <>
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by name, khata, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {isLoading && debouncedSearch !== searchQuery && (
                    <RefreshCw className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                    setPageNumber(1);
                  }}
                  className="px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </>
            }
            right={
              <span className="text-xs text-slate-500 font-medium">
                {totalItems > 0
                  ? `${((pageNumber - 1) * pageSize) + 1}-${Math.min(pageNumber * pageSize, totalItems)} of ${totalItems}`
                  : '0 suppliers'}
              </span>
            }
          />

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TableContainer>
              {suppliers.length > 0 ? (
                <Table dense>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head dense>Code</Table.Head>
                      <Table.Head dense>Name</Table.Head>
                      <Table.Head dense>Khata</Table.Head>
                      <Table.Head dense className="text-right">Rate</Table.Head>
                      <Table.Head dense className="text-right">Credit Limit</Table.Head>
                      <Table.Head dense>Dodhi</Table.Head>
                      <Table.Head dense className="text-center">Status</Table.Head>
                      <Table.Head dense className="text-right">Actions</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {suppliers.map((supplier) => (
                      <Table.Row key={supplier.supplierId}>
                        <Table.Cell dense>
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                            {getAccountNumber(supplier.accountCode)}
                          </span>
                        </Table.Cell>

                        <Table.Cell dense>
                          <button
                            onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors text-left"
                            style={{
                              fontFamily: supplier.nameUrdu
                                ? 'Noto Nastaliq Urdu, sans-serif'
                                : 'inherit'
                            }}
                          >
                            {supplier.nameUrdu || supplier.accountName}
                          </button>
                        </Table.Cell>

                        <Table.Cell dense className="text-slate-700">
                          {supplier.khataNumber || '-'}
                        </Table.Cell>
                        <Table.Cell dense className="text-right font-medium text-slate-900">
                          Rs {supplier.rate?.toFixed(2) || '0.00'}
                        </Table.Cell>
                        <Table.Cell dense className="text-right text-slate-700">
                          {supplier.creditLimit ? `Rs ${supplier.creditLimit.toFixed(2)}` : '-'}
                        </Table.Cell>
                        <Table.Cell dense className="text-slate-700">
                          {supplier.dodhiName || '-'}
                        </Table.Cell>
                        <Table.Cell dense className="text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                              supplier.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </Table.Cell>
                        <Table.Cell dense className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                              title="View"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplierId}`)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-base font-semibold text-slate-800 mb-1">No suppliers found</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {searchQuery || statusFilter !== 'all'
                      ? "Try adjusting your search or filter."
                      : "Add your first supplier to get started."}
                  </p>
                  <button
                    onClick={() => router.push('/Suppliers/createSupplier')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Supplier
                  </button>
                </div>
              )}
            </TableContainer>
          </div>

          {/* Mobile Card List for Suppliers */}
          <div className="md:hidden space-y-2.5">
            {suppliers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                {searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your search or filter."
                  : "Add your first supplier to get started."}
              </div>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.supplierId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <button
                        onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                        className="font-bold text-xs text-blue-600 hover:text-blue-800 text-left block"
                        style={{
                          fontFamily: supplier.nameUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit'
                        }}
                      >
                        {supplier.nameUrdu || supplier.accountName}
                      </button>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>#{getAccountNumber(supplier.accountCode)}</span>
                        {supplier.khataNumber && <span>• Khata: {supplier.khataNumber}</span>}
                        {supplier.dodhiName && <span className="text-slate-600 font-sans">• Dodhi: {supplier.dodhiName}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                          supplier.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplierId}`)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border border-slate-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="text-slate-600">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Rate</span>
                      <strong className="text-slate-900">Rs {supplier.rate?.toFixed(2) || '0.00'}/L</strong>
                    </div>
                    <div className="text-right text-slate-600">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Credit Limit</span>
                      <span className="text-slate-700">{supplier.creditLimit ? `Rs ${supplier.creditLimit.toFixed(2)}` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Shared Pagination Controls */}
          {totalItems > 0 && totalPages > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs shadow-xs">
              <div className="text-slate-500 font-medium">
                {((pageNumber - 1) * pageSize) + 1}-{Math.min(pageNumber * pageSize, totalItems)} of {totalItems} suppliers
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="p-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 font-medium text-slate-700">
                  {pageNumber} / {totalPages}
                </span>

                <button
                  onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                  className="p-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}