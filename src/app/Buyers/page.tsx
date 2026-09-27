
'use client';
import { useState, useEffect, useRef, Suspense} from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Plus, RefreshCw } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table, TableContainer } from '@/components/ui/Table/Table';
import { getBuyersPaged, Buyer } from '@/lib/api/buyers';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/hooks/useToast';


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
  const [totalCount, setTotalCount] = useState(0);
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
          setTotalCount(data.totalCount || data.items?.length || 0);
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
        <div className="max-w-7xl mx-auto space-y-3.5">
          {/* Header */}
          <PageHeader
            title="Buyers"
            subtitle="Manage commercial milk buyers, khata numbers, and credit terms"
            icon={<Building2 />}
            actions={
              <button
                onClick={() => router.push('/Buyers/createBuyer')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add New Buyer
              </button>
            }
          />

          {/* Filters Toolbar */}
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
                  {(isFetching || searchQuery !== debouncedSearch) && (
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
              </>
            }
            right={
              <span className="text-xs text-slate-500 font-medium">
                {totalCount > 0
                  ? `${((pageNumber - 1) * pageSize) + 1}-${Math.min(pageNumber * pageSize, totalCount)} of ${totalCount} buyers`
                  : `${buyers.length} buyers`}
              </span>
            }
          />

          {/* Desktop Table View */}
          <div className={`hidden md:block transition-opacity duration-150 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <TableContainer>
              <Table dense>
                <Table.Header>
                  <Table.Row>
                    <Table.Head dense>Account Code</Table.Head>
                    <Table.Head dense>Name</Table.Head>
                    <Table.Head dense>Khata Number</Table.Head>
                    <Table.Head dense className="text-right">Rate (Rs/L)</Table.Head>
                    <Table.Head dense className="text-right">Credit Limit</Table.Head>
                    <Table.Head dense className="text-center">Status</Table.Head>
                    <Table.Head dense className="text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {isInitialLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                          <span className="text-xs text-slate-500">Loading buyers...</span>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : buyers.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} className="text-center py-8 text-slate-500">
                        No buyers found matching your criteria.
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    buyers.map((buyer) => (
                      <Table.Row key={buyer.buyerId}>
                        <Table.Cell dense className="font-mono text-xs text-slate-600">
                          {buyer.accountCode}
                        </Table.Cell>
                        <Table.Cell dense>
                          <button
                            onClick={() => router.push(`/Buyers/buyerDetail?id=${buyer.buyerId}`)}
                            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors text-left"
                          >
                            {buyer.accountName}
                          </button>
                        </Table.Cell>
                        <Table.Cell dense className="text-slate-700">
                          {buyer.khataNumber || '-'}
                        </Table.Cell>
                        <Table.Cell dense className="text-right font-medium text-slate-900">
                          {buyer.rate?.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell dense className="text-right text-slate-700">
                          {buyer.creditLimit ? `Rs ${buyer.creditLimit.toFixed(2)}` : '-'}
                        </Table.Cell>
                        <Table.Cell dense className="text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                              buyer.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {buyer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </Table.Cell>
                        <Table.Cell dense className="text-right">
                          <button
                            onClick={() => router.push(`/Buyers/createBuyer?id=${buyer.buyerId}`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card List for Buyers */}
          <div className={`md:hidden space-y-2.5 transition-opacity duration-150 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {isInitialLoading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading buyers...</span>
              </div>
            ) : buyers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No buyers found matching your criteria.
              </div>
            ) : (
              buyers.map((buyer) => (
                <div key={buyer.buyerId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <button
                        onClick={() => router.push(`/Buyers/buyerDetail?id=${buyer.buyerId}`)}
                        className="font-bold text-xs text-blue-600 hover:text-blue-800 text-left block"
                      >
                        {buyer.accountName}
                      </button>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{buyer.accountCode}</span>
                        {buyer.khataNumber && <span>• Khata: {buyer.khataNumber}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                          buyer.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {buyer.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => router.push(`/Buyers/createBuyer?id=${buyer.buyerId}`)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border border-slate-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="text-slate-600">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Rate</span>
                      <strong className="text-slate-900">Rs {buyer.rate?.toFixed(2)}/L</strong>
                    </div>
                    <div className="text-right text-slate-600">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Credit Limit</span>
                      <span className="text-slate-700">{buyer.creditLimit ? `Rs ${buyer.creditLimit.toFixed(2)}` : '-'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Page {pageNumber} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className="px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className="px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}
