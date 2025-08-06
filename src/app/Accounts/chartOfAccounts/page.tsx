'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Eye, 
  Filter,
  FolderOpen,
  Folder,
  FileText,
  ArrowUpDown
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getChartOfAccounts, ChartAccount } from '@/lib/api/accounts';

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const tenantId = 3; // TODO: Replace with actual tenant ID
      const data = await getChartOfAccounts(tenantId);
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

  const expandAll = () => {
    const allIds = new Set(accounts.map(acc => acc.mainAccountId));
    setExpandedAccounts(allIds);
  };

  const collapseAll = () => {
    setExpandedAccounts(new Set());
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.mainAccountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.subAccounts.some(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.subAccountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.accounts.some(final => 
          final.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          final.accountCode.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

    const matchesFilter = filterBy === 'all' || account.financialStatementComponent === filterBy;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.mainAccountCode.localeCompare(b.mainAccountCode);
    }
  });

  const getFinancialStatementColor = (component: string) => {
    const colors: { [key: string]: string } = {
      'Assets': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Liabilities': 'bg-red-50 text-red-700 border-red-200',
      'Equity': 'bg-purple-50 text-purple-700 border-purple-200',
      'Revenue': 'bg-blue-50 text-blue-700 border-blue-200',
      'Expenses': 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[component] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const renderAccount = (account: ChartAccount): React.ReactElement => {
    const isExpanded = expandedAccounts.has(account.mainAccountId);
    const totalSubAccounts = account.subAccounts.length;
    const totalFinalAccounts = account.subAccounts.reduce((sum, sub) => sum + sub.accounts.length, 0);

    return (
      <div key={account.mainAccountId} className="bg-white border border-slate-200 rounded-lg mb-2 overflow-hidden hover:border-slate-300 transition-colors">
        {/* Main Account Header */}
        <div 
          className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer"
          onClick={() => toggleAccount(account.mainAccountId)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
            
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-slate-800 truncate">{account.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getFinancialStatementColor(account.financialStatementComponent)}`}>
                  {account.financialStatementComponent}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {account.mainAccountCode}
                </span>
                <span>{totalSubAccounts} subs</span>
                <span>{totalFinalAccounts} accounts</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/Accounts/createAccount?mainId=${account.mainAccountId}`);
            }}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
            title="Add Sub Account"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Accounts */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50/30">
            {account.subAccounts.map(subAccount => (
              <div key={subAccount.subAccountId} className="border-b border-slate-100 last:border-b-0">
                <div className="px-4 py-2.5 pl-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-800 truncate">{subAccount.name}</h4>
                          <span className="text-xs text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border">
                            {subAccount.subAccountCode}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border">
                        {subAccount.accounts.length}
                      </span>
                      <button
                        onClick={() => router.push(`/Accounts/createAccount?mainId=${account.mainAccountId}&subId=${subAccount.subAccountId}`)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Add Final Account"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Final Accounts - Compact Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 ml-5">
                    {subAccount.accounts.map(finalAccount => (
                      <div key={finalAccount.accountId} className="bg-white border border-slate-200 rounded p-2.5 hover:border-slate-300 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-slate-800 truncate">{finalAccount.name}</h5>
                            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {finalAccount.accountCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                // Find the main account
                                const mainAccount = accounts.find(main => 
                                  main.subAccounts.some(sub => 
                                    sub.accounts.some(acc => acc.accountId === finalAccount.accountId)
                                  )
                                );
                                // Find the sub account
                                const subAccount = mainAccount?.subAccounts.find(sub => 
                                  sub.accounts.some(acc => acc.accountId === finalAccount.accountId)
                                );
                                
                                const accountData = {
                                  accountId: finalAccount.accountId,
                                  name: finalAccount.name,
                                  accountCode: finalAccount.accountCode,
                                  mainAccount: {
                                    mainAccountId: mainAccount?.mainAccountId,
                                    name: mainAccount?.name,
                                    mainAccountCode: mainAccount?.mainAccountCode,
                                    financialStatementComponent: mainAccount?.financialStatementComponent
                                  },
                                  subAccount: {
                                    subAccountId: subAccount?.subAccountId,
                                    name: subAccount?.name,
                                    subAccountCode: subAccount?.subAccountCode
                                  }
                                };
                                
                                router.push(`/Accounts/createAccount?id=${finalAccount.accountId}&data=${encodeURIComponent(JSON.stringify(accountData))}`);
                              }}
                              className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit Account"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => router.push(`/Accounts/accountTransactions?id=${finalAccount.accountId}`)}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="View Transactions"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-slate-600">Loading Chart of Accounts...</p>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto p-4">
            {/* Compact Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Chart of Accounts</h1>
                <p className="text-sm text-slate-600">Manage your account hierarchy</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded border border-slate-200 transition-colors"
                >
                  Collapse All
                </button>
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded border border-slate-200 transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={() => router.push('/Accounts/createAccount')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Account
                </button>
              </div>
            </div>

            {/* Compact Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 pl-9 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 pr-8 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer text-sm min-w-[140px]"
                  >
                    <option value="all">All Categories</option>
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expenses">Expenses</option>
                  </select>
                  <Filter className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'code')}
                    className="px-3 py-2 pr-8 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer text-sm min-w-[120px]"
                  >
                    <option value="name">By Name</option>
                    <option value="code">By Code</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Compact Results Summary */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span>{filteredAccounts.length} of {accounts.length} categories</span>
                <span>{accounts.reduce((sum, acc) => sum + acc.subAccounts.reduce((subSum, sub) => subSum + sub.accounts.length, 0), 0)} total accounts</span>
              </div>
            </div>

            {/* Accounts List */}
            <div>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(renderAccount)
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-800 mb-1">No accounts found</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {searchQuery || filterBy !== 'all' 
                      ? "Try adjusting your search or filter criteria."
                      : "Start by creating your first account category."
                    }
                  </p>
                  <button
                    onClick={() => router.push('/Accounts/createAccount')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mx-auto text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Account
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