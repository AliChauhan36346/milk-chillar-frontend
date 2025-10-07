'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit, RefreshCw } from 'lucide-react';
import { openingBalancesApi, OpeningBalance, OpeningBalanceFilters } from '@/lib/api/openingBalances';
import OpeningBalanceModal from '@/components/modals/OpeningBalanceModal';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export default function OpeningBalancesPage() {
  // State
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [selectedBalance, setSelectedBalance] = useState<OpeningBalance | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OpeningBalanceFilters>({
    pageNumber: 1,
    pageSize: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Account search will be implemented later when API is available

  // Load opening balances
  const loadOpeningBalances = async () => {
    try {
      setLoading(true);
      const response = await openingBalancesApi.getOpeningBalances(filters);
      setOpeningBalances(response?.items ?? []);
      setTotalPages(response?.totalPages ?? 1);
    } catch (error) {
      toast({
        title: 'Failed to load opening balances',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpeningBalances();
  }, [filters]);

  // Handle create/update
  const handleSubmit = async (data: {
    accountId: number;
    openingDate: string;
    debitOpening: number;
    creditOpening: number;
    description: string;
  }, keepOpen: boolean) => {
    try {
      if (selectedBalance) {
        await openingBalancesApi.updateOpeningBalance(selectedBalance.openingBalanceId, data);
        toast({
          title: 'Opening balance updated successfully',
          variant: 'success'
        });
        setShowModal(false); // Always close on update
      } else {
        await openingBalancesApi.createOpeningBalance(data);
        toast({
          title: 'Opening balance added successfully',
          variant: 'success'
        });
        if (!keepOpen) {
          setShowModal(false); // Only close if keepOpen is false
        }
      }
      loadOpeningBalances();
    } catch (error) {
      toast({
        title: 'Operation failed',
        variant: 'error'
      });
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this opening balance?')) return;
    
    try {
      await openingBalancesApi.deleteOpeningBalance(id);
      toast({
        title: 'Opening balance deleted successfully',
        description: `Opening balance with ID ${id} has been deleted`,
        variant: 'success'
      });
      loadOpeningBalances();
    } catch (error: any) {
      console.error('Delete Error:', error);
      toast({
        title: 'Failed to delete opening balance',
        description: error?.message || 'An unexpected error occurred',
        variant: 'error'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opening Balances</h1>
            <p className="text-sm text-gray-600">Manage account opening balances</p>
          </div>
          <button
            onClick={() => {
              setSelectedBalance(undefined);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Opening Balance
          </button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={() => loadOpeningBalances()}
              className="p-2 border rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance Type
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  onChange={(e) => {
                    if (e.target.value === 'debit') {
                      setFilters(prev => ({ ...prev, hasDebitBalance: true, hasCreditBalance: false }));
                    } else if (e.target.value === 'credit') {
                      setFilters(prev => ({ ...prev, hasDebitBalance: false, hasCreditBalance: true }));
                    } else {
                      setFilters(prev => ({ ...prev, hasDebitBalance: undefined, hasCreditBalance: undefined }));
                    }
                  }}
                >
                  <option value="">All</option>
                  <option value="debit">Debit Only</option>
                  <option value="credit">Credit Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={filters.minAmount || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: Number(e.target.value) || undefined }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={filters.maxAmount || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: Number(e.target.value) || undefined }))}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Opening Balances Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4">Account</th>
                  <th className="text-left p-4">Debit</th>
                  <th className="text-left p-4">Credit</th>
                  <th className="text-left p-4">Net Balance</th>
                  <th className="text-left p-4">Added By</th>
                  <th className="text-left p-4">Created At</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : openingBalances.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      No opening balances found
                    </td>
                  </tr>
                ) : (
                  openingBalances.map((balance) => (
                    <tr key={balance.openingBalanceId} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{balance.accountCode}</div>
                          <div className="text-sm text-gray-600">{balance.accountName}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {balance.debitOpening > 0 ? `₨ ${balance.debitOpening.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4">
                        {balance.creditOpening > 0 ? `₨ ${balance.creditOpening.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={balance.balanceType === 'Debit' ? 'text-blue-600' : 'text-green-600'}>
                          ₨ {balance.absoluteBalance.toFixed(2)} {balance.balanceType}
                        </span>
                      </td>
                      <td className="p-4">{balance.addedByUsername}</td>
                      <td className="p-4">
                        {new Date(balance.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBalance(balance);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(balance.openingBalanceId)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {openingBalances.length} of {filters.pageSize} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, pageNumber: Math.max(1, (prev.pageNumber || 1) - 1) }))}
                disabled={filters.pageNumber === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, pageNumber: (prev.pageNumber || 1) + 1 }))}
                disabled={(filters.pageNumber || 1) >= totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Card>

        {/* Opening Balance Modal */}
        <OpeningBalanceModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedBalance(undefined);
          }}
          onSubmit={handleSubmit}
          initialData={selectedBalance}
        />
      </div>
    </AdminLayout>
  );
}