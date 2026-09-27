'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getBuyersPaged, Buyer } from '@/lib/api/buyers';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Suspense } from 'react';

export default function BuyerListPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6">Loading buyers...</div>}>
      <BuyerListPage />
    </Suspense>
  );
}


function BuyerListPage() {
  const router = useRouter();
  const { user } = useAuth?.() || {};
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to first page when search or status filter changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPageNumber(1);
  }, [debouncedSearch, statusFilter]);

  // Fetch buyers
  useEffect(() => {
    let isCancelled = false;

    const fetchBuyers = async () => {
      setIsFetching(true);
      try {
        const tenantId = user?.tenantId || 3;
        const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
        const data = await getBuyersPaged({
          tenantId,
          pageNumber,
          pageSize,
          search: debouncedSearch,
          isActive,
        });
        if (!isCancelled) {
          setBuyers(data.items || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        if (!isCancelled) {
          toast({ title: 'Error fetching buyers', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
          console.error('Error fetching buyers:', error);
        }
      } finally {
        if (!isCancelled) {
          setIsFetching(false);
          setIsInitialLoading(false);
        }
      }
    };

    fetchBuyers();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, statusFilter, pageNumber, pageSize, user?.tenantId, toast]);

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Buyers</h1>
            <button
              onClick={() => router.push('/Buyers/createBuyer')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Buyer
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search buyers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {(isFetching || searchQuery !== debouncedSearch) && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'); setPageNumber(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-opacity duration-150 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Account Code</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Khata Number</th>
                    <th className="px-6 py-3">Rate</th>
                    <th className="px-6 py-3">Credit Limit</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isInitialLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="text-xs text-gray-500">Loading buyers...</span>
                        </div>
                      </td>
                    </tr>
                  ) : buyers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No buyers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    buyers.map((buyer) => (
                      <tr key={buyer.buyerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.accountCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/Buyers/buyerDetail?id=${buyer.buyerId}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {buyer.accountName}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.khataNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.rate?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {buyer.creditLimit?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            buyer.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {buyer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => router.push(`/Buyers/createBuyer?id=${buyer.buyerId}`)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-1">Page {pageNumber} of {totalPages}</span>
            <button
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
