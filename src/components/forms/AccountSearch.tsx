import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';

export interface AccountSearchProps {
  value: any;
  onChange: (account: any) => void;
  error?: string;
  placeholder?: string;
  filter?: {
    codePrefix?: string;
    type?: string;
  };
  className?: string;
}

export default function AccountSearch({ 
  value, 
  onChange, 
  error, 
  placeholder,
  filter,
  className = ''
}: AccountSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchAccountResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setLoading(true);
        try {
          let results = await accountsApi.searchAccounts(searchTerm.trim());
          
          // Apply filters if provided
          if (filter) {
            if (filter.codePrefix) {
              const prefix = filter.codePrefix;
              results = results.filter(acc => acc.accountCode?.startsWith(prefix));
            }
            if (filter.type) {
              results = results.filter(acc => acc.type === filter.type);
            }
          }
          
          setSearchResults(results);
        } catch (error) {
          console.error('Failed to search accounts:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filter]);

  // Load initial accounts when dropdown opens
  useEffect(() => {
    if (isOpen && searchTerm === '' && searchResults.length === 0) {
      const loadInitialAccounts = async () => {
        setLoading(true);
        try {
          let results = await accountsApi.searchAccounts('');
          
          // Apply filters if provided
          if (filter) {
            if (filter.codePrefix) {
              const prefix = filter.codePrefix;
              results = results.filter(acc => acc.accountCode?.startsWith(prefix));
            }
            if (filter.type) {
              results = results.filter(acc => acc.type === filter.type);
            }
          }
          
          setSearchResults(results.slice(0, 50));
        } catch (error) {
          console.error('Failed to load initial accounts:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      };
      loadInitialAccounts();
    }
  }, [isOpen, filter]);

  const selectedAccount = value && value.accountId ? {
    accountId: value.accountId,
    accountCode: value.accountCode,
    name: value.name || value.accountName
  } : null;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full p-2 text-sm border rounded cursor-pointer flex items-center justify-between ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${isOpen ? 'ring-1 ring-blue-500 border-blue-500' : ''} ${className}`}
        role="button"
        tabIndex={0}
      >
        {selectedAccount ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">
              <span className="font-medium">{selectedAccount.accountCode}</span> - {selectedAccount.name}
            </span>
            <X 
              className="w-4 h-4 text-gray-400 hover:text-gray-600" 
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          </div>
        ) : (
          <span className="text-gray-500 text-sm">{placeholder || 'Select account...'}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Search accounts..."
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((account) => (
                <div
                  key={account.accountId}
                  onClick={() => {
                    onChange({
                      accountId: account.accountId,
                      accountCode: account.accountCode,
                      accountName: account.name,
                      name: account.name
                    });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">{account.accountCode}</span>
                    <span className="text-gray-900 ml-2">{account.name}</span>
                    {account.balance !== undefined && (
                      <span className="text-gray-500 ml-2 text-xs">
                        (Balance: ₨{account.balance.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? 'No accounts found' : 'Start typing to search accounts'}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}