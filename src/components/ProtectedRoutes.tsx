// // components/ProtectedRoute.tsx
// 'use client';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useAuth } from '@/lib/auth/AuthContext';

// export default function ProtectedRoute({
//   children,
//   requiredPermissions = [],
//   requiredRole,
// }: {
//   children: React.ReactNode;
//   requiredPermissions?: string[];
//   requiredRole?: string;
// }) {
//   const { isAuthenticated, hasPermission, user, isInitialized } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isInitialized) return;

//     if (!isAuthenticated()) {
//       const loginUrl = new URL('/login', window.location.origin);
//       loginUrl.searchParams.set('callbackUrl', window.location.pathname);
//       router.push(loginUrl.toString());
//       return;
//     }

//     if (requiredRole && user?.role.toLowerCase() !== requiredRole.toLowerCase()) {
//       router.push('/unauthorized');
//       return;
//     }

//     if (requiredPermissions.length > 0 && 
//         !requiredPermissions.every(p => hasPermission(p))) {
//       router.push('/unauthorized');
//     }
//   }, [isInitialized, isAuthenticated, user, requiredRole, requiredPermissions]);

//   if (!isInitialized) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <p>Verifying authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated() || 
//       (requiredRole && user?.role.toLowerCase() !== requiredRole.toLowerCase()) ||
//       (requiredPermissions.length > 0 && !requiredPermissions.every(p => hasPermission(p)))) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <p>Redirecting...</p>
//         </div>
//       </div>
//     );
//   }

//   return <>{children}</>;
// }

// components/ProtectedRoute.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ProtectedRoute({
  children,
  requiredRole, // Keep the prop name same for backward compatibility
  allowedRoles, // New optional prop that takes precedence
}: {
  children: React.ReactNode;
  requiredRole?: string; // Single role (original behavior)
  allowedRoles?: string[]; // New: Array of allowed roles
}) {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated()) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('callbackUrl', window.location.pathname);
      router.push(loginUrl.toString());
      return;
    }

    // Check access based on allowedRoles first, then fallback to requiredRole
    const userRole = user?.role.toLowerCase();
    let hasAccess = true;

    if (allowedRoles && allowedRoles.length > 0) {
      hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole);
    } else if (requiredRole) {
      hasAccess = requiredRole.toLowerCase() === userRole;
    }

    if (!hasAccess) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, user, requiredRole, allowedRoles]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Access check for render phase
  const userRole = user?.role.toLowerCase();
  let hasAccess = true;

  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole);
  } else if (requiredRole) {
    hasAccess = requiredRole.toLowerCase() === userRole;
  }

  if (!isAuthenticated() || !hasAccess) {
    return <RedirectScreen />;
  }

  return <>{children}</>;
}

// Keep the same helper components
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>Verifying authentication...</p>
      </div>
    </div>
  );
}

function RedirectScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>Redirecting...</p>
      </div>
    </div>
  );
}