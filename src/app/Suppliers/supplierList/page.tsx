'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Eye, 
  Edit, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
  CreditCard,
  Hash,
  TrendingUp
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getSuppliersPaged, Supplier } from '@/lib/api/suppliers';
import { useToast } from '@/hooks/useToast';

export default function SupplierListPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
      setTotalItems(data.items.length);
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading suppliers...</p>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Suppliers Management</h1>
                <p className="text-slate-600">Manage your supplier accounts and relationships</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors duration-200 border border-slate-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => router.push('/Suppliers/createSupplier')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Add New Supplier
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Suppliers</p>
                    <p className="text-2xl font-bold text-slate-800">{totalItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <UserCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Suppliers</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {suppliers.filter(s => s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <UserX className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Inactive Suppliers</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {suppliers.filter(s => !s.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search suppliers by name, account code, or khata number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    {isLoading && debouncedSearch !== searchQuery && (
                      <div className="absolute right-4 top-3.5">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                      setPageNumber(1);
                    }}
                    className="px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer min-w-[140px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <Filter className="absolute right-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>

                {/* Page Size */}
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPageNumber(1);
                    }}
                    className="px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer min-w-[100px]"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  Showing {suppliers.length} of {totalItems} suppliers
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <div className="text-sm text-slate-500">
                  Page {pageNumber} of {totalPages}
                </div>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {suppliers.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          <th className="px-6 py-4">Account Code</th>
                          <th className="px-6 py-4">Supplier Name</th>
                          <th className="px-6 py-4">Khata Number</th>
                          <th className="px-6 py-4">Rate</th>
                          <th className="px-6 py-4">Credit Limit</th>
                          <th className="px-6 py-4">Dodhi Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {suppliers.map((supplier) => (
                          <tr key={supplier.supplierId} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                  {supplier.accountCode}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                              >
                                {supplier.accountName}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-900 font-medium">
                                {supplier.khataNumber || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-900">
                                  Rs {supplier.rate?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-semibold text-slate-900">
                                  Rs {supplier.creditLimit?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {supplier.dodhiName || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(supplier.isActive)}`}>
                                {supplier.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => router.push(`/Suppliers/supplierDetail?id=${supplier.supplierId}`)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/Suppliers/createSupplier?id=${supplier.supplierId}`)}
                                  className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                  title="Edit Supplier"
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

                  {/* Pagination */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalItems)} of {totalItems} results
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                          disabled={pageNumber === 1}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPageNumber(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                  pageNumber === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                          disabled={pageNumber === totalPages}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No suppliers found</h3>
                  <p className="text-slate-600 mb-6">
                    {searchQuery || statusFilter !== 'all'
                      ? "Try adjusting your search or filter criteria."
                      : "Start by adding your first supplier to the system."
                    }
                  </p>
                  <button
                    onClick={() => router.push('/Suppliers/createSupplier')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Supplier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
