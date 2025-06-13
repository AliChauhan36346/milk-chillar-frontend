'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, ChevronDown, ChevronRight, Edit, Eye } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';

type MainAccount = {
  main_account_id: number;
  main_account_code: string;
  name: string;
  financial_statement_component: string;
  sub_accounts: SubAccount[];
};

type SubAccount = {
  sub_account_id: number;
  sub_account_code: string;
  name: string;
  final_accounts: FinalAccount[];
};

type FinalAccount = {
  account_id: number;
  sub_account_code: string;
  name: string;
};

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<MainAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts/hierarchy');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccount = (accountId: number) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.main_account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.sub_accounts.some(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.sub_account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.final_accounts.some(final => 
          final.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          final.sub_account_code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    return matchesSearch;
  });

  const renderAccount = (account: MainAccount): React.ReactElement => {
    const isExpanded = expandedAccounts.has(account.main_account_id);

    return (
      <div key={account.main_account_id} className="border-b border-gray-200 last:border-b-0">
        {/* Main Account */}
        <div 
          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggleAccount(account.main_account_id)}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">Code: {account.main_account_code}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {account.financial_statement_component}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/Accounts/createAccount?mainId=${account.main_account_id}`);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Accounts */}
        {isExpanded && (
          <div className="ml-8">
            {account.sub_accounts.map(subAccount => (
              <div key={subAccount.sub_account_id} className="border-l-2 border-gray-200 pl-4">
                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{subAccount.name}</h4>
                      <p className="text-sm text-gray-500">Code: {subAccount.sub_account_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/Accounts/createAccount?subId=${subAccount.sub_account_id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Final Accounts */}
                  <div className="mt-2 ml-4">
                    {subAccount.final_accounts.map(finalAccount => (
                      <div key={finalAccount.account_id} className="py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm text-gray-900">{finalAccount.name}</h5>
                            <p className="text-sm text-gray-500">Code: {finalAccount.sub_account_code}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/Accounts/createAccount?id=${finalAccount.account_id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/Accounts/accountTransactions?id=${finalAccount.account_id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Chart of Accounts</h1>
            <button
              onClick={() => router.push('/Accounts/createAccount')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Account
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredAccounts.map(renderAccount)}
            </div>
          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
} 