import React from 'react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/ui/BackButton';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  showBack?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  showBack = false,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-3 mb-3 sm:mb-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
          {showBack && <BackButton />}
          {icon && (
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: cn('w-4 h-4 sm:w-5 sm:h-5', (icon.props as any)?.className),
                  })
                : icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 w-full sm:w-auto justify-start sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
