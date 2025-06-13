'use client';
import { useState } from 'react';
import { PageLayout } from './PageLayout';
import { 
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart2,
  Package,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Scale,
  Wallet,
  Building2,
  IndianRupee,
  Receipt
} from 'lucide-react';

const adminNavigation = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Overview', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> }
    ]
  },
  {
    section: 'Operations',
    items: [
      { label: 'Sales', href: '/Sales', icon: <ShoppingBag size={18} /> },
      { label: 'Purchase', href: '/Purchase/SimplePurchase', icon: <ShoppingCart size={18} /> },
      { label: 'Stock', href: '/Stock', icon: <Package size={18} /> },
      { label: 'Chillar Receive', href: '/chillarReceive', icon: <Scale size={18} /> }
    ]
  },
  {
    section: 'Partners',
    items: [
      { label: 'Buyers', href: '/Buyers', icon: <Building2 size={18} /> },
      { label: 'Suppliers', href: '/Suppliers', icon: <Truck size={18} /> },
      { label: 'Employees', href: '/Employees', icon: <Users size={18} /> }
    ]
  },
  {
    section: 'Finance',
    items: [
      { label: 'Accounts', href: '/Accounts', icon: <Wallet size={18} /> },
      { label: 'Payments', href: '/Accounts/payments', icon: <IndianRupee size={18} /> },
      { label: 'Invoices', href: '/Accounts/invoices', icon: <Receipt size={18} /> }
    ]
  },
  {
    section: 'Reports',
    items: [
      { label: 'Financial Reports', href: '/reports/financial', icon: <BarChart2 size={18} /> },
      { label: 'Inventory Reports', href: '/reports/inventory', icon: <FileText size={18} /> }
    ]
  },
  {
    section: 'System',
    items: [
      { label: 'Users', href: '/Users', icon: <Users size={18} /> },
      { label: 'Settings', href: '/System', icon: <Settings size={18} /> }
    ]
  }
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <PageLayout
      role="admin"
      showSidebar={true}
      showHeader={true}
      showChatBot={false}
      navigation={adminNavigation}
      isSidebarCollapsed={isSidebarCollapsed}
      toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    >
      {children}
    </PageLayout>
  );
}