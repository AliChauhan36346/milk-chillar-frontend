import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface CompactToolbarProps {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  filters?: React.ReactNode;
  search?: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  };
  rightActions?: React.ReactNode;
  className?: string;
}

export function CompactToolbar({
  children,
  left,
  right,
  filters,
  search,
  rightActions,
  className,
}: CompactToolbarProps) {
  const leftContent = left || filters || children;
  const rightContent = right || rightActions;

  return (
    <div
      className={cn(
        'w-full bg-white rounded-xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5',
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
        {leftContent}

        {search && (
          <div className="relative min-w-[180px] flex-1 sm:flex-initial w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'Search...'}
              className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500">
          {rightContent}
        </div>
      )}
    </div>
  );
}
