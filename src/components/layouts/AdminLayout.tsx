'use client';
import { useState, useEffect } from 'react';
import { PageLayout } from './PageLayout';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart2,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Scale,
  Wallet,
  Building2,
  IndianRupee,
  Receipt,
  BookOpen,
  Building,
  Banknote,
  ClipboardList,
  DollarSign
} from 'lucide-react';
import { Label } from '../ui/Label';

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
      {
        label: 'Accounts',
        icon: <Wallet size={18} />,
        href: '/Accounts',
        subItems: [
          { label: 'Chart of Accounts', href: '/Accounts/chartOfAccounts', icon: <FileText size={18} /> },
          { label: 'Account Ledgers', href: '/Accounts/accountLedger', icon: <BookOpen size={18} /> }
        ]
      },
      {
        label: 'Payments & Receipts',
        icon: <IndianRupee size={18} />,
        href: '/Accounts/transactions',
        subItems: [
          { label: 'Roznamcha', href: '/Accounts/transactions', icon: <BookOpen size={18} /> },
          { label: 'Payments', href: '/Accounts/transactions/cashPayments', icon: <Banknote size={18} /> },
          //{ label: 'Bank Payments', href: '/Accounts/transactions/bank', icon: <Building size={18} /> },
          { label: 'Receipts', href: '/Accounts/transactions/receipts/create', icon: <Receipt size={18} /> }
        ]
      },
      { label: 'Opening Balances', href: '/Accounts/openingBalances', icon: <Scale size={18} /> },
      { label: 'Supplier Parchi', href: '/Accounts/parchi', icon: <FileText size={18} /> }
    ]
  },
  {
    section: 'Reports',
    items: [
      { label: 'Daily Totals', href: '/reports/daily-totals', icon: <BarChart2 size={18} /> },
      {
        label: 'Milk & Operations',
        icon: <ClipboardList size={18} />,
        href: '/reports/transactions',
        subItems: [
          { label: 'Purchase Report', href: '/reports/purchase/purchaseReport', icon: <ShoppingCart size={18} /> },
          { label: 'Sales Report', href: '/reports/sale', icon: <ShoppingBag size={18} /> },
          { label: 'Chillar Receive Report', href: '/reports/chillarReceive', icon: <Scale size={18} /> },
          { label: 'Dodhi Report', href: '/reports/dodhiSummary', icon: <FileText size={18} /> }
        ]
      },
      {
        label: 'Financial Reports',
        icon: <Wallet size={18} />,
        href: '/reports/financial',
        subItems: [
          { label: 'Account Balances', href: '/reports/financialReports/accountBalances', icon: <Wallet size={18} /> },
          { label: 'Profit & Loss', href: '/reports/financialReports/profitLoss', icon: <DollarSign size={18} /> },
          { label: 'Trial Balance', href: '/reports/financial/trial-balance', icon: <Scale size={18} /> },
          { label: 'Balance Sheet', href: '/reports/financial/balance-sheet', icon: <FileText size={18} /> }
        ]
      }
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

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <PageLayout
      role="admin"
      showSidebar={true}
      showHeader={true}
      showChatBot={false}
      navigation={adminNavigation}
      isSidebarCollapsed={isSidebarCollapsed}
      toggleSidebar={toggleSidebar}
    >
      {children}
    </PageLayout>
  );
}