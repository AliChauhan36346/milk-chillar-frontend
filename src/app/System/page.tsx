'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { DataCleanupModal } from '@/components/features/settings/DataCleanupModal';
import { UpdateRateModal } from '@/components/features/settings/UpdateRateModal';
import {
  DataCleanupPreview,
  DataCleanupRequest,
  DataCleanupResult,
  getDataCleanupPreview
} from '@/lib/api/maintenance';
import { useToast } from '@/hooks/useToast';
import { FinancialYearTab } from '@/components/features/settings/FinancialYearTab';
import {
  Settings,
  Trash2,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers,
  Building,
  Info,
  Package,
  ShoppingCart,
  ShoppingBag,
  Scale,
  Receipt,
  BookOpen,
  Users,
  ChevronRight,
  Calculator,
  Calendar,
  UserPlus,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

function SystemSettingsContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'financial-years' | 'cleanup' | 'rates' | 'users' | 'info'>(
    initialTab === 'cleanup' || initialTab === 'rates' || initialTab === 'info' || initialTab === 'users'
      ? initialTab
      : 'financial-years'
  );

  useEffect(() => {
    if (initialTab && ['financial-years', 'cleanup', 'rates', 'users', 'info'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Preview Data
  const [preview, setPreview] = useState<DataCleanupPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // Cleanup Options state
  const [preserveAccounts, setPreserveAccounts] = useState(true);
  const [clearPurchases, setClearPurchases] = useState(true);
  const [clearSales, setClearSales] = useState(true);
  const [clearChillarReceives, setClearChillarReceives] = useState(true);
  const [clearStockEntries, setClearStockEntries] = useState(true);
  const [clearPaymentsAndReceipts, setClearPaymentsAndReceipts] = useState(true);
  const [clearJournalEntries, setClearJournalEntries] = useState(true);

  // Modals state
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Load preview data
  const loadPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    try {
      const data = await getDataCleanupPreview();
      setPreview(data);
    } catch (err: any) {
      console.error('Failed to load cleanup preview:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch database record counts.',
        variant: 'error',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  // Construct request object
  const currentRequest: DataCleanupRequest = {
    preserveAccounts,
    clearPurchases,
    clearSales,
    clearChillarReceives,
    clearStockEntries,
    clearPaymentsAndReceipts,
    clearJournalEntries,
  };

  // Selected categories list for display
  const getSelectedCategoriesSummary = (): string[] => {
    const list: string[] = [];
    if (clearPurchases) list.push('Milk Purchases');
    if (clearSales) list.push('Milk Sales');
    if (clearChillarReceives) list.push('Chillar Receives');
    if (clearStockEntries) list.push('Stock Entries');
    if (clearPaymentsAndReceipts) list.push('Cash & Bank Transactions');
    if (clearJournalEntries) list.push('Ledger & Journal Entries');
    return list;
  };

  // Estimated records to be deleted
  const getEstimatedRecords = (): number => {
    if (!preview) return 0;
    let count = 0;
    if (clearPurchases) count += preview.purchasesCount;
    if (clearSales) count += preview.salesCount;
    if (clearChillarReceives) count += preview.chillarReceivesCount;
    if (clearStockEntries) count += preview.stockEntriesCount;
    if (clearPaymentsAndReceipts) {
      count += preview.cashPaymentsCount + preview.cashReceiptsCount + preview.bankPaymentsCount + preview.bankReceiptsCount;
    }
    if (clearJournalEntries) count += preview.journalEntriesCount;
    if (!preserveAccounts) {
      count += preview.totalMasterRecords;
    }
    return count;
  };

  const handleCleanupSuccess = (result: DataCleanupResult) => {
    loadPreview();
  };

  const hasAnyCategorySelected =
    clearPurchases ||
    clearSales ||
    clearChillarReceives ||
    clearStockEntries ||
    clearPaymentsAndReceipts ||
    clearJournalEntries ||
    !preserveAccounts;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Settings & Maintenance
            </span>
          }
          subtitle="System configurations, bulk operational data reset, rate management, and business metadata"
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('financial-years')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'financial-years'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Financial Years
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cleanup')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cleanup'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Bulk Data Cleanup & Reset
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rate Management
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Users & Roles
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Info className="w-4 h-4" />
            System & Business Info
          </button>
        </div>

        {/* TAB 0: FINANCIAL YEARS */}
        {activeTab === 'financial-years' && <FinancialYearTab />}

        {/* TAB 1: BULK DATA CLEANUP */}
        {activeTab === 'cleanup' && (
          <div className="space-y-4">
            {/* Warning & Instructions Card */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-xl border border-red-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">
                    Bulk Data Purge & System Reset
                  </h3>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                    Clear test, demo, or seasonal operational records. You can safely clear all transactions while keeping your Chart of Accounts, Suppliers, and Buyers intact.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPreview}
                disabled={isLoadingPreview}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                Refresh Counts
              </button>
            </div>

            {/* Live Database Record Preview Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-500" />
                  Current Database Volume
                </h4>
                {preview && (
                  <span className="text-xs text-gray-400">
                    Total Transactions: <strong>{preview.totalTransactionalRecords.toLocaleString()}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Purchases */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> Purchases
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview ? '—' : preview?.purchasesCount.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Sales */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> Sales
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview ? '—' : preview?.salesCount.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Chillar Receives */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <Scale className="w-3.5 h-3.5 text-purple-500" /> Receives
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview ? '—' : preview?.chillarReceivesCount.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Stock Entries */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <Package className="w-3.5 h-3.5 text-amber-500" /> Stock
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview ? '—' : preview?.stockEntriesCount.toLocaleString() ?? 0}
                  </div>
                </div>

                {/* Cash/Bank Transactions */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <Receipt className="w-3.5 h-3.5 text-cyan-500" /> Payments/Receipts
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview
                      ? '—'
                      : (
                          (preview?.cashPaymentsCount ?? 0) +
                          (preview?.cashReceiptsCount ?? 0) +
                          (preview?.bankPaymentsCount ?? 0) +
                          (preview?.bankReceiptsCount ?? 0)
                        ).toLocaleString()}
                  </div>
                </div>

                {/* Journal Entries */}
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Journal Entries
                  </div>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    {isLoadingPreview ? '—' : preview?.journalEntriesCount.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* PRESERVE ACCOUNTS OPTION CARD (HIGHLIGHTED) */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                preserveAccounts
                  ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                  : 'bg-red-50/50 border-red-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      preserveAccounts ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {preserveAccounts ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">
                        Preserve Accounts & Master Data
                      </h4>
                      <Badge variant={preserveAccounts ? 'success' : 'destructive'} className="text-[10px]">
                        {preserveAccounts ? 'Recommended' : 'Destructive Wipe'}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {preserveAccounts ? (
                        <>
                          <strong className="text-emerald-800">Accounts & Master Entities Protected:</strong>{' '}
                          Chart of Accounts ({preview?.accountsCount ?? 0}), Suppliers ({preview?.suppliersCount ?? 0}),
                          Buyers ({preview?.buyersCount ?? 0}), and Staff ({preview?.employeesCount ?? 0}) will{' '}
                          <strong>NOT</strong> be deleted. All account balances will be reset to 0.00.
                        </>
                      ) : (
                        <>
                          <strong className="text-red-800">Complete Master Directory Deletion:</strong> In addition
                          to transactions, this will also wipe all Suppliers, Buyers, Staff, Chilling Centers, and Chart of
                          Accounts. (Admin logins and roles are never deleted).
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setPreserveAccounts(!preserveAccounts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    preserveAccounts ? 'bg-emerald-600' : 'bg-red-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preserveAccounts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Granular Categories Selection */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-xs font-bold text-gray-800">Select Data Categories to Purge:</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClearPurchases(true);
                      setClearSales(true);
                      setClearChillarReceives(true);
                      setClearStockEntries(true);
                      setClearPaymentsAndReceipts(true);
                      setClearJournalEntries(true);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setClearPurchases(false);
                      setClearSales(false);
                      setClearChillarReceives(false);
                      setClearStockEntries(false);
                      setClearPaymentsAndReceipts(false);
                      setClearJournalEntries(false);
                    }}
                    className="text-[11px] text-gray-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. Purchases */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearPurchases}
                    onChange={(e) => setClearPurchases(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Milk Purchases</span>
                    <span className="text-[10px] text-gray-400">
                      {preview?.purchasesCount ?? 0} records
                    </span>
                  </div>
                </label>

                {/* 2. Sales */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearSales}
                    onChange={(e) => setClearSales(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Milk Sales</span>
                    <span className="text-[10px] text-gray-400">{preview?.salesCount ?? 0} records</span>
                  </div>
                </label>

                {/* 3. Chillar Receives */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearChillarReceives}
                    onChange={(e) => setClearChillarReceives(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Chillar Receives</span>
                    <span className="text-[10px] text-gray-400">
                      {preview?.chillarReceivesCount ?? 0} records
                    </span>
                  </div>
                </label>

                {/* 4. Stock Entries */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearStockEntries}
                    onChange={(e) => setClearStockEntries(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Stock Movements</span>
                    <span className="text-[10px] text-gray-400">
                      {preview?.stockEntriesCount ?? 0} records
                    </span>
                  </div>
                </label>

                {/* 5. Payments & Receipts */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearPaymentsAndReceipts}
                    onChange={(e) => setClearPaymentsAndReceipts(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Payments & Receipts</span>
                    <span className="text-[10px] text-gray-400">
                      Cash & Bank transactions
                    </span>
                  </div>
                </label>

                {/* 6. Journal Entries */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50/60 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={clearJournalEntries}
                    onChange={(e) => setClearJournalEntries(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Journal & Roznamcha</span>
                    <span className="text-[10px] text-gray-400">
                      {preview?.journalEntriesCount ?? 0} records
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Banner */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Estimated records to clear: <strong className="text-red-600 font-mono">~{getEstimatedRecords().toLocaleString()}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCleanupModalOpen(true)}
                  disabled={!hasAnyCategorySelected}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center gap-2 shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Proceed to Clear Data...
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RATE MANAGEMENT */}
        {activeTab === 'rates' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Period Rate Adjustments</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update supplier or buyer rates across date ranges with automatic financial adjustments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Calculator className="w-4 h-4" />
                  Open Rate Adjustment Tool
                </button>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  How Rate Management Works:
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
                  <li>Allows retroactively adjusting milk rates for a specific supplier, dodhi, or buyer.</li>
                  <li>Automatically calculates the rate difference and updates corresponding purchase/sales ledger records.</li>
                  <li>Ensures supplier and buyer khata balances reflect accurate pricing adjustments.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM & BUSINESS INFO */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-gray-500" /> Dairy Business Metadata
              </h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Platform</span>
                  <span className="font-semibold text-gray-800">MilkChillar SaaS Dairy ERP</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Architecture</span>
                  <span className="font-mono text-gray-700">.NET 8 Web API + Next.js App Router</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Database Engine</span>
                  <span className="font-medium text-gray-800">PostgreSQL (Supabase Cloud)</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Multi-Tenancy</span>
                  <Badge variant="success">Tenant Isolated</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200/90 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-gray-500" /> Security & Access Controls
              </h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Access Control Model</span>
                  <span className="font-medium text-gray-800">Role-Based (RBAC) + Granular Permissions</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Authentication</span>
                  <span className="font-medium text-gray-800">JWT Bearer Token</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500">Protection Standard</span>
                  <span className="text-emerald-700 font-medium">Logins Protected from Bulk Deletion</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Users Directory Card */}
              <div className="p-5 bg-white rounded-xl border border-gray-200/90 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">User Logins & Accounts</h3>
                      <p className="text-xs text-gray-500">Manage portal access, credentials, and user roles.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href="/Users"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    View All Users
                  </Link>
                  <Link
                    href="/Users/create"
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create New User
                  </Link>
                </div>
              </div>

              {/* Staff & Employees Card */}
              <div className="p-5 bg-white rounded-xl border border-gray-200/90 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Employees & Operations Staff</h3>
                      <p className="text-xs text-gray-500">Manage dodhis, chilling center in-charges, and staff records.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Link
                    href="/Employees"
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    View Staff List
                  </Link>
                  <Link
                    href="/Employees/create"
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Staff Member
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmation for Bulk Data Cleanup */}
        <DataCleanupModal
          isOpen={isCleanupModalOpen}
          onClose={() => setIsCleanupModalOpen(false)}
          request={currentRequest}
          selectedCategoriesSummary={getSelectedCategoriesSummary()}
          totalRecordsEstimate={getEstimatedRecords()}
          onSuccess={handleCleanupSuccess}
        />

        {/* Modal: Period Rate Adjustments */}
        <UpdateRateModal
          isOpen={isRateModalOpen}
          onClose={() => setIsRateModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading settings...</div>}>
      <SystemSettingsContent />
    </Suspense>
  );
}
