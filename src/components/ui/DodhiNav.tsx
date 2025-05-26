// components/DodhiNav.tsx
'use client';
import { Milk, ClipboardList, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DodhiNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3">
      <Link href="/dashboard/dodhi" className="flex flex-col items-center">
        <Home className={`w-6 h-6 ${pathname === '/dashboard/dodhi' ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link href="/purchase" className="flex flex-col items-center">
        <Milk className={`w-6 h-6 ${pathname.startsWith('/purchase') ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="text-xs mt-1">Purchase</span>
      </Link>
      <Link href="/reports" className="flex flex-col items-center">
        <ClipboardList className={`w-6 h-6 ${pathname.startsWith('/reports') ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="text-xs mt-1">Reports</span>
      </Link>
    </nav>
  );
}