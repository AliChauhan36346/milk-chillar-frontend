'use client';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';

interface PurchaseReportFiltersProps {
  startDate: string;
  endDate: string;
  timeOfDay: string;
  dodhiId: string;
  chillarId: string;
  supplierCode: string;
  onFilterChange: (field: string, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  dodhiOptions?: { value: string; label: string }[];
  chillarOptions?: { value: string; label: string }[];
}

export function PurchaseReportFilters({
  startDate,
  endDate,
  timeOfDay,
  dodhiId,
  chillarId,
  supplierCode,
  onFilterChange,
  onSearch,
  onClear,
  dodhiOptions = [],
  chillarOptions = [],
}: PurchaseReportFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Time of Day */}
        <div className="min-w-[120px]">
          <Select
            value={timeOfDay}
            onChange={(value) => onFilterChange('timeOfDay', value)}
            options={[
              { value: '', label: 'All Times' },
              { value: 'morning', label: 'Morning' },
              { value: 'evening', label: 'Evening' },
            ]}
            placeholder="Time of Day"
          />
        </div>

        {/* Dodhi */}
        <div className="min-w-[150px]">
          <Select
            value={dodhiId}
            onChange={(value) => onFilterChange('dodhiId', value)}
            options={[{ value: '', label: 'All Dodhis' }, ...dodhiOptions]}
            placeholder="Dodhi"
          />
        </div>

        {/* Chillar */}
        {chillarOptions.length > 0 && (
          <div className="min-w-[150px]">
            <Select
              value={chillarId}
              onChange={(value) => onFilterChange('chillarId', value)}
              options={[{ value: '', label: 'All Chillars' }, ...chillarOptions]}
              placeholder="Chillar"
            />
          </div>
        )}

        {/* Supplier Code */}
        <div className="relative min-w-[150px] flex-1 sm:flex-initial">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={supplierCode}
            onChange={(e) => onFilterChange('supplierCode', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Supplier code..."
            className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            onClick={onSearch}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}