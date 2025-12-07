// components/modals/OpeningBalanceModal.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Calculator, Wallet, Coins } from 'lucide-react';
import { OpeningBalance, OpeningBalanceCreateUpdate } from '@/lib/api/openingBalances';
import { searchAccounts, SearchAccountResult } from '@/lib/api/accounts';
import debounce from 'lodash/debounce';
import { BaseModal } from '@/components/ui/Modal/BaseModal';

interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpeningBalanceCreateUpdate, keepOpen: boolean) => Promise<void>;
  initialData?: OpeningBalance;
}

export default function OpeningBalanceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: OpeningBalanceModalProps) {
  const [formData, setFormData] = useState<OpeningBalanceCreateUpdate>({
    accountId: initialData?.accountId || 0,
    openingDate: initialData?.openingDate || new Date().toISOString().split('T')[0],
    debitOpening: initialData?.debitOpening || 0,
    creditOpening: initialData?.creditOpening || 0,
    description: initialData?.description || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchAccountResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SearchAccountResult | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      try {
        setSearchLoading(true);
        const results = await searchAccounts(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchTerm && !selectedAccount) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, selectedAccount, debouncedSearch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        accountId: initialData.accountId,
        openingDate: initialData.openingDate,
        debitOpening: initialData.debitOpening,
        creditOpening: initialData.creditOpening,
        description: initialData.description
      });
      if (initialData.accountCode && initialData.accountName) {
        setSelectedAccount({
          accountId: initialData.accountId,
          accountCode: initialData.accountCode,
          name: initialData.accountName,
          balance: 0
        });
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.accountId) {
      setError('Please select an account');
      return;
    }

    if (formData.debitOpening < 0 || formData.creditOpening < 0) {
      setError('Amount cannot be negative');
      return;
    }

    if (formData.debitOpening > 0 && formData.creditOpening > 0) {
      setError('Cannot have both debit and credit amounts');
      return;
    }

    if (formData.debitOpening === 0 && formData.creditOpening === 0) {
      setError('Please enter either debit or credit amount');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        openingDate: new Date(formData.openingDate).toISOString(),
        description: 'Account Opening Balance'
      };
      await onSubmit(dataToSubmit, keepOpen);

      if (keepOpen && !initialData) {
        setFormData({
          accountId: 0,
          openingDate: new Date().toISOString().split('T')[0],
          debitOpening: 0,
          creditOpening: 0,
          description: ''
        });
        setSelectedAccount(null);
        setSearchTerm('');
        debouncedSearch('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        accountId: 0,
        openingDate: new Date().toISOString().split('T')[0],
        debitOpening: 0,
        creditOpening: 0,
        description: ''
      });
      setSelectedAccount(null);
      setSearchTerm('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Opening Balance' : 'Add Opening Balance'}
      subtitle="Manage initial account balances"
      icon={<Coins size={18} />}
      iconClassName="bg-blue-50 text-blue-600"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by account code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={loading}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {!selectedAccount && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.accountId}
                    type="button"
                    onClick={() => {
                      setSelectedAccount(result);
                      setSearchTerm('');
                      setSearchResults([]);
                      setFormData(prev => ({ ...prev, accountId: result.accountId }));
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-0"
                  >
                    <div className="font-medium text-sm text-gray-900">{result.accountCode}</div>
                    <div className="text-xs text-gray-500">{result.name}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Account Display */}
            {selectedAccount && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center group hover:bg-blue-100/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-blue-900">{selectedAccount.accountCode}</p>
                  <p className="text-xs text-blue-700 font-medium">{selectedAccount.name}</p>
                  {selectedAccount.balance !== 0 && (
                    <p className="text-[10px] text-blue-600 mt-1 bg-white/50 inline-block px-1 rounded">
                      Current Balance: ₨ {selectedAccount.balance.toFixed(2)}
                    </p>
                  )}
                </div>
                {!initialData && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAccount(null);
                      setFormData(prev => ({ ...prev, accountId: 0 }));
                    }}
                    className="p-1.5 hover:bg-white rounded-full text-blue-400 hover:text-red-500 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Opening Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opening Date
          </label>
          <input
            type="date"
            value={formData.openingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, openingDate: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>

        {/* Amount Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Debit Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₨</span>
              <input
                type="number"
                value={formData.debitOpening}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  debitOpening: Number(e.target.value),
                  creditOpening: 0
                }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Credit Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₨</span>
              <input
                type="number"
                value={formData.creditOpening}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  creditOpening: Number(e.target.value),
                  debitOpening: 0
                }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Keep Modal Open Checkbox */}
        {!initialData && (
          <div className="flex items-center p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="keepOpen"
              checked={keepOpen}
              onChange={(e) => setKeepOpen(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="keepOpen" className="ml-2 text-sm text-gray-700 font-medium cursor-pointer">
              Keep modal open for multiple entries
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
            <div className="mt-0.5">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                {initialData ? 'Update Balance' : 'Add Balance'}
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}