'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowUpDown,
  Trash2,
  Building2,
  Users,
  Milk,
  Coins,
  TrendingUp,
  Receipt,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import ProtectedRoute from '@/components/ProtectedRoutes';
import {
  getChartOfAccounts,
  ChartAccount,
  updateMainAccount,
  deleteMainAccount,
  createSubAccount,
  updateSubAccount,
  deleteSubAccount,
  deleteAccount
} from '@/lib/api/accounts';
import AccountFormModal from '@/components/modals/AccountFormModal';
import GuidedAccountModal from '@/components/modals/GuidedAccountModal';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { useAuth } from '@/lib/auth/AuthContext';

// Helper for Pakistani Rupee currency display
const formatMoney = (amount?: number) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₨ 0.00';
  return '₨ ' + amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Plain English Category Metadata for Non-Accountants
const CATEGORY_META: Record<string, {
  label: string;
  plainDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    gradient: string;
  };
}> = {
  Assets: {
    label: 'Assets (What You Own)',
    plainDesc: 'Cash in hand, bank accounts, dodhi advances, milk stock, & buyer balances',
    icon: Building2,
    color: {
      bg: 'bg-emerald-50/50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      gradient: 'from-emerald-500 to-teal-600'
    }
  },
  CurrentAssets: {
    label: 'Assets (What You Own)',
    plainDesc: 'Cash, bank balances, milk stock, and customer receivables',
    icon: Building2,
    color: {
      bg: 'bg-emerald-50/50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      gradient: 'from-emerald-500 to-teal-600'
    }
  },
  Liabilities: {
    label: 'Liabilities (What You Owe)',
    plainDesc: 'Amounts payable to dairy farmers/dodhis, vendor bills, and bank loans',
    icon: Milk,
    color: {
      bg: 'bg-rose-50/50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      gradient: 'from-rose-500 to-red-600'
    }
  },
  CurrentLiabilities: {
    label: 'Liabilities (What You Owe)',
    plainDesc: 'Farmer milk credits, supplier payables, and unpaid plant bills',
    icon: Milk,
    color: {
      bg: 'bg-rose-50/50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      gradient: 'from-rose-500 to-red-600'
    }
  },
  Equity: {
    label: 'Equity (Capital & Profits)',
    plainDesc: "Owner's invested capital, retained profits, and owner withdrawals",
    icon: Coins,
    color: {
      bg: 'bg-purple-50/50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      gradient: 'from-purple-500 to-indigo-600'
    }
  },
  Revenue: {
    label: 'Revenue (Milk Sales & Income)',
    plainDesc: 'Earnings from fresh milk sales, chilling fees, and dairy products',
    icon: TrendingUp,
    color: {
      bg: 'bg-blue-50/50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      gradient: 'from-blue-500 to-cyan-600'
    }
  },
  CostOfSales: {
    label: 'Direct Milk Costs (Procurement)',
    plainDesc: 'Direct milk procurement payments to dodhis & collection centers',
    icon: Receipt,
    color: {
      bg: 'bg-amber-50/50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      gradient: 'from-amber-500 to-orange-600'
    }
  },
  OperatingExpenses: {
    label: 'Operating Expenses (Plant Costs)',
    plainDesc: 'Electricity for chilling, generator fuel, salaries, testing lab chemicals',
    icon: Receipt,
    color: {
      bg: 'bg-orange-50/50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      gradient: 'from-orange-500 to-amber-600'
    }
  },
  Expenses: {
    label: 'Operating Expenses (Plant Costs)',
    plainDesc: 'Electricity bills, diesel fuel, staff wages, and chillar maintenance',
    icon: Receipt,
    color: {
      bg: 'bg-orange-50/50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      gradient: 'from-orange-500 to-amber-600'
    }
  }
};

