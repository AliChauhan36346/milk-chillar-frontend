'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { OpeningBalance, OpeningBalanceCreateUpdate } from '@/lib/api/openingBalances';
import { searchAccounts, SearchAccountResult } from '@/lib/api/accounts';
import debounce from 'lodash/debounce';

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

  // Removed auto-search effect

  // Using lodash debounce for search
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
    // Cleanup debounced function on unmount
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
      // Set selected account if we have initial data
      if (initialData.accountCode && initialData.accountName) {
        setSelectedAccount({
          accountId: initialData.accountId,
          accountCode: initialData.accountCode,
          name: initialData.accountName,
          balance: 0 // We don't have this in the initial data
        });
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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
      
      // If keepOpen is true and it's a new entry, clear the form
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
        // Auto trigger search
        debouncedSearch('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal is closed
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {initialData ? 'Edit Opening Balance' : 'Add Opening Balance'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
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
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="font-medium">{result.accountCode}</div>
                      <div className="text-sm text-gray-600">{result.name}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Selected Account Display */}
              {selectedAccount && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{selectedAccount.accountCode}</p>
                    <p className="text-sm text-blue-700">{selectedAccount.name}</p>
                    {selectedAccount.balance !== 0 && (
                      <p className="text-xs text-blue-600 mt-1">
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
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <X className="w-4 h-4 text-blue-600" />
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
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Amount Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debit Amount
              </label>
              <input
                type="number"
                value={formData.debitOpening}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  debitOpening: Number(e.target.value),
                  creditOpening: 0 // Reset credit when debit is entered
                }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Amount
              </label>
              <input
                type="number"
                value={formData.creditOpening}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  creditOpening: Number(e.target.value),
                  debitOpening: 0 // Reset debit when credit is entered
                }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Keep Modal Open Checkbox */}
          {!initialData && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="keepOpen"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="keepOpen" className="ml-2 text-sm text-gray-700">
                Keep modal open for multiple entries
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}