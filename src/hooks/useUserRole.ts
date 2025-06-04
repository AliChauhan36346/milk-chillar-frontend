// hooks/useUserRole.ts
'use client';
import { useEffect, useState } from 'react';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get role from localStorage (set during login)
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setRole(parsed.role?.toLowerCase());
      } catch (err) {
        console.error('Error parsing user info:', err);
      }
    }
    setIsLoading(false);
  }, []);

  return { role, isLoading };
}