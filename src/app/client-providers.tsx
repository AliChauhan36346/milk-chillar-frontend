// // app/client-providers.tsx
// 'use client';
// import { Toaster } from "sonner";
// import { AuthProvider } from "@/lib/auth/AuthContext";

// export function ClientProviders({ 
//   children 
// }: { 
//   children: React.ReactNode 
// }) {
//   return (
//     <AuthProvider>
//       {children}
//       <Toaster 
//         position="top-right"
//         toastOptions={{
//           unstyled: false,
//           classNames: {
//             toast: '!bg-white !border !border-gray-200 !shadow-lg !rounded-lg !p-4',
//             title: '!font-medium !text-gray-800',
//             description: '!text-sm !text-gray-600',
//             success: '!border-green-100 !bg-green-50',
//             error: '!border-red-100 !bg-red-50',
//             actionButton: '!bg-blue-600 !text-white',
//             cancelButton: '!bg-gray-100 !text-gray-800',
//           },
//         }}
//       />
//     </AuthProvider>
//   );
// }

// app/client-providers.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { FinancialYearProvider } from "@/context/FinancialYearContext";

export function ClientProviders({
  children
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FinancialYearProvider>
          {children}
        </FinancialYearProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            unstyled: false,
            classNames: {
              toast: '!bg-white !border !border-gray-200 !shadow-lg !rounded-lg !p-4',
              title: '!font-medium !text-gray-800',
              description: '!text-sm !text-gray-600',
              success: '!border-green-100 !bg-green-50',
              error: '!border-red-100 !bg-red-50',
              actionButton: '!bg-blue-600 !text-white',
              cancelButton: '!bg-gray-100 !text-gray-800',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}