import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type StatColor =
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'purple'
  | 'slate'
  | 'neutral'
  | 'cyan'
  | 'yellow'
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface StatItem {
  id?: string;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  subtext?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
  color?: StatColor;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface StatStripProps {
  items: StatItem[];
  className?: string;
  dense?: boolean;
  loading?: boolean;
}

const colorMap: Record<StatColor, { text: string; bg: string; border: string }> = {
  blue: { text: 'text-blue-700', bg: 'bg-blue-50/70', border: 'border-blue-200' },
  green: { text: 'text-emerald-700', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  amber: { text: 'text-amber-700', bg: 'bg-amber-50/70', border: 'border-amber-200' },
  red: { text: 'text-rose-700', bg: 'bg-rose-50/70', border: 'border-rose-200' },
  purple: { text: 'text-purple-700', bg: 'bg-purple-50/70', border: 'border-purple-200' },
  slate: { text: 'text-slate-700', bg: 'bg-slate-50/70', border: 'border-slate-200' },
  neutral: { text: 'text-gray-700', bg: 'bg-gray-50/70', border: 'border-gray-200' },
  cyan: { text: 'text-cyan-700', bg: 'bg-cyan-50/70', border: 'border-cyan-200' },
  yellow: { text: 'text-amber-700', bg: 'bg-amber-50/70', border: 'border-amber-200' },
  default: { text: 'text-slate-700', bg: 'bg-slate-50/70', border: 'border-slate-200' },
  primary: { text: 'text-blue-700', bg: 'bg-blue-50/70', border: 'border-blue-200' },
  success: { text: 'text-emerald-700', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  warning: { text: 'text-amber-700', bg: 'bg-amber-50/70', border: 'border-amber-200' },
  danger: { text: 'text-rose-700', bg: 'bg-rose-50/70', border: 'border-rose-200' },
  info: { text: 'text-cyan-700', bg: 'bg-cyan-50/70', border: 'border-cyan-200' },
};

export function StatStrip({ items, className, dense = false, loading = false }: StatStripProps) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        // Mobile: 2-column responsive grid with mini-cards
        'grid grid-cols-2 gap-2 p-1.5 bg-slate-100/70 rounded-xl border border-slate-200/80',
        // Desktop: single-row strip with divider lines
        'md:flex md:flex-nowrap md:gap-0 md:p-0 md:bg-white md:divide-x md:divide-slate-100 md:shadow-xs overflow-hidden',
        className
      )}
    >
      {items.map((item, index) => {
        const color = item.color || 'default';
        const colorStyle = colorMap[color] || colorMap.default;
        const isClickable = !!item.onClick;
        const secondaryText = item.subtext || item.subValue;
        const isOddLast = index === items.length - 1 && items.length % 2 !== 0;

        return (
          <div
            key={item.id || index}
            onClick={item.onClick}
            className={cn(
              // Mobile card styling
              'bg-white rounded-lg border border-slate-200/80 p-2 sm:p-2.5 shadow-2xs flex items-center justify-between transition-colors',
              isOddLast && 'col-span-2',
              // Desktop reset
              'md:bg-transparent md:border-0 md:rounded-none md:shadow-none md:flex-1 md:min-w-[130px]',
              dense ? 'md:px-3 md:py-2' : 'md:px-4 md:py-2.5 sm:py-3',
              isClickable && 'cursor-pointer hover:bg-slate-50 active:bg-slate-100',
              item.active && 'ring-2 ring-inset ring-blue-500 bg-blue-50/40'
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] sm:text-[10px] font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate">
                    {item.badge}
                  </span>
                )}

                {item.trend && (
                  <span
                    className={cn(
                      'inline-flex items-center text-[10px] font-semibold',
                      item.trend === 'up' && 'text-emerald-600',
                      item.trend === 'down' && 'text-rose-600',
                      item.trend === 'neutral' && 'text-slate-500'
                    )}
                  >
                    {item.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : item.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    ) : null}
                    {item.trendText}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 sm:gap-2">
                {loading ? (
                  <div className="h-5 sm:h-6 w-16 sm:w-20 bg-slate-200 animate-pulse rounded my-0.5" />
                ) : (
                  <span
                    className={cn(
                      'font-bold text-slate-900 tracking-tight truncate',
                      dense ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl'
                    )}
                  >
                    {item.value}
                  </span>
                )}
                {secondaryText && !loading && (
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                    {secondaryText}
                  </span>
                )}
              </div>
            </div>

            {item.icon && (
              <div
                className={cn(
                  'ml-2 sm:ml-3 shrink-0 rounded-lg p-1.5 flex items-center justify-center',
                  colorStyle.bg,
                  colorStyle.text
                )}
              >
                {React.isValidElement(item.icon)
                  ? React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                      className: cn('w-3.5 h-3.5 sm:w-4 sm:h-4', (item.icon.props as any)?.className),
                    })
                  : item.icon}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
