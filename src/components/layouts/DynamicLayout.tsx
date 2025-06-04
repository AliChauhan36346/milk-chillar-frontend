// components/layouts/DynamicLayout.tsx
'use client';
import { PageLayout } from './PageLayout';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from '@/components/ui/Loader';
import { Unauthorized } from '@/components/Unauthorized';

type DynamicLayoutProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export function DynamicLayout({ 
  children,
  allowedRoles 
}: DynamicLayoutProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if allowedRoles is provided and if user has access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Unauthorized />;
  }

  // If no allowedRoles specified, just render with the user's role
  return (
    <PageLayout
      role={role as any} // Cast to any since we know it matches our role types
      contentClassName="max-w-screen-xl mx-auto"
    >
      {children}
    </PageLayout>
  );
}