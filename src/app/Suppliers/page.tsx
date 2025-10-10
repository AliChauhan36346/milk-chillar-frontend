'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
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
        <div className="p-6">
          {/* Compact Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
              <p className="text-sm text-gray-600">{totalItems} total suppliers</p>
            </div>
            <button
              onClick={() => router.push('/Suppliers/createSupplier')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </button>
          </div>

          {/* Compact Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                {isLoading && debouncedSearch !== searchQuery && (
                  <RefreshCw className="absolute right-3 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                  setPageNumber(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Compact Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {suppliers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Khata</th>
                        <th className="px-4 py-3">Rate</th>
                        <th className="px-4 py-3">Credit Limit</th>
                        <th className="px-4 py-3">Dodhi</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {suppliers.map((supplier) => (
                        <tr key={supplier.supplierId} className="hover:bg-gray-50 text-sm">
                          <td className="px-4 py-3">
                            <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs">
                              {getAccountNumber(supplier.accountCode)}
                            </span>
                          </td>
                          {/* <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {supplier.accountName}
                            </button>
                          </td> */}

                          <td className="px-4 py-3">
                            <button
                              onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                              style={{
                                fontFamily: supplier.nameUrdu
                                  ? 'Noto Nastaliq Urdu, sans-serif'
                                  : 'inherit'
                              }}
                            >
                              {supplier.nameUrdu || supplier.accountName}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-gray-700">
                            {supplier.khataNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            Rs {supplier.rate?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            Rs {supplier.creditLimit?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {supplier.dodhiName || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${supplier.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {supplier.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplierId}`)}
                                className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Compact Pagination */}
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    {((pageNumber - 1) * pageSize) + 1}-{Math.min(pageNumber * pageSize, totalItems)} of {totalItems}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                      disabled={pageNumber === 1}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-2 py-1 text-gray-700">
                      {pageNumber} / {totalPages}
                    </span>

                    <button
                      onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                      disabled={pageNumber === totalPages}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">No suppliers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? "Try adjusting your search or filter."
                    : "Add your first supplier to get started."
                  }
                </p>
                <button
                  onClick={() => router.push('/Suppliers/createSupplier')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </button>
              </div>
            )}
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}