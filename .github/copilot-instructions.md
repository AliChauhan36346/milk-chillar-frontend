# Copilot Instructions for milk-chillar-frontend

## Project Overview
This is a Next.js application for a dairy business management system with features for managing sales, purchases, inventory, accounts, and different user roles (Admin, Manager, Dodhi, Chillar Incharge).

## Architecture Patterns

### Role-Based Layouts
The app uses a hierarchical layout system:
- `PageLayout`: Base layout component with common UI elements (Header, Sidebar, ChatBot)
- Role-specific layouts extend PageLayout:
  - `AdminLayout`: Full admin dashboard with complete navigation
  - `ManagerLayout`: Simplified dashboard for managers
  - `FieldStaffLayout`: Mobile-friendly layout for field staff (Dodhi/Chillar Incharge)
- `DynamicLayout`: Smart layout wrapper that renders the correct layout based on user role

Example usage:
```tsx
<DynamicLayout allowedRoles={['admin', 'manager']}>
  {/* Page content */}
</DynamicLayout>
```

### API & Data Flow
- API endpoints are organized in `src/lib/api/`
- Each feature has its own API module (e.g., `roznamcha.ts`, `employees.ts`)
- Uses React Query for server state management
- Follows RESTful patterns with typed request/response DTOs

### Authentication & Authorization
- Protected routes using `ProtectedRoutes` component
- Role-based access control through `useUserRole` hook
- Role types: 'admin' | 'manager' | 'dodhi' | 'chillarIncharge'
- Access checks in both layouts and individual pages

### UI Components & Styling
- Component library in `src/components/ui/`
- Uses Tailwind CSS for styling
- Consistent component patterns:
  - Card-based layouts
  - Responsive design with mobile-first approach
  - Form components with consistent styling
- Common layout patterns:
  - Header with page title and actions
  - Filter/search sections
  - Data tables/lists with pagination

## Development Workflow

### Getting Started
1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

### Project Structure
- `src/app/`: Next.js app router pages
- `src/components/`: Reusable UI components
- `src/lib/`: API and utility functions
- `src/hooks/`: Custom React hooks

### Key Components to Know
- `Card`, `Button`, `Input`, `Select`: Base UI components
- `DocumentHeader`, `TransactionLines`: Domain-specific components
- `ProtectedRoutes`: Auth wrapper for protected pages
- `DynamicLayout`: Smart layout switcher

### Conventions
1. Page Structure:
   - 'use client' directive at top
   - Layout wrapper with role check
   - Loading/error states
   - Main content with consistent spacing

2. Data Fetching:
   - Use React Query hooks for API calls
   - Handle loading/error states consistently
   - Implement proper type safety

3. Form Handling:
   - Consistent form layout using Card components
   - Use shared form components from ui/
   - Implement proper validation

4. Navigation:
   - Use Next.js Link for client-side navigation
   - Follow role-based menu structure
   - Implement proper breadcrumbs/back buttons

## Common Tasks

### Adding a New Page
1. Create page in appropriate route directory
2. Wrap with DynamicLayout and specify allowed roles
3. Implement loading and error states
4. Use consistent UI patterns from existing pages

### Adding New Features
1. Add API endpoint in `src/lib/api/`
2. Create necessary UI components in `src/components/`
3. Implement page with proper layout and role checks
4. Follow existing patterns for data fetching and state management

### Modifying Navigation
1. Update relevant layout component (AdminLayout, ManagerLayout, etc.)
2. Follow existing navigation structure pattern
3. Update role-based access controls if needed