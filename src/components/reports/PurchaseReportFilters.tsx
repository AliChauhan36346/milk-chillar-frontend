'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
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
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Day
            </label>
            <Select
              value={timeOfDay}
              onChange={(value) => onFilterChange('timeOfDay', value)}
              options={[
                { value: '', label: 'All' },
                { value: 'morning', label: 'Morning' },
                { value: 'evening', label: 'Evening' },
              ]}
              placeholder="Select time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dodhi
            </label>
            <Select
              value={dodhiId}
              onChange={(value) => onFilterChange('dodhiId', value)}
              options={[{ value: '', label: 'All Dodhis' }, ...dodhiOptions]}
              placeholder="Select dodhi"
            />
          </div>

          {chillarOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chillar
              </label>
              <Select
                value={chillarId}
                onChange={(value) => onFilterChange('chillarId', value)}
                options={[
                  { value: '', label: 'All Chillars' },
                  ...chillarOptions,
                ]}
                placeholder="Select chillar"
              />
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 mt-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Code
            </label>
            <Input
              type="text"
              value={supplierCode}
              onChange={(e) => onFilterChange('supplierCode', e.target.value)}
              placeholder="Enter supplier code"
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={onSearch}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button
              onClick={onClear}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}