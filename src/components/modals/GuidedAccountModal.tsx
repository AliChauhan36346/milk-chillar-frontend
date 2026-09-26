'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Users,
  Milk,
  Zap,
  FlaskConical,
  Briefcase,
  Truck,
  Check,
  AlertCircle,
  FolderTree
} from 'lucide-react';
import { ChartAccount, createAccount } from '@/lib/api/accounts';

interface GuidedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: ChartAccount[];
  tenantId: number;
}

interface PresetOption {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  example: string;
  mainCategoryName: string;
  mainCodePrefix: string; // e.g. "1" for Assets, "2" for Liabilities, "6" for Expenses
  subKeywords: string[];
}

const PRESETS: PresetOption[] = [
  {
    id: 'bank_cash',
    icon: Building2,
    title: 'Bank / Cash Wallet',
    subtitle: 'Current accounts, business bank accounts, or JazzCash / EasyPaisa',
    example: 'e.g. Meezan Bank Plant A/C, Cash In Hand Drawer',
    mainCategoryName: 'Assets',
    mainCodePrefix: '1',
    subKeywords: ['bank', 'cash']
  },
  {
    id: 'customer_buyer',
    icon: Users,
    title: 'Milk Customer / Buyer',
    subtitle: 'Dairies, processing companies, or retailers who purchase milk',
    example: 'e.g. Engro Foods, Local Sweet Bakers, Chungi Milk Shop',
    mainCategoryName: 'Assets',
    mainCodePrefix: '1',
    subKeywords: ['debtor', 'receivable', 'customer', 'buyer', 'trade']
  },
  {
    id: 'supplier_farmer',
    icon: Milk,
    title: 'Milk Supplier / Farmer / Dodhi',
    subtitle: 'Farmers or village milk collectors who supply raw milk',
    example: 'e.g. Aslam Dodhi (Kot Radha), Haji Bashir Dairy Farm',
    mainCategoryName: 'Liabilities',
    mainCodePrefix: '2',
    subKeywords: ['creditor', 'payable', 'supplier', 'farmer', 'dodhi', 'trade']
  },
  {
    id: 'utilities_power',
    icon: Zap,
    title: 'Electricity & Chillar Power',
    subtitle: 'WAPDA electricity, diesel fuel for generators, solar maintenance',
    example: 'e.g. Feeder 2 Chillar Meter, Generator Diesel Expense',
    mainCategoryName: 'Expenses',
    mainCodePrefix: '6',
    subKeywords: ['utilit', 'electric', 'power', 'fuel', 'operating']
  },
  {
    id: 'lab_chemicals',
    icon: FlaskConical,
    title: 'Lab & Testing Quality',
    subtitle: 'Lactometer tests, Gerber acid, testing kits, quality assurance',
    example: 'e.g. Gerber Testing Acid, Milk Sampling Bottles',
    mainCategoryName: 'Expenses',
    mainCodePrefix: '6',
    subKeywords: ['lab', 'chemical', 'quality', 'test', 'operating']
  },
  {
    id: 'salaries_payroll',
    icon: Briefcase,
    title: 'Salaries & Wages',
    subtitle: 'Chillar plant operators, drivers, lab technicians, and helpers',
    example: 'e.g. Chillar Plant Night Operator, Driver Allowance',
    mainCategoryName: 'Expenses',
    mainCodePrefix: '6',
    subKeywords: ['salar', 'wage', 'payroll', 'staff', 'employee']
  },
  {
    id: 'machinery_fixed',
    icon: Truck,
    title: 'Plant Machinery & Equipment',
    subtitle: 'Chillar cooling tanks, diesel gensets, milk pumps, vehicles',
    example: 'e.g. 5000L Chillar Tank No 2, 50KVA Perkins Generator',
    mainCategoryName: 'Assets',
    mainCodePrefix: '1',
    subKeywords: ['fixed', 'asset', 'machin', 'equipment', 'vehicle']
  }
];

