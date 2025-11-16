// //src/components/ui/Table/Table.tsx
// import { ReactNode } from 'react';
// import { twMerge } from 'tailwind-merge';

// interface TableProps {
//   children: ReactNode;
// }

// export function Table({ children }: TableProps) {
//   return (
//     <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
//       <table className="w-full caption-bottom text-sm min-w-max sm:min-w-0">
//         {children}
//       </table>
//     </div>
//   );
// }

// Table.Header = function TableHeader({ children }: { children: ReactNode }) {
//   return <thead className="[&_tr]:border-b">{children}</thead>;
// };

// Table.Body = function TableBody({ children }: { children: ReactNode }) {
//   return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
// };

// Table.Row = function TableRow({ children }: { children: ReactNode }) {
//   return (
//     <tr className="border-b transition-colors hover:bg-gray-50">
//       {children}
//     </tr>
//   );
// };

// Table.Head = function TableHead({ children }: { children: ReactNode }) {
//   return (
//     <th className="h-10 sm:h-12 px-2 sm:px-4 text-left align-middle font-medium text-gray-500 text-xs sm:text-sm whitespace-nowrap">
//       {children}
//     </th>
//   );
// };

// Table.Cell = function TableCell({ 
//   children, 
//   className 
// }: { 
//   children: ReactNode;
//   className?: string;
// }) {
//   return (
//     <td className={twMerge('p-2 sm:p-4 align-middle text-xs sm:text-sm whitespace-nowrap', className)}>
//       {children}
//     </td>
//   );
// };

//src/components/ui/Table/Table.tsx
import { ReactNode, TdHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  );
}

Table.Header = function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children }: { children: ReactNode }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={twMerge('transition-colors hover:bg-gray-50', className)}>
      {children}
    </tr>
  );
};

Table.Head = function TableHead({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={twMerge(
      'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap',
      'sm:px-4 sm:py-3',
      className
    )}>
      {children}
    </th>
  );
};

Table.Cell = function TableCell({ 
  children, 
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      className={twMerge(
        'px-3 py-3 text-sm text-gray-900 whitespace-nowrap',
        'sm:px-4 sm:py-4',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};