// components/ChillarNav.tsx
'use client';
import { Home, ClipboardList, Truck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChillarNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 h-16">
      <Link 
        href="/dashboard/chillarIncharge" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname === '/dashboard/ChillarIncharge' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Home</span>
      </Link>
      <Link 
        href="/chillarReceive" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname.startsWith('/chillarReceive') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <Truck className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Receive</span>
      </Link>
      <Link 
        href="/Sales" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname.startsWith('/Sales') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <ShoppingCart className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Sales</span>
      </Link>
      <Link 
        href="/reports/chillar" 
        className="flex flex-col items-center justify-center p-1 w-full"
      >
        <div className={`p-1 rounded-full ${pathname.startsWith('/chillar/reports') ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}>
          <ClipboardList className="w-5 h-5" />
        </div>
        <span className="text-xs mt-0.5">Reports</span>
      </Link>
    </nav>
  );
}