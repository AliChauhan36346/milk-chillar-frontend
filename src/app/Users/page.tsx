'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip, StatItem } from '@/components/ui/StatStrip';
import { CompactToolbar } from '@/components/ui/CompactToolbar';
import { Table } from '@/components/ui/Table/Table';
import { Badge } from '@/components/ui/Badge';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { UserFormModal } from '@/components/features/users/UserFormModal';
import { ChangeCredentialsModal } from '@/components/features/users/ChangeCredentialsModal';
import { UserPermissionsModal } from '@/components/features/users/UserPermissionsModal';
import { CenteredSpinner } from '@/components/ui/spinner';
import {
  User,
  Role,
  getUsers,
  getRoles,
  deleteUser,
  toggleUserStatus
} from '@/lib/api/users';
import { useToast } from '@/hooks/useToast';
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Briefcase,
  Calendar
} from 'lucide-react';

export default function UsersPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [selectedUserForCredentials, setSelectedUserForCredentials] = useState<User | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load users and roles
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers({ pageSize: 100 }).catch(() => ({ items: [], totalCount: 0, pageNumber: 1, pageSize: 100 })),
        getRoles().catch(() => [])
      ]);
      setUsers(usersData.items || []);
      setRoles(rolesData || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast({
        title: 'Error',
        description: 'Failed to load user list.',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Status toggle handler
  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await toggleUserStatus(user);
      setUsers((prev) =>
        prev.map((u) => (u.userId === updated.userId ? updated : u))
      );
      toast({
        title: updated.isBlocked ? 'User Blocked' : 'User Activated',
        description: `User @${user.username} is now ${
          updated.isBlocked ? 'blocked' : 'active'
        }.`,
        variant: updated.isBlocked ? 'error' : 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update status',
        description: err.response?.data?.message || err.message,
        variant: 'error'
      });
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete.userId));
      toast({
        title: 'User Deleted',
        description: `User @${userToDelete.username} has been removed.`,
        variant: 'success'
      });
      setUserToDelete(null);
    } catch (err: any) {
      toast({
        title: 'Failed to delete user',
        description: err.response?.data?.message || err.message,
        variant: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        user.username.toLowerCase().includes(query) ||
        (user.roleName && user.roleName.toLowerCase().includes(query)) ||
        (user.employeeName && user.employeeName.toLowerCase().includes(query)) ||
        (user.supplierName && user.supplierName.toLowerCase().includes(query)) ||
        (user.buyerName && user.buyerName.toLowerCase().includes(query));

      const matchesRole =
        roleFilter === 'ALL' ||
        (user.roleId && user.roleId.toString() === roleFilter);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && !user.isBlocked) ||
        (statusFilter === 'BLOCKED' && user.isBlocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const stats: StatItem[] = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.isBlocked).length;
    const blocked = users.filter((u) => u.isBlocked).length;
    const admins = users.filter(
      (u) =>
        u.roleName?.toLowerCase().includes('admin') ||
        u.roleName?.toLowerCase().includes('manager')
    ).length;

    return [
      { label: 'Total Users', value: total, icon: <UsersIcon className="w-4 h-4" />, color: 'blue' },
      { label: 'Active Logins', value: active, icon: <UserCheck className="w-4 h-4" />, color: 'green' },
      { label: 'Blocked / Suspended', value: blocked, icon: <UserX className="w-4 h-4" />, color: 'red' },
      { label: 'Privileged Staff', value: admins, icon: <ShieldCheck className="w-4 h-4" />, color: 'amber' }
    ];
  }, [users]);

  // Role Badge Styling Helper
  const getRoleBadgeVariant = (roleName?: string | null): 'primary' | 'secondary' | 'destructive' | 'success' => {
    const role = (roleName || '').toLowerCase();
    if (role.includes('admin')) return 'primary';
    if (role.includes('manager')) return 'secondary';
    if (role.includes('dodhi')) return 'secondary';
    if (role.includes('chillar')) return 'success';
    return 'secondary';
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              User Management
              <Badge variant="secondary" className="text-xs font-normal">
                {users.length} Total
              </Badge>
            </span>
          }
          subtitle="Manage credentials, roles, granular access permissions, and linked staff accounts"
          actions={
            <button
              onClick={() => {
                setSelectedUserForEdit(null);
                setIsFormModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          }
        />

        {/* KPI Stat Strip */}
        <StatStrip items={stats} />

        {/* Compact Search & Filter Toolbar */}
        <CompactToolbar
          search={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: 'Search by username, role, or linked staff...'
          }}
          filters={
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId.toString()}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="BLOCKED">Blocked Only</option>
              </select>
            </div>
          }
          right={
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          }
        />

        {/* Desktop View: High-Density Table */}
        <div className="hidden md:block">
          <Table.Container>
            <Table dense>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="w-12 text-center" dense>#</Table.Head>
                  <Table.Head dense>User Account</Table.Head>
                  <Table.Head dense>Role</Table.Head>
                  <Table.Head dense>Linked Entity</Table.Head>
                  <Table.Head dense>Status</Table.Head>
                  <Table.Head dense>Created</Table.Head>
                  <Table.Head className="text-right" dense>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={7} className="h-32 text-center text-xs text-gray-400">
                      <CenteredSpinner message="Loading user accounts..." />
                    </Table.Cell>
                  </Table.Row>
                ) : filteredUsers.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={7} className="h-32 text-center text-xs text-gray-400">
                      No user accounts found matching your criteria.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const linkedName =
                      user.employeeName || user.supplierName || user.buyerName;
                    const linkedType = user.employeeName
                      ? 'Employee'
                      : user.supplierName
                      ? 'Supplier'
                      : user.buyerName
                      ? 'Buyer'
                      : null;

                    return (
                      <Table.Row key={user.userId} className="hover:bg-blue-50/20 transition-colors">
                        <Table.Cell className="text-center font-mono text-xs text-gray-400" dense>
                          {idx + 1}
                        </Table.Cell>

                        {/* Username & Avatar */}
                        <Table.Cell dense>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                              {user.username.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                @{user.username}
                              </div>
                              <div className="text-[10px] text-gray-400 capitalize">
                                {user.userType || 'standard'}
                              </div>
                            </div>
                          </div>
                        </Table.Cell>

                        {/* Role */}
                        <Table.Cell dense>
                          <Badge variant={getRoleBadgeVariant(user.roleName)} className="text-[11px] capitalize">
                            {user.roleName || 'Unassigned'}
                          </Badge>
                        </Table.Cell>

                        {/* Linked Entity */}
                        <Table.Cell dense>
                          {linkedName ? (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <div>
                                <div className="text-xs font-medium text-gray-800">{linkedName}</div>
                                <div className="text-[10px] text-gray-400">{linkedType}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Independent</span>
                          )}
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell dense>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            title={user.isBlocked ? 'Click to activate' : 'Click to block'}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              user.isBlocked
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {user.isBlocked ? (
                              <>
                                <Lock className="w-2.5 h-2.5" /> Blocked
                              </>
                            ) : (
                              <>
                                <Unlock className="w-2.5 h-2.5" /> Active
                              </>
                            )}
                          </button>
                        </Table.Cell>

                        {/* Created Date */}
                        <Table.Cell className="text-xs text-gray-500 whitespace-nowrap" dense>
                          {user.createdAt ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : (
                            '—'
                          )}
                        </Table.Cell>

                        {/* Action Buttons */}
                        <Table.Cell className="text-right" dense>
                          <div className="flex items-center justify-end gap-1">
                            {/* Permissions */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForPermissions(user);
                                setIsPermissionsModalOpen(true);
                              }}
                              title="Manage Permissions"
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            {/* Credentials */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForCredentials(user);
                                setIsCredentialsModalOpen(true);
                              }}
                              title="Change Password / Username"
                              className="p-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {/* Edit Profile */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForEdit(user);
                                setIsFormModalOpen(true);
                              }}
                              title="Edit User Profile"
                              className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              title="Delete User"
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </Table.Container>
        </div>

        {/* Mobile View: Responsive Cards */}
        <div className="md:hidden space-y-2.5">
          {isLoading ? (
            <div className="py-6 bg-white rounded-xl border border-gray-100">
              <CenteredSpinner message="Loading user accounts..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-100">
              No user accounts found matching your criteria.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.userId}
                className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">@{user.username}</h4>
                      <span className="text-[10px] text-gray-400 capitalize">{user.userType || 'standard'}</span>
                    </div>
                  </div>

                  <Badge variant={getRoleBadgeVariant(user.roleName)} className="text-[10px]">
                    {user.roleName || 'Unassigned'}
                  </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Linked Entity</span>
                    <span className="font-medium text-gray-700 truncate block">
                      {user.employeeName || user.supplierName || user.buyerName || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Status</span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${
                        user.isBlocked
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForPermissions(user);
                      setIsPermissionsModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Permissions
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForCredentials(user);
                      setIsCredentialsModalOpen(true);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserForEdit(user);
                      setIsFormModalOpen(true);
                    }}
                    className="p-1 text-gray-500 hover:text-purple-600 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserToDelete(user)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Create & Edit User */}
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          user={selectedUserForEdit}
          onSuccess={loadData}
        />

        {/* Modal: Change Credentials */}
        <ChangeCredentialsModal
          isOpen={isCredentialsModalOpen}
          onClose={() => setIsCredentialsModalOpen(false)}
          user={selectedUserForCredentials}
          onSuccess={loadData}
        />

        {/* Modal: User Permissions */}
        <UserPermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          user={selectedUserForPermissions}
          onSuccess={loadData}
        />

        {/* Modal: Confirmation to Delete User */}
        <ConfirmationModal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete user account @${userToDelete?.username}? This action cannot be undone.`}
          confirmLabel="Delete User"
          isDestructive={true}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}
