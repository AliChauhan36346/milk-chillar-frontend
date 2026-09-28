import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SummaryCardProps {
  title: string;
  value: React.ReactNode;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'cyan' | 'slate';
  className?: string;
  subtitle?: string;
  badge?: string;
}

const badgeStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200/80',
  red: 'bg-rose-50 text-rose-700 border-rose-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  gray: 'bg-slate-100 text-slate-700 border-slate-200/80',
  orange: 'bg-amber-50 text-amber-700 border-amber-200/80',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200/80'
};

const iconStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  yellow: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  purple: 'bg-purple-50 text-purple-600',
  gray: 'bg-slate-100 text-slate-600',
  orange: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  slate: 'bg-slate-100 text-slate-600'
};

export default function SummaryCard({
  title,
  value,
  icon,
  color = 'blue',
  className = '',
  subtitle,
  badge
}: SummaryCardProps) {
  const chosenColor = color && iconStyles[color] ? color : 'blue';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between gap-3',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.2 text-[9px] font-medium rounded-full border truncate',
                badgeStyles[chosenColor]
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight tabular-nums truncate">
            {value}
          </span>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {icon && (
        <div
          className={cn(
            'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center p-1.5',
            iconStyles[chosenColor]
          )}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn('w-4 h-4', (icon.props as any)?.className),
              })
            : icon}
        </div>
      )}
    </div>
  );
}