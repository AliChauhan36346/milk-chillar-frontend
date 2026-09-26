'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FinancialYear,
  CloseFinancialYearPreview,
  financialYearsApi
} from '@/lib/api/financialYears';
import { accountsApi, SearchAccountResult } from '@/lib/api/accounts';
import { useFinancialYear } from '@/context/FinancialYearContext';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/Badge';
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export function FinancialYearTab() {
  const { toast } = useToast();
  const { refreshFinancialYears } = useFinancialYear();

  const [years, setYears] = useState<FinancialYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    setAsActive: false,
    notes: ''
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Closing Wizard State
  const [closingYear, setClosingYear] = useState<FinancialYear | null>(null);
  const [closingPreview, setClosingPreview] = useState<CloseFinancialYearPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [equityAccounts, setEquityAccounts] = useState<SearchAccountResult[]>([]);
  const [selectedEquityAccountId, setSelectedEquityAccountId] = useState<number | ''>('');
  const [nextYearName, setNextYearName] = useState('');
  const [nextYearCode, setNextYearCode] = useState('');
  const [nextYearStartDate, setNextYearStartDate] = useState('');
  const [nextYearEndDate, setNextYearEndDate] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  // Reopen Confirmation State
  const [reopenYearId, setReopenYearId] = useState<number | null>(null);
  const [isReopening, setIsReopening] = useState(false);

  const loadYears = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await financialYearsApi.getAll();
      setYears(data);
    } catch (err: any) {
      console.error('Failed to load financial years:', err);
      toast({
        title: 'Error',
        description: 'Failed to load financial years.',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadYears();
  }, [loadYears]);

  // Load equity accounts for closing wizard
  useEffect(() => {
    async function loadEquity() {
      try {
        const accounts = await accountsApi.getAccountsByComponent('equity');
        setEquityAccounts(accounts || []);
        if (accounts && accounts.length > 0) {
          setSelectedEquityAccountId(accounts[0].accountId);
        }
      } catch (err) {
        console.error('Failed to load equity accounts:', err);
      }
    }
    loadEquity();
  }, []);

  // Handle Set Active
  const handleSetActive = async (id: number) => {
    try {
      await financialYearsApi.setActive(id);
      toast({
        title: 'Success',
        description: 'Active financial year switched successfully.',
        variant: 'success'
      });
      await loadYears();
      await refreshFinancialYears();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to switch active financial year.',
        variant: 'error'
      });
    }
  };

  // Open Create Modal with default calculated dates
  const handleOpenCreateModal = () => {
    const now = new Date();
    let startYear = now.getFullYear();
    if (now.getMonth() < 6) {
      startYear = now.getFullYear() - 1;
    }
    const defaultStart = `${startYear}-07-01`;
    const defaultEnd = `${startYear + 1}-06-30`;
    const defaultName = `FY ${startYear}-${startYear + 1}`;
    const defaultCode = `FY${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;

    setCreateForm({
      name: defaultName,
      code: defaultCode,
      startDate: defaultStart,
      endDate: defaultEnd,
      setAsActive: false,
      notes: ''
    });
    setIsCreateModalOpen(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.startDate || !createForm.endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'error'
      });
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await financialYearsApi.create({
        name: createForm.name.trim(),
        code: createForm.code.trim() || createForm.name.trim(),
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        setAsActive: createForm.setAsActive,
        notes: createForm.notes
      });

      toast({
        title: 'Financial Year Created',
        description: `Successfully added ${createForm.name}.`,
        variant: 'success'
      });

      setIsCreateModalOpen(false);
      await loadYears();
      await refreshFinancialYears();
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err.response?.data?.message || 'Failed to create financial year.',
        variant: 'error'
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Close Wizard
  const handleOpenCloseWizard = async (year: FinancialYear) => {
    setClosingYear(year);
    setIsLoadingPreview(true);
    setConfirmPhrase('');

    // Pre-calculate next year dates
    const currentEnd = new Date(year.endDate);
    const nextStart = new Date(currentEnd);
    nextStart.setDate(nextStart.getDate() + 1);

    const nextEnd = new Date(nextStart);
    nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    nextEnd.setDate(nextEnd.getDate() - 1);

    const nextStartStr = nextStart.toISOString().split('T')[0];
    const nextEndStr = nextEnd.toISOString().split('T')[0];
    const startYr = nextStart.getFullYear();
    const endYr = nextEnd.getFullYear();

    setNextYearStartDate(nextStartStr);
    setNextYearEndDate(nextEndStr);
    setNextYearName(`FY ${startYr}-${endYr}`);
    setNextYearCode(`FY${String(startYr).slice(-2)}-${String(endYr).slice(-2)}`);

    try {
      const preview = await financialYearsApi.getClosingPreview(year.financialYearId);
      setClosingPreview(preview);
    } catch (err: any) {
      toast({
        title: 'Preview Failed',
        description: err.response?.data?.message || 'Failed to load year closing preview.',
        variant: 'error'
      });
      setClosingYear(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Submit Year-End Close
  const handleExecuteClose = async () => {
    if (!closingYear) return;
    if (confirmPhrase.trim().toUpperCase() !== 'CLOSE FY') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "CLOSE FY" to confirm.',
        variant: 'error'
      });
      return;
    }
    if (!selectedEquityAccountId) {
      toast({
        title: 'Missing Account',
        description: 'Please select an Equity / Retained Earnings account.',
        variant: 'error'
      });
      return;
    }

    try {
      setIsSubmittingClose(true);
      const result = await financialYearsApi.closeFinancialYear(closingYear.financialYearId, {
        retainedEarningsAccountId: Number(selectedEquityAccountId),
        createNextYearIfMissing: true,
        nextYearName: nextYearName.trim(),
        nextYearCode: nextYearCode.trim(),
        nextYearStartDate: nextYearStartDate,
        nextYearEndDate: nextYearEndDate,
        notes: closingNotes
      });

      toast({
        title: 'Financial Year Closed',
        description: result.message || `${closingYear.name} successfully closed and rolled forward.`,
        variant: 'success'
      });

      setClosingYear(null);
      setClosingPreview(null);
      await loadYears();
      await refreshFinancialYears();
    } catch (err: any) {
      toast({
        title: 'Close Failed',
        description: err.response?.data?.message || 'Failed to execute year-end close.',
        variant: 'error'
      });
    } finally {
      setIsSubmittingClose(false);
    }
  };

  // Handle Reopen
  const handleReopen = async (id: number) => {
    try {
      setIsReopening(true);
      await financialYearsApi.reopen(id);
      toast({
        title: 'Financial Year Reopened',
        description: 'Year unlocked for audit adjustments.',
        variant: 'success'
      });
      setReopenYearId(null);
      await loadYears();
      await refreshFinancialYears();
    } catch (err: any) {
      toast({
        title: 'Reopen Failed',
        description: err.response?.data?.message || 'Failed to reopen financial year.',
        variant: 'error'
      });
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 p-5 rounded-xl border border-blue-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Financial Years (Fiscal Periods)</h2>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl">
            Keep your software <strong>clean and fast</strong> year after year. Every financial year bounds daily transactions,
            allows instant ledger calculations, and enables automated year-end roll-forward.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus size={15} />
          <span>New Financial Year</span>
        </button>
      </div>

      {/* Years Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mb-2" />
          <p className="text-xs">Loading accounting periods...</p>
        </div>
      ) : years.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No Financial Years Configured</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Click below to create your initial financial year.</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium"
          >
            Create Initial FY
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((year) => {
            const startDateFormatted = new Date(year.startDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const endDateFormatted = new Date(year.endDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={year.financialYearId}
                className={`relative bg-white rounded-xl border p-4 transition-all shadow-xs flex flex-col justify-between ${
                  year.isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : year.isClosed
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Status & Code */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {year.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {year.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 size={12} />
                          Active (Operational)
                        </span>
                      )}
                      {year.isClosed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock size={11} />
                          Closed (Locked)
                        </span>
                      )}
                      {!year.isActive && !year.isClosed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock size={11} />
                          Draft / Future
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Year Name */}
                  <h3 className="text-sm font-bold text-slate-800">{year.name}</h3>

                  {/* Date Range */}
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Period:</span>
                      <span className="font-semibold text-slate-700">
                        {startDateFormatted} &rarr; {endDateFormatted}
                      </span>
                    </div>
                    {year.isClosed && year.closedAt && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>Closed:</span>
                        <span>{new Date(year.closedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {year.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic line-clamp-2">
                      "{year.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {!year.isActive && !year.isClosed && (
                    <button
                      onClick={() => handleSetActive(year.financialYearId)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Set as Active
                    </button>
                  )}

                  {!year.isClosed ? (
                    <button
                      onClick={() => handleOpenCloseWizard(year)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors ml-auto"
                    >
                      <Lock size={12} />
                      <span>Close Year & Roll Forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setReopenYearId(year.financialYearId)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-600 transition-colors ml-auto"
                    >
                      <Unlock size={11} />
                      <span>Reopen for Audit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE FINANCIAL YEAR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Add New Financial Year</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Financial Year Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2025-2026"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY25-26"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="setAsActiveCheckbox"
                  checked={createForm.setAsActive}
                  onChange={(e) => setCreateForm({ ...createForm, setAsActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="setAsActiveCheckbox" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Set immediately as Active Operational Year
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional period notes..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmittingCreate && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save Financial Year</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YEAR-END CLOSING WIZARD MODAL */}
      {closingYear && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Year-End Close & Roll-Forward: {closingYear.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Calculates Profit & Loss, closes temporary accounts, and rolls forward balance sheet opening balances.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClosingYear(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {isLoadingPreview ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-amber-500" />
                  <p className="text-xs">Auditing year accounts & calculating Profit & Loss...</p>
                </div>
              ) : closingPreview ? (
                <>
                  {/* Step 1: P&L Summary Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-[10px] font-bold">1</span>
                      Profit & Loss Audit Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <TrendingUp size={12} /> Total Revenue
                        </span>
                        <p className="text-sm font-bold text-emerald-800 mt-1 font-mono">
                          Rs. {closingPreview.totalRevenue.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl">
                        <span className="text-[10px] font-semibold text-rose-700 flex items-center gap-1">
                          <TrendingDown size={12} /> Total Expenses
                        </span>
                        <p className="text-sm font-bold text-rose-800 mt-1 font-mono">
                          Rs. {closingPreview.totalExpense.toLocaleString()}
                        </p>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          closingPreview.netProfitLoss >= 0
                            ? 'bg-blue-50/80 border-blue-200 text-blue-800'
                            : 'bg-amber-50/80 border-amber-200 text-amber-800'
                        }`}
                      >
                        <span className="text-[10px] font-semibold flex items-center gap-1">
                          {closingPreview.netProfitLoss >= 0 ? 'Net Profit' : 'Net Loss'}
                        </span>
                        <p className="text-sm font-bold mt-1 font-mono">
                          Rs. {Math.abs(closingPreview.netProfitLoss).toLocaleString()}{' '}
                          <span className="text-[10px]">
                            {closingPreview.netProfitLoss >= 0 ? '(Credit)' : '(Debit)'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Retained Earnings Account Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-[10px] font-bold">2</span>
                      Transfer Net Profit/Loss to Equity Account
                    </h4>
                    <label className="block text-xs text-slate-600 mb-1">
                      Select Retained Earnings or Capital Equity Account:
                    </label>
                    <select
                      value={selectedEquityAccountId}
                      onChange={(e) => setSelectedEquityAccountId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {equityAccounts.map((acc) => (
                        <option key={acc.accountId} value={acc.accountId}>
                          {acc.accountCode} - {acc.name || acc.accountName}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      A closing journal entry will debit all revenue accounts to zero, credit all expense accounts to zero,
                      and transfer the net balance into this account.
                    </p>
                  </div>

                  {/* Step 3: Next Financial Year Setup */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-[10px] font-bold">3</span>
                      Destination Next Financial Year
                    </h4>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Next Year Name</label>
                        <input
                          type="text"
                          value={nextYearName}
                          onChange={(e) => setNextYearName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Short Code</label>
                        <input
                          type="text"
                          value={nextYearCode}
                          onChange={(e) => setNextYearCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Start Date</label>
                        <input
                          type="date"
                          value={nextYearStartDate}
                          onChange={(e) => setNextYearStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">End Date</label>
                        <input
                          type="date"
                          value={nextYearEndDate}
                          onChange={(e) => setNextYearEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Roll-Forward Preview */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 inline-flex items-center justify-center text-[10px] font-bold">4</span>
                        Balance Sheet Roll-Forward ({closingPreview.accountsToRollForwardCount} Accounts)
                      </span>
                      <span className="text-[10px] text-slate-400 lowercase font-normal">
                        cash, bank, buyers & suppliers
                      </span>
                    </h4>

                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                      {closingPreview.rollForwardAccounts.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          No active balance sheet balances to roll forward.
                        </div>
                      ) : (
                        closingPreview.rollForwardAccounts.map((acc) => (
                          <div key={acc.accountId} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <span className="font-semibold text-slate-700">{acc.accountName}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({acc.accountCode} - {acc.accountType})</span>
                            </div>
                            <div className="font-mono font-medium text-slate-700">
                              {acc.newDebitOpening > 0 && (
                                <span className="text-blue-600">Dr. Rs. {acc.newDebitOpening.toLocaleString()}</span>
                              )}
                              {acc.newCreditOpening > 0 && (
                                <span className="text-purple-600">Cr. Rs. {acc.newCreditOpening.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Step 5: Security Lock Warning & Typed Confirmation */}
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-amber-900">Period Locking & Audit Protection</h5>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Closing this year will <strong>lock all transactions</strong> dated within {closingYear.name}.
                          The destination year ({nextYearName}) will be set as the new <strong>Active Operational Year</strong>.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Type <code className="text-red-600 font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200">CLOSE FY</code> to confirm:
                      </label>
                      <input
                        type="text"
                        placeholder="CLOSE FY"
                        value={confirmPhrase}
                        onChange={(e) => setConfirmPhrase(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setClosingYear(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isLoadingPreview ||
                  isSubmittingClose ||
                  confirmPhrase.trim().toUpperCase() !== 'CLOSE FY'
                }
                onClick={handleExecuteClose}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isSubmittingClose && <RefreshCw size={13} className="animate-spin" />}
                <span>Execute Year-End Close & Activate Next FY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REOPEN CONFIRMATION MODAL */}
      {reopenYearId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <Unlock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Reopen Financial Year?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Reopening this period removes the year-end closing entry and allows modifications for auditing purposes.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setReopenYearId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReopen(reopenYearId)}
                disabled={isReopening}
                className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1"
              >
                {isReopening && <RefreshCw size={13} className="animate-spin" />}
                <span>Confirm Reopen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
