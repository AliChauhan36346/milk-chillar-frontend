'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, RefreshCw, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PaymentCard } from '@/components/ui/transactions/PaymentCard';
import { cashPaymentsApi, CashPayment, CashPaymentSearchParams } from '@/lib/api/cashPayments';
import { useToast } from '@/hooks/useToast';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function CashPaymentsPage() {
  const router = useRouter();

  // State
  const [payments, setPayments] = useState<CashPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CashPaymentSearchParams>({
    PageNumber: 1,
    PageSize: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Load cash payments
  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await cashPaymentsApi.getPayments(filters);
      setPayments(response?.items ?? []);
      setTotalPages(response?.totalPages ?? 1);
      setTotalCount(response?.totalCount ?? 0);
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      toast({
        title: 'Failed to load payments',
        description: error?.message || 'An unexpected error occurred',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filters]);

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cash payment?')) return;
    
    try {
      await cashPaymentsApi.deletePayment(id);
      toast({
        title: 'Payment deleted successfully',
        variant: 'success'
      });
      loadPayments();
    } catch (error: any) {
      console.error('Delete Error:', error);
      toast({
        title: 'Failed to delete payment',
        description: error?.message || 'An unexpected error occurred',
        variant: 'error'
      });
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (paymentId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedRows(newExpanded);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₨ ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="p-1 sm:p-2 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cash Payments</h1>
            <p className="text-sm text-gray-600">Manage cash payment vouchers</p>
          </div>
          <button
            onClick={() => {
              router.push('/Accounts/transactions/cashPayments/create');
            }}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {/* Filters - Mobile Optimized */}
        <Card className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, voucher no..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                value={filters.Search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, Search: e.target.value, PageNumber: 1 }))}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadPayments()}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500">
                  {totalCount} total
                </div>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Voucher No
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.VoucherNo || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      VoucherNo: Number(e.target.value) || undefined,
                      PageNumber: 1 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.FromDate || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      FromDate: e.target.value || undefined,
                      PageNumber: 1 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.ToDate || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      ToDate: e.target.value || undefined,
                      PageNumber: 1 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.MinAmount || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      MinAmount: Number(e.target.value) || undefined,
                      PageNumber: 1 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg text-sm"
                    value={filters.MaxAmount || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      MaxAmount: Number(e.target.value) || undefined,
                      PageNumber: 1 
                    }))}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <button
                    onClick={() => setFilters({
                      PageNumber: 1,
                      PageSize: 10
                    })}
                    className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Cards - Beautiful and Reusable */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-4">
              <div className="flex items-center justify-center gap-3 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                <span className="text-sm font-medium">Loading payments...</span>
              </div>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="py-8 text-center">
              <div className="text-gray-500">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Payments Found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search filters or create a new payment</p>
              </div>
            </Card>
          ) : (
            payments.map((payment) => (
              <PaymentCard
                key={payment.cashPaymentId}
                payment={payment}
                onView={(id) => router.push(`/Accounts/transactions/cashPayments/view/${id}`)}
                onEdit={(id) => router.push(`/Accounts/transactions/cashPayments/create?id=${id}`)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Pagination - Mobile Optimized */}
        {totalPages > 1 && (
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Page {filters.PageNumber} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    PageNumber: Math.max(1, (prev.PageNumber || 1) - 1) 
                  }))}
                  disabled={filters.PageNumber === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    PageNumber: (prev.PageNumber || 1) + 1 
                  }))}
                  disabled={(filters.PageNumber || 1) >= totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}