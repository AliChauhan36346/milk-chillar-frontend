'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BaseModal } from '@/components/ui/Modal/BaseModal';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  User,
  SystemPermission,
  getAllPermissions,
  getUserEffectivePermissions,
  syncUserPermissions,
  UserEffectivePermissions
} from '@/lib/api/users';
import { useToast } from '@/hooks/useToast';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  matcher: (permName: string) => boolean;
}

const CATEGORIES: PermissionCategory[] = [
  {
    id: 'operations',
    name: 'Milk & Operations',
    description: 'Purchase entry, Sales, Chillar receives, and Stock tracking',
    icon: '🥛',
    matcher: (name) =>
      name.startsWith('purchase.') ||
      name.startsWith('sales.') ||
      name.startsWith('chillar.') ||
      name.startsWith('chillarreceive.') ||
      name.startsWith('stock.')
  },
  {
    id: 'finance',
    name: 'Accounts & Finance',
    description: 'Chart of accounts, Roznamcha, Parchi, Ledgers, Receipts, and Payments',
    icon: '💰',
    matcher: (name) =>
      name.startsWith('account.') ||
      name.startsWith('mainaccount.') ||
      name.startsWith('subaccount.') ||
      name.startsWith('openingBalance.') ||
      name.startsWith('cashPayment.') ||
      name.startsWith('cashReceipt.') ||
      name.startsWith('bankPayment.') ||
      name.startsWith('bankReceipt.') ||
      name.startsWith('ledger.') ||
      name.startsWith('parchi.') ||
      name.startsWith('roznamcha.') ||
      name.startsWith('profitloss.')
  },
  {
    id: 'partners',
    name: 'Partners & People',
    description: 'Suppliers, Buyers, and Employee staff directory',
    icon: '👥',
    matcher: (name) =>
      name.startsWith('supplier.') ||
      name.startsWith('buyer.') ||
      name.startsWith('employee.')
  },
  {
    id: 'reports',
    name: 'Dashboard & Reports',
    description: 'Executive dashboard KPIs and analytical reporting',
    icon: '📊',
    matcher: (name) =>
      name.startsWith('dashboard.') ||
      name.startsWith('reports.')
  },
  {
    id: 'system',
    name: 'Security & System',
    description: 'User accounts, Roles, and Permission assignments',
    icon: '⚙️',
    matcher: (name) =>
      name.startsWith('user.') ||
      name.startsWith('userpermission.') ||
      name.startsWith('role.') ||
      name.startsWith('rolepermission.') ||
      name.startsWith('permission.') ||
      name.startsWith('users.')
  }
];

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { toast } = useToast();
  const [allPermissions, setAllPermissions] = useState<SystemPermission[]>([]);
  const [effectiveData, setEffectiveData] = useState<UserEffectivePermissions | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const [permissions, effective] = await Promise.all([
        getAllPermissions(),
        getUserEffectivePermissions(user.userId)
      ]);

      setAllPermissions(permissions);
      setEffectiveData(effective);
      setSelectedIds(new Set(effective.directUserPermissionIds));
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError('Failed to load user permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleToggleCategory = (categoryPermissions: SystemPermission[]) => {
    const catIds = categoryPermissions.map((p) => p.permissionId);
    const allSelected = catIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        catIds.forEach((id) => next.delete(id));
      } else {
        catIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError(null);

    try {
      await syncUserPermissions(user.userId, Array.from(selectedIds));
      toast({
        title: 'Permissions Updated',
        description: `Successfully updated permissions for user @${user.username}`,
        variant: 'success'
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save permissions';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Group permissions into categories
  const categorized = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();
    const filtered = allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search))
    );

    const result: { category: PermissionCategory; items: SystemPermission[] }[] = [];
    const matchedIds = new Set<number>();

    for (const cat of CATEGORIES) {
      const items = filtered.filter((p) => cat.matcher(p.name));
      items.forEach((p) => matchedIds.add(p.permissionId));
      if (items.length > 0) {
        result.push({ category: cat, items });
      }
    }

    const otherItems = filtered.filter((p) => !matchedIds.has(p.permissionId));
    if (otherItems.length > 0) {
      result.push({
        category: {
          id: 'other',
          name: 'Other Operations',
          description: 'General system permissions',
          icon: '📦',
          matcher: () => true
        },
        items: otherItems
      });
    }

    return result;
  }, [allPermissions, searchQuery]);

  const rolePermissionIds = useMemo(() => {
    return new Set(effectiveData?.rolePermissionIds || []);
  }, [effectiveData]);

  const totalEffectiveCount = useMemo(() => {
    const directNames = allPermissions
      .filter((p) => selectedIds.has(p.permissionId))
      .map((p) => p.name);
    const roleNames = effectiveData?.rolePermissionNames || [];
    return new Set([...directNames, ...roleNames]).size;
  }, [selectedIds, effectiveData, allPermissions]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Permissions & Access Control"
      subtitle={
        user
          ? `Configure access capabilities for @${user.username} (Role: ${user.roleName || 'None'})`
          : undefined
      }
      icon={<ShieldCheck className="w-5 h-5" />}
      iconClassName="bg-blue-50 text-blue-600"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col max-h-[75vh]">
        {/* Top Info Ribbon */}
        <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Effective Active: <strong className="text-blue-700">{totalEffectiveCount}</strong>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-gray-600">
              Direct Grants: <strong className="text-gray-900">{selectedIds.size}</strong>
            </span>
            {user?.roleName && (
              <>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Lock className="w-3 h-3 text-purple-500" />
                  Role ({user.roleName}): <strong>{rolePermissionIds.size}</strong>
                </span>
              </>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search permissions..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="m-3 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Permissions Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading permission catalog...</span>
            </div>
          ) : categorized.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No matching permissions found for "{searchQuery}"
            </div>
          ) : (
            categorized.map(({ category, items }) => {
              const isCollapsed = collapsedCategories[category.id] ?? false;
              const catIds = items.map((p) => p.permissionId);
              const selectedCount = catIds.filter((id) => selectedIds.has(id)).length;
              const isAllSelected = selectedCount === items.length;

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs"
                >
                  {/* Category Header */}
                  <div className="px-3.5 py-2.5 bg-gray-50/60 border-b border-gray-100 flex items-center justify-between select-none">
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(category.id)}
                      className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-base">{category.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          {category.name}
                          <span className="text-[10px] font-normal text-gray-400">
                            ({selectedCount}/{items.length} granted)
                          </span>
                        </h4>
                        <p className="text-[10px] text-gray-400 hidden sm:block">
                          {category.description}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(items)}
                        className="px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:text-blue-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        {isAllSelected ? (
                          <>
                            <Square className="w-3 h-3 text-gray-400" /> Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3 h-3 text-blue-500" /> Select All
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  {!isCollapsed && (
                    <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white">
                      {items.map((perm) => {
                        const isDirectlyGranted = selectedIds.has(perm.permissionId);
                        const isInheritedFromRole = rolePermissionIds.has(perm.permissionId);
                        const isEffective = isDirectlyGranted || isInheritedFromRole;

                        return (
                          <div
                            key={perm.permissionId}
                            onClick={() => handleTogglePermission(perm.permissionId)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                              isDirectlyGranted
                                ? 'bg-blue-50/60 border-blue-200'
                                : isInheritedFromRole
                                ? 'bg-purple-50/30 border-purple-100 hover:border-purple-200'
                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDirectlyGranted}
                              onChange={() => {}} // handled by parent div onClick
                              className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 pointer-events-none"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-mono font-medium leading-none ${
                                    isDirectlyGranted
                                      ? 'text-blue-900 font-semibold'
                                      : isInheritedFromRole
                                      ? 'text-purple-900'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {perm.name}
                                </span>

                                {isInheritedFromRole && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 bg-purple-100/80 text-purple-700 rounded font-sans font-medium">
                                    <Lock className="w-2.5 h-2.5" />
                                    via {user?.roleName || 'Role'}
                                  </span>
                                )}

                                {isDirectlyGranted && (
                                  <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded font-sans font-medium">
                                    Direct
                                  </span>
                                )}
                              </div>

                              {perm.description && (
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-[11px] text-gray-500">
            {selectedIds.size} direct permissions will be synced
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