export default function GuidedAccountModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  tenantId
}: GuidedAccountModalProps) {
  const [mode, setMode] = useState<'guided' | 'advanced'>('guided');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bank_cash');
  const [accountName, setAccountName] = useState('');
  const [selectedSubAccountId, setSelectedSubAccountId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced Mode State
  const [advMainAccountId, setAdvMainAccountId] = useState<number | undefined>();
  const [advSubAccountId, setAdvSubAccountId] = useState<number | undefined>();

  // Available SubAccounts flattened with their Main category
  const allSubAccounts = useMemo(() => {
    const list: {
      subAccountId: number;
      subAccountCode: string;
      name: string;
      mainAccountId: number;
      mainAccountCode: string;
      mainName: string;
    }[] = [];

    accounts.forEach(m => {
      m.subAccounts?.forEach(sa => {
        list.push({
          subAccountId: sa.subAccountId,
          subAccountCode: sa.subAccountCode,
          name: sa.name,
          mainAccountId: m.mainAccountId,
          mainAccountCode: m.mainAccountCode,
          mainName: m.name
        });
      });
    });

    return list;
  }, [accounts]);

  // Determine the best-fit subaccounts for the selected preset
  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId);

  const matchedSubAccounts = useMemo(() => {
    if (!selectedPreset) return [];

    // Filter subaccounts belonging to the preset's main code prefix
    const categorySubs = allSubAccounts.filter(sa =>
      sa.mainAccountCode.startsWith(selectedPreset.mainCodePrefix) ||
      sa.mainName.toLowerCase().includes(selectedPreset.mainCategoryName.toLowerCase())
    );

    if (categorySubs.length === 0) {
      return allSubAccounts;
    }

    // Try keyword matching
    const keywordMatches = categorySubs.filter(sa =>
      selectedPreset.subKeywords.some(kw => sa.name.toLowerCase().includes(kw))
    );

    return keywordMatches.length > 0 ? keywordMatches : categorySubs;
  }, [selectedPreset, allSubAccounts]);

  // Auto-select the first matched subaccount when preset changes
  useEffect(() => {
    if (matchedSubAccounts.length > 0) {
      setSelectedSubAccountId(matchedSubAccounts[0].subAccountId);
    } else {
      setSelectedSubAccountId(undefined);
    }
  }, [matchedSubAccounts]);

  // Set initial advanced mode selections
  useEffect(() => {
    if (accounts.length > 0 && !advMainAccountId) {
      setAdvMainAccountId(accounts[0].mainAccountId);
    }
  }, [accounts, advMainAccountId]);

  const advAvailableSubs = useMemo(() => {
    if (!advMainAccountId) return [];
    const main = accounts.find(m => m.mainAccountId === advMainAccountId);
    return main?.subAccounts || [];
  }, [accounts, advMainAccountId]);

  useEffect(() => {
    if (advAvailableSubs.length > 0) {
      setAdvSubAccountId(advAvailableSubs[0].subAccountId);
    } else {
      setAdvSubAccountId(undefined);
    }
  }, [advAvailableSubs]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('Please provide a name for this account.');
      return;
    }

    const targetSubId = mode === 'guided' ? selectedSubAccountId : advSubAccountId;

    if (!targetSubId) {
      setError('A sub-account category is required. Please check your category selection.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createAccount({
        tenantId,
        subAccountId: targetSubId,
        name: accountName.trim()
      });

      // Reset & close
      setAccountName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add New Account</h2>
              <p className="text-xs text-slate-500">
                Easily organize your dairy plant finances and transactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'guided'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Guided Presets (Simple)
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'advanced'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Advanced (Accountant)
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {mode === 'guided' ? 'Recommended for Dairy Owners' : 'Custom Sub-Account selection'}
          </span>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'guided' ? (
            <>
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  1. What kind of account are you creating?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {PRESETS.map(preset => {
                    const Icon = preset.icon;
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {preset.title}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {preset.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Category assignment */}
              {selectedPreset && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                      Assigned Accounting Group:
                    </span>
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      Category: {selectedPreset.mainCategoryName}
                    </span>
                  </div>

                  {matchedSubAccounts.length > 1 ? (
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Specific Sub-Folder:
                      </label>
                      <select
                        value={selectedSubAccountId}
                        onChange={e => setSelectedSubAccountId(parseInt(e.target.value))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {matchedSubAccounts.map(sa => (
                          <option key={sa.subAccountId} value={sa.subAccountId}>
                            {sa.name} ({sa.subAccountCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : matchedSubAccounts.length === 1 ? (
                    <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-medium">{matchedSubAccounts[0].name}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {matchedSubAccounts[0].subAccountCode}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600">
                      No matching sub-account found under {selectedPreset.mainCategoryName}. Please switch to Advanced mode.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Advanced Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Main Account Category
                </label>
                <select
                  value={advMainAccountId}
                  onChange={e => setAdvMainAccountId(parseInt(e.target.value))}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map(m => (
                    <option key={m.mainAccountId} value={m.mainAccountId}>
                      {m.name} ({m.mainAccountCode}) - {m.financialStatementComponent}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sub Account Group
                </label>
                <select
                  value={advSubAccountId}
                  onChange={e => setAdvSubAccountId(parseInt(e.target.value))}
                  disabled={advAvailableSubs.length === 0}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  {advAvailableSubs.map(sa => (
                    <option key={sa.subAccountId} value={sa.subAccountId}>
                      {sa.name} ({sa.subAccountCode})
                    </option>
                  ))}
                </select>
                {advAvailableSubs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    This main category has no sub-accounts yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Account Name Input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder={
                mode === 'guided' && selectedPreset
                  ? selectedPreset.example
                  : 'Enter unique account name...'
              }
              className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Use a recognizable name that will clearly identify this account on milk receipts, invoices, and reports.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !accountName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
