import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

Table.Header = function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="[&_tr]:border-b">{children}</thead>;
};

Table.Body = function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
};

Table.Row = function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b transition-colors hover:bg-gray-50">
      {children}
    </tr>
  );
};

Table.Head = function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
      {children}
    </th>
  );
};

Table.Cell = function TableCell({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={twMerge('p-4 align-middle', className)}>
      {children}
    </td>
  );
};