const DEFAULT_META = {
  label: 'Account Group',
  plainDesc: 'Financial category for recording business transactions',
  icon: Layers,
  color: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    gradient: 'from-slate-500 to-slate-600'
  }
};

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'code'>('code');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  // Guided Modal State
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState(false);

  // Standard Form Modal State
  const [accountModalConfig, setAccountModalConfig] = useState<{
    isOpen: boolean;
    type: 'main' | 'sub';
    isUpdate: boolean;
    initialData?: any;
    entityId?: number;
    parentId?: number;
  }>({
    isOpen: false,
    type: 'main',
    isUpdate: false
  });

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    isDestructive: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      if (!user?.tenantId) return;
      const data = await getChartOfAccounts(user.tenantId);
      setAccounts(data);
      // Auto expand all main accounts initially for convenience
      const initialExpanded = new Set(data.map(a => a.mainAccountId));
      setExpandedAccounts(initialExpanded);
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccount = (accountId: number) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(accounts.map(acc => acc.mainAccountId));
    setExpandedAccounts(allIds);
  };

  const collapseAll = () => {
    setExpandedAccounts(new Set());
  };

  // Category Rollup Totals for Top Cards
  const categoryPillars = useMemo(() => {
    const pillars = [
      {
        key: 'Assets',
        title: 'Assets',
        subtitle: 'Cash, Banks, Milk Stock, Debtors',
        icon: Building2,
        color: 'emerald',
        filterKey: 'Assets',
        total: 0
      },
      {
        key: 'Liabilities',
        title: 'Liabilities',
        subtitle: 'Dodhi Balances, Unpaid Bills, Loans',
        icon: Milk,
        color: 'rose',
        filterKey: 'Liabilities',
        total: 0
      },
      {
        key: 'Equity',
        title: 'Equity',
        subtitle: 'Owner Capital & Accumulated Profit',
        icon: Coins,
        color: 'purple',
        filterKey: 'Equity',
        total: 0
      },
      {
        key: 'Revenue',
        title: 'Revenue',
        subtitle: 'Milk Sales & Operational Income',
        icon: TrendingUp,
        color: 'blue',
        filterKey: 'Revenue',
        total: 0
      },
      {
        key: 'Expenses',
        title: 'Expenses',
        subtitle: 'Chillar Power, Diesel, Lab, Wages',
        icon: Receipt,
        color: 'amber',
        filterKey: 'Expenses',
        total: 0
      }
    ];

    accounts.forEach(m => {
      const comp = m.financialStatementComponent || '';
      const code = m.mainAccountCode || '';
      const bal = m.balance || 0;

      if (code.startsWith('1') || comp.includes('Asset')) {
        pillars[0].total += bal;
      } else if (code.startsWith('2') || comp.includes('Liabilit')) {
        pillars[1].total += bal;
      } else if (code.startsWith('3') || comp.includes('Equity')) {
        pillars[2].total += bal;
      } else if (code.startsWith('4') || comp.includes('Revenue')) {
        pillars[3].total += bal;
      } else if (code.startsWith('5') || code.startsWith('6') || code.startsWith('7') || comp.includes('Expense') || comp.includes('CostOfSales')) {
        pillars[4].total += bal;
      }
    });

    return pillars;
  }, [accounts]);

  // Filtering & Sorting
  const filteredAccounts = useMemo(() => {
    return accounts
      .map(main => {
        // Filter subaccounts
        const matchingSubAccounts = main.subAccounts
          ?.map(sub => {
            // Filter final accounts
            const matchingFinals = sub.accounts?.filter(acc => {
              if (hideZeroBalances && (!acc.balance || acc.balance === 0)) {
                return false;
              }
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                acc.name.toLowerCase().includes(q) ||
                acc.accountCode.toLowerCase().includes(q) ||
                acc.fullCode.toLowerCase().includes(q)
              );
            }) || [];

            // If query matches sub-account itself, keep all or filtered finals
            const subMatchesQuery =
              !searchQuery.trim() ||
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sub.subAccountCode.toLowerCase().includes(searchQuery.toLowerCase());

            const finals = subMatchesQuery
              ? (hideZeroBalances ? (sub.accounts?.filter(a => a.balance && a.balance > 0) || []) : sub.accounts)
              : matchingFinals;

            if (finals.length === 0 && !subMatchesQuery) return null;

            return {
              ...sub,
              accounts: finals
            };
          })
          .filter((sub): sub is NonNullable<typeof sub> => sub !== null) || [];

        // Check if main account itself matches
        const mainMatchesQuery =
          !searchQuery.trim() ||
          main.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          main.mainAccountCode.toLowerCase().includes(searchQuery.toLowerCase());

        // Category Filter
        let categoryMatches = true;
        if (filterBy !== 'all') {
          const comp = main.financialStatementComponent || '';
          const code = main.mainAccountCode || '';
          if (filterBy === 'Assets') {
            categoryMatches = code.startsWith('1') || comp.includes('Asset');
          } else if (filterBy === 'Liabilities') {
            categoryMatches = code.startsWith('2') || comp.includes('Liabilit');
          } else if (filterBy === 'Equity') {
            categoryMatches = code.startsWith('3') || comp.includes('Equity');
          } else if (filterBy === 'Revenue') {
            categoryMatches = code.startsWith('4') || comp.includes('Revenue');
          } else if (filterBy === 'Expenses') {
            categoryMatches = code.startsWith('5') || code.startsWith('6') || code.startsWith('7') || comp.includes('Expense') || comp.includes('CostOfSales');
          }
        }

        if (!categoryMatches) return null;
        if (matchingSubAccounts.length === 0 && !mainMatchesQuery) return null;

        return {
          ...main,
          subAccounts: matchingSubAccounts
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return a.mainAccountCode.localeCompare(b.mainAccountCode);
      });
  }, [accounts, searchQuery, filterBy, sortBy, hideZeroBalances]);

  // Total Account counts
  const totalAccountCount = useMemo(() => {
    return accounts.reduce(
      (sum, acc) =>
        sum +
        acc.subAccounts.reduce(
          (subSum, sub) => subSum + (sub.accounts?.length || 0),
          0
        ),
      0
    );
  }, [accounts]);

  // Handlers
  const handleEditMainAccount = (account: ChartAccount) => {
    setAccountModalConfig({
      isOpen: true,
      type: 'main',
      isUpdate: true,
      entityId: account.mainAccountId,
      initialData: {
        name: account.name,
        financial_statement_component: account.financialStatementComponent,
        main_account_code: account.mainAccountCode
      }
    });
  };

  const handleEditSubAccount = (subAccount: any, mainAccount: ChartAccount) => {
    setAccountModalConfig({
      isOpen: true,
      type: 'sub',
      isUpdate: true,
      entityId: subAccount.subAccountId,
      initialData: {
        name: subAccount.name,
        main_account_code: mainAccount.mainAccountCode
      }
    });
  };

  const handleAddSubAccountToMain = (mainAccount: ChartAccount) => {
    setAccountModalConfig({
      isOpen: true,
      type: 'sub',
      isUpdate: false,
      parentId: mainAccount.mainAccountId,
      initialData: {
        main_account_code: mainAccount.mainAccountCode
      }
    });
  };

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    isDestructive = false
  ) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isDestructive
    });
  };

  const handleDeleteMainAccount = (mainAccountId: number) => {
    confirmAction(
      'Delete Account Category',
      'Are you sure you want to delete this category? This cannot be undone and will fail if any sub-accounts exist.',
      async () => {
        try {
          await deleteMainAccount(mainAccountId);
          await fetchAccounts();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting main account:', error);
          alert('Failed to delete category. Ensure all sub-accounts are deleted first.');
        }
      },
      true
    );
  };

  const handleDeleteSubAccount = (subAccountId: number) => {
    confirmAction(
      'Delete Sub-Group',
      'Are you sure you want to delete this sub-account group? This will fail if there are any active accounts under it.',
      async () => {
        try {
          await deleteSubAccount(subAccountId);
          await fetchAccounts();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting sub account:', error);
          alert('Failed to delete sub-group. Ensure all accounts inside it are deleted first.');
        }
      },
      true
    );
  };

  const handleDeleteAccount = (accountId: number, accountName: string) => {
    confirmAction(
      `Delete Account "${accountName}"`,
      'Are you sure you want to delete this account? If this account has ledger transactions or milk receipts recorded, deletion will be blocked by accounting integrity.',
      async () => {
        try {
          await deleteAccount(accountId);
          await fetchAccounts();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('Cannot delete this account because it has recorded transactions.');
        }
      },
      true
    );
  };

  const handleAccountModalSubmit = async (data: any) => {
    try {
      if (!user?.tenantId) return;
      const { type, isUpdate, entityId, parentId } = accountModalConfig;

      if (type === 'main') {
        if (isUpdate && entityId) {
          await updateMainAccount(entityId, {
            tenantId: user.tenantId,
            name: data.name,
            financialStatementComponent: data.financial_statement_component
          });
        }
      } else if (type === 'sub') {
        if (isUpdate && entityId) {
          const parent = accounts.find(a => a.mainAccountCode === data.main_account_code);
          if (parent) {
            await updateSubAccount(entityId, {
              tenantId: user.tenantId,
              mainAccountId: parent.mainAccountId,
              name: data.name
            });
          }
        } else if (!isUpdate && parentId) {
          await createSubAccount({
            tenantId: user.tenantId,
            mainAccountId: parentId,
            name: data.name
          });
        }
      }

      setAccountModalConfig(prev => ({ ...prev, isOpen: false }));
      await fetchAccounts();
    } catch (error) {
      console.error('Error saving account modal:', error);
      alert('Failed to save account changes.');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Loading Chart of Accounts & Balances...</p>
              <p className="text-xs text-slate-400 mt-1">Calculating real-time financial rollups</p>
            </div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="min-h-screen bg-slate-50/70 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Chart of Accounts
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Manage your dairy plant accounts, banks, customers, dodhis, and operational expenses
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={collapseAll}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Collapse
                </button>
                <button
                  onClick={expandAll}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Expand All
                </button>

                {/* Primary Guided New Account Button */}
                <button
                  onClick={() => setIsGuidedModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ New Account</span>
                </button>
              </div>
            </div>

            {/* The 5 Core Financial Pillars (Clickable Category Tabs) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {categoryPillars.map(pillar => {
                const Icon = pillar.icon;
                const isSelected = filterBy === pillar.filterKey;

                return (
                  <div
                    key={pillar.key}
                    onClick={() => setFilterBy(prev => (prev === pillar.filterKey ? 'all' : pillar.filterKey))}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 select-none ${
                      isSelected
                        ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                        {pillar.title}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 font-mono">
                      {formatMoney(pillar.total)}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                      {pillar.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Controls & Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search accounts by name or code (e.g. Meezan, Dodhi, 110)..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filters Strip */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Filter */}
                  <select
                    value={filterBy}
                    onChange={e => setFilterBy(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Assets">Assets (Own)</option>
                    <option value="Liabilities">Liabilities (Owe)</option>
                    <option value="Equity">Equity (Capital)</option>
                    <option value="Revenue">Revenue (Income)</option>
                    <option value="Expenses">Expenses (Plant Costs)</option>
                  </select>

                  {/* Sort Order */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'name' | 'code')}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="code">Sort: Account Code</option>
                    <option value="name">Sort: Name (A-Z)</option>
                  </select>

                  {/* Non-Zero Balances Toggle */}
                  <button
                    type="button"
                    onClick={() => setHideZeroBalances(!hideZeroBalances)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      hideZeroBalances
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Non-Zero Only</span>
                  </button>
                </div>
              </div>

              {/* Toolbar Metrics Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Showing {filteredAccounts.length} categories ({totalAccountCount} total accounts registered)
                </span>
                {filterBy !== 'all' && (
                  <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => setFilterBy('all')}>
                    Filtered by: {filterBy} (Reset)
                  </span>
                )}
              </div>
            </div>

            {/* Main Accounts Tree */}
            <div className="space-y-4">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => {
                  const isExpanded = expandedAccounts.has(account.mainAccountId);
                  const meta = CATEGORY_META[account.financialStatementComponent] || CATEGORY_META[account.name] || DEFAULT_META;
                  const Icon = meta.icon;
                  const totalSubCount = account.subAccounts?.length || 0;
                  const totalFinalCount = account.subAccounts?.reduce(
                    (s, sub) => s + (sub.accounts?.length || 0),
                    0
                  ) || 0;

                  return (
                    <div
                      key={account.mainAccountId}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all"
                    >
                      {/* Main Category Header Banner */}
                      <div
                        onClick={() => toggleAccount(account.mainAccountId)}
                        className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 border-b border-transparent transition-colors"
                      >
                        <div className="flex items-start md:items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAccount(account.mainAccountId);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 mt-0.5 md:mt-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-700" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-700" />
                            )}
                          </button>

                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color.bg} ${meta.color.text} border ${meta.color.border}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                {account.name}
                              </h2>
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {account.mainAccountCode}
                              </span>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.color.badge}`}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {meta.plainDesc}
                            </p>
                          </div>
                        </div>

                        {/* Right Summary & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pl-11 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                          {/* Live Category Balance Badge */}
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-black font-mono text-slate-900">
                              {formatMoney(account.balance)}
                              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                account.balanceType === 'Dr'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {account.balanceType || 'Dr'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {totalSubCount} sub-groups · {totalFinalCount} accounts
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleAddSubAccountToMain(account)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Add Sub-Group under this Category"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Add Sub-Group</span>
                            </button>
                            <button
                              onClick={() => handleEditMainAccount(account)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Category Name"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMainAccount(account.mainAccountId)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Accounts Container */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100">
                          {account.subAccounts && account.subAccounts.length > 0 ? (
                            account.subAccounts.map(subAccount => (
                              <div key={subAccount.subAccountId} className="p-4 sm:pl-10">
                                {/* Sub Account Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                                      {subAccount.name}
                                    </h3>
                                    <span className="font-mono text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                      {subAccount.subAccountCode}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Sub-Account Total Balance */}
                                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                                      {formatMoney(subAccount.balance)} {subAccount.balanceType || 'Dr'}
                                    </span>

                                    <button
                                      onClick={() => {
                                        router.push(`/Accounts/createAccount?mainId=${account.mainAccountId}&subId=${subAccount.subAccountId}`);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs flex items-center gap-1 font-semibold"
                                      title="Add Account in this Sub-Group"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span className="hidden sm:inline">Add</span>
                                    </button>
                                    <button
                                      onClick={() => handleEditSubAccount(subAccount, account)}
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                                      title="Edit Sub-Group"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubAccount(subAccount.subAccountId)}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Delete Sub-Group"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Final Accounts Grid */}
                                {subAccount.accounts && subAccount.accounts.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:ml-6">
                                    {subAccount.accounts.map(finalAccount => (
                                      <div
                                        key={finalAccount.accountId}
                                        className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                              {finalAccount.name}
                                            </h4>
                                            <span className="font-mono text-[10px] text-slate-400">
                                              {finalAccount.fullCode || finalAccount.accountCode}
                                            </span>
                                          </div>

                                          {/* Live Account Balance */}
                                          <div className="text-right flex-shrink-0">
                                            <div className="text-xs font-mono font-bold text-slate-900">
                                              {formatMoney(finalAccount.balance)}
                                            </div>
                                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                                              finalAccount.balanceType === 'Dr'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                              {finalAccount.balanceType || 'Dr'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action Bar for this Account */}
                                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                          {/* 1-Click Direct Ledger Drill-Down (Fixes 404 Bug) */}
                                          <button
                                            type="button"
                                            onClick={() => router.push(`/Accounts/accountLedger?accountId=${finalAccount.accountId}`)}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                            title="View Account Running Ledger"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>View Ledger</span>
                                          </button>

                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => router.push(`/Accounts/createAccount?id=${finalAccount.accountId}`)}
                                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                                              title="Edit Account Details"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteAccount(finalAccount.accountId, finalAccount.name)}
                                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                              title="Delete Account"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-white/70 border border-dashed border-slate-200 rounded-xl text-center sm:ml-6">
                                    <p className="text-xs text-slate-400">
                                      No accounts created in this sub-group yet.
                                    </p>
                                    <button
                                      onClick={() => router.push(`/Accounts/createAccount?mainId=${account.mainAccountId}&subId=${subAccount.subAccountId}`)}
                                      className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block"
                                    >
                                      + Add Account
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-slate-400">
                              <p className="text-xs">No sub-groups in this category.</p>
                              <button
                                onClick={() => handleAddSubAccountToMain(account)}
                                className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block"
                              >
                                + Add First Sub-Group
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No matching accounts found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery || filterBy !== 'all' || hideZeroBalances
                      ? 'Try clearing your search query or adjusting your filters.'
                      : 'You do not have any accounts in your Chart of Accounts yet.'}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {(searchQuery || filterBy !== 'all' || hideZeroBalances) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterBy('all');
                          setHideZeroBalances(false);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Reset Filters
                      </button>
                    )}
                    <button
                      onClick={() => setIsGuidedModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Add Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Guided New Account Modal (Preset-Driven) */}
            {user?.tenantId && (
              <GuidedAccountModal
                isOpen={isGuidedModalOpen}
                onClose={() => setIsGuidedModalOpen(false)}
                onSuccess={fetchAccounts}
                accounts={accounts}
                tenantId={user.tenantId}
              />
            )}

            {/* Standard Category & SubAccount Form Modal */}
            <AccountFormModal
              isOpen={accountModalConfig.isOpen}
              onClose={() => setAccountModalConfig(prev => ({ ...prev, isOpen: false }))}
              onSubmit={handleAccountModalSubmit}
              type={accountModalConfig.type}
              isUpdate={accountModalConfig.isUpdate}
              initialData={accountModalConfig.initialData}
              mainAccounts={accounts.map(acc => ({
                main_account_code: acc.mainAccountCode,
                name: acc.name
              }))}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
              isOpen={confirmationModal.isOpen}
              onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
              onConfirm={confirmationModal.onConfirm}
              title={confirmationModal.title}
              message={confirmationModal.message}
              isDestructive={confirmationModal.isDestructive}
            />

          </div>
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
}