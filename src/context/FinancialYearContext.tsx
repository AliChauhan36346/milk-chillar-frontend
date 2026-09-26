'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FinancialYear, financialYearsApi } from '@/lib/api/financialYears';
import { useAuth } from '@/lib/auth/AuthContext';

interface FinancialYearContextType {
  financialYears: FinancialYear[];
  activeYear: FinancialYear | null;
  selectedYear: FinancialYear | null;
  isHistoricalMode: boolean;
  isLoading: boolean;
  setSelectedYear: (year: FinancialYear) => void;
  refreshFinancialYears: () => Promise<void>;
}

const FinancialYearContext = createContext<FinancialYearContextType | undefined>(undefined);

export const FinancialYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [activeYear, setActiveYear] = useState<FinancialYear | null>(null);
  const [selectedYear, setSelectedYearState] = useState<FinancialYear | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFinancialYears = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      setIsLoading(true);
      const list = await financialYearsApi.getAll();
      setFinancialYears(list);

      const active = list.find(y => y.isActive) || list[0] || null;
      setActiveYear(active);

      // Check if user previously selected a specific year in session
      const savedSelectedId = sessionStorage.getItem('selected_financial_year_id');
      if (savedSelectedId) {
        const found = list.find(y => y.financialYearId === Number(savedSelectedId));
        if (found) {
          setSelectedYearState(found);
          return;
        }
      }

      // Default to active year
      setSelectedYearState(active);
    } catch (err) {
      console.error('Failed to load financial years:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isInitialized && isAuthenticated()) {
      refreshFinancialYears();
    }
  }, [isInitialized, isAuthenticated, refreshFinancialYears]);

  const setSelectedYear = (year: FinancialYear) => {
    setSelectedYearState(year);
    try {
      sessionStorage.setItem('selected_financial_year_id', year.financialYearId.toString());
    } catch {}
  };

  const isHistoricalMode = Boolean(selectedYear && activeYear && selectedYear.financialYearId !== activeYear.financialYearId);

  return (
    <FinancialYearContext.Provider
      value={{
        financialYears,
        activeYear,
        selectedYear,
        isHistoricalMode,
        isLoading,
        setSelectedYear,
        refreshFinancialYears
      }}
    >
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
};
