# Milk Chillar Frontend Components Documentation

## Layout Components

### PageLayout
**Path:** `src/components/layouts/PageLayout.tsx`
**Props:**
```typescript
{
  children: React.ReactNode;
  role?: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge' | 'buyer' | 'supplier';
  showSidebar?: boolean;
  showHeader?: boolean;
  showChatBot?: boolean;
  contentClassName?: string;
  navigation?: NavigationSection[];
  isSidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}
```
**Description:** Main layout component that provides the basic structure for all pages including header, sidebar, and content area.

### AdminLayout
**Path:** `src/components/layouts/AdminLayout.tsx`  
**Description:** Specialized layout for admin pages with admin-specific navigation and features.

### DashboardLayout
**Path:** `src/components/layouts/DashboardLayout.tsx`  
**Description:** Layout for dashboard pages with role-based customization.

## UI Components

### Button
**Path:** `src/components/ui/Button.tsx`
**Props:**
```typescript
{
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  // Extends standard button HTML attributes
}
```
**Description:** Customizable button component with different variants and sizes.

### Card
**Path:** `src/components/ui/card.tsx`
**SubComponents:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title component
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section
- `CardAction` - Action area (usually for buttons)

### Input
**Path:** `src/components/ui/Input.tsx`
**Props:**
```typescript
{
  error?: string;
  className?: string;
  // Extends standard input HTML attributes
}
```
**Description:** Enhanced input component with error handling and styling.

### Select
**Path:** `src/components/ui/Select.tsx`
**Props:**
```typescript
{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; }[];
  placeholder?: string;
  className?: string;
  error?: string;
  id?: string;
  disabled?: boolean;
}
```
**Description:** Customized select component with support for options and error states.

### SearchableSelect
**Path:** `src/components/ui/SearchableSelect.tsx`
**Props:**
```typescript
{
  value: T | undefined;
  onSearch: (query: string) => Promise<T[]>;
  onChange: (value: T | undefined) => void;
  placeholder?: string;
  label?: string;
  clearable?: boolean;
  showBalanceInline?: boolean;
}
```
**Description:** Advanced select component with search functionality.

### Table
**Path:** `src/components/ui/Table/Table.tsx`
**SubComponents:**
- `Table` - Main container
- `Table.Header` - Table header
- `Table.Body` - Table body
- `Table.Row` - Table row
- `Table.Cell` - Table cell
- `Table.Head` - Header cell

### Badge
**Path:** `src/components/ui/Badge.tsx`
**Props:**
```typescript
{
  variant?: 'primary' | 'secondary' | 'destructive' | 'success';
  className?: string;
}
```
**Description:** Label component for status and tags.

### SummaryCard
**Path:** `src/components/ui/SummaryCard.tsx`
**Props:**
```typescript
{
  title: string;
  value: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  className?: string;
  subtitle?: string;
}
```
**Description:** Card component for displaying summary information with icons.

## Form Components

### SalesFormModal
**Path:** `src/components/modals/SalesFormModal.tsx`
**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuyerFormData) => void;
  initialData?: Partial<BuyerFormData>;
  buyerName: string;
  buyerId: string;
  date: string;
  isAdmin: boolean;
  isFromAddedList: boolean;
  revenueAccounts: RevenueAccount[];
  formValues: {
    grossLiters: number;
    lr: number;
    fat: number;
    netLiters: number;
    rate: number;
    amount: number;
    amountReceived: number;
    revenueAccountId: number;
  };
  onInputChange: (field: string, value: number) => void;
}
```

### PurchaseModal
**Path:** `src/components/modals/PurchaseModal.tsx`
**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    morningQuantity?: number; 
    eveningQuantity?: number;
    rate?: number;
    date: string;
    expenseAccountId?: number;
  }) => void;
  supplier: {
    id: number;
    name: string;
    code: string;
    rate: number;
  };
  availableTimes: ('morning' | 'evening')[];
  isAdmin: boolean;
  expenseAccounts: ExpenseAccount[];
  selectedExpenseAccount: number | null;
  isUpdate: boolean;
  updateData?: {
    time: 'morning' | 'evening';
    purchaseId: number;
    currentQuantity: number;
  };
  initialDate: string;
}
```

## Utility Components

### Loader
**Path:** `src/components/ui/Loader.tsx`
**Props:**
```typescript
{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### BackButton
**Path:** `src/components/ui/BackButton.tsx`
**Props:**
```typescript
{
  href?: string;
}
```

### Pagination
**Path:** `src/components/ui/Pagination.tsx`
**Props:**
```typescript
{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### Toast
**Path:** `src/hooks/useToast.tsx`
**Usage:**
```typescript
const { toast } = useToast();
toast({
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
});
```

## Protected Routes
**Path:** `src/components/ProtectedRoutes.tsx`
**Props:**
```typescript
{
  children: React.ReactNode;
  requiredRole: string;
}
```
**Description:** Component for role-based access control.

## Hooks and Context

### useAuth
**Path:** `src/hooks/useAuth.ts`
**Returns:**
```typescript
{
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

### useUserRole
**Path:** `src/hooks/useUserRole.ts`
**Returns:**
```typescript
{
  role: string | null;
  hasRole: (requiredRole: string) => boolean;
}
```

### AuthContext
**Path:** `src/lib/auth/AuthContext.tsx`
**Props:**
```typescript
{
  children: React.ReactNode;
}
```
**Provides:** Authentication context for the application.

## List Components

### RemainingList
**Path:** `src/components/ui/List/RemainingList.tsx`
**Props:**
```typescript
{
  title: string;
  items: T[];
  getKey: (item: T) => string;
  getName: (item: T) => string;
  getId: (item: T) => string;
  getStatusLabel: (item: T) => React.ReactNode;
  onItemClick: (item: T) => void;
  icon?: React.ReactNode;
  colorClass?: string;
}
```
**Description:** Generic list component for displaying remaining items.

## Special Components

### ParchiPrintSlip
**Path:** `src/components/ui/ParchiPrintSlip.tsx`
**Props:**
```typescript
{
  parchi: ParchiDto;
  startDate: string;
  endDate: string;
  companyName?: string;
  companyLogo?: string;
}
```
**Description:** Component for generating and printing parchi slips.

## Navigation Components

### ChillarNav
**Path:** `src/components/ui/ChillarNav.tsx`
**Description:** Navigation component specific to Chillar Incharge role.

### DodhiNav
**Path:** `src/components/ui/DodhiNav.tsx`
**Description:** Navigation component specific to Dodhi role.

## Provider Components

### ClientProviders
**Path:** `src/app/client-providers.tsx`
**Props:**
```typescript
{
  children: React.ReactNode;
}
```
**Description:** Root providers for client-side functionality including authentication and toast notifications.