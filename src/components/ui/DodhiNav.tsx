// components/DodhiNav.tsx
'use client';
import { Milk, ClipboardList, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DodhiNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 h-16">
      <Link 
        href="/dashboard/dodhi" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname === '/dashboard/dodhi' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Home</span>
      </Link>
      <Link 
        href="/Purchase/SimplePurchase" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname.startsWith('/purchase/SimplePurchase') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <Milk className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Purchase</span>
      </Link>
      <Link 
        href="/reports/purchase/dodhiPurchaseReport" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname.startsWith('/reports/purchase/dodhiPurchaseReport') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <ClipboardList className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Reports</span>
      </Link>
    </nav>
  );
}