// components/layouts/DynamicLayout.tsx
'use client';
import { AdminLayout } from './AdminLayout';
import { FieldStaffLayout } from './FieldStaffLayout';
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

  // Convert allowedRoles to lowercase for comparison if they exist
  const lowerAllowedRoles = allowedRoles?.map(role => role.toLowerCase());

  // Check if allowedRoles is provided and if user has access
  if (lowerAllowedRoles && role && !lowerAllowedRoles.includes(role)) {
    return <Unauthorized />;
  }

  // Return the appropriate layout based on the user's actual role (now in lowercase)
  switch(role) {
    case 'admin':
    case 'manager':
      return <AdminLayout>{children}</AdminLayout>;
    
    case 'chillarincharge': // Note: now lowercase
      return <FieldStaffLayout role="chillarIncharge">{children}</FieldStaffLayout>;
    
    case 'dodhi':
      return <FieldStaffLayout role="dodhi">{children}</FieldStaffLayout>;
    
    // Add more cases for other roles as needed
    
    default:
      // Fallback for unexpected roles
      return <Unauthorized />;
  }
}