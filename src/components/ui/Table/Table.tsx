import { ReactNode, TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function TableContainer({ children, className, ...props }: TableContainerProps) {
  return (
    <div
      className={twMerge(
        'w-full bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TableProps {
  children: ReactNode;
  className?: string;
  dense?: boolean;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className={twMerge('min-w-full divide-y divide-slate-100 text-left', className)}>
          {children}
        </table>
      </div>
    </div>
  );
}

Table.Container = TableContainer;

Table.Header = function TableHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead className={twMerge('bg-slate-50/75 border-b border-slate-200/80', className)}>
      {children}
    </thead>
  );
};

Table.Body = function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tbody className={twMerge('bg-white divide-y divide-slate-100', className)}>
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={twMerge('transition-colors hover:bg-slate-50/60', className)}
      {...props}
    >
      {children}
    </tr>
  );
};

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  dense?: boolean;
  align?: 'left' | 'center' | 'right';
}

Table.Head = function TableHead({
  children,
  className,
  dense = false,
  align = 'left',
  ...props
}: TableHeadProps) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      className={twMerge(
        'text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap select-none',
        alignClass,
        dense ? 'px-3 py-2 text-[11px]' : 'px-3.5 py-2.5 sm:px-4 sm:py-3',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  dense?: boolean;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}

Table.Cell = function TableCell({
  children,
  className,
  dense = false,
  align = 'left',
  mono = false,
  ...props
}: TableCellProps) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <td
      className={twMerge(
        'text-xs sm:text-sm text-slate-800 whitespace-nowrap',
        alignClass,
        mono && 'font-mono tabular-nums',
        dense ? 'px-3 py-1.5 sm:py-2 text-xs' : 'px-3.5 py-2.5 sm:px-4 sm:py-3',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};