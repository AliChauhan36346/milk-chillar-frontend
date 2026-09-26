'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/Modal/BaseModal';
import { UserPlus, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User, Role, getRoles, createUser, updateUser } from '@/lib/api/users';
import { getEmployees, Employee } from '@/lib/api/employees';
import { useToast } from '@/hooks/useToast';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null; // null for Create, User object for Edit
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEditing = Boolean(user);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [userType, setUserType] = useState('standard');
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [isBlocked, setIsBlocked] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (user) {
        setUsername(user.username);
        setPassword('');
        setRoleId(user.roleId ?? '');
        setUserType(user.userType || 'standard');
        setEmployeeId(user.employeeId ?? '');
        setIsBlocked(user.isBlocked ?? false);
      } else {
        setUsername('');
        setPassword('');
        setRoleId('');
        setUserType('standard');
        setEmployeeId('');
        setIsBlocked(false);
      }
      setError(null);
    }
  }, [isOpen, user]);

  const loadDropdownData = async () => {
    setIsLoadingMetadata(true);
    try {
      const [fetchedRoles, fetchedEmployees] = await Promise.all([
        getRoles().catch(() => []),
        getEmployees().catch(() => [])
      ]);
      setRoles(fetchedRoles);
      setEmployees(fetchedEmployees);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!isEditing && (!password || password.length < 4)) {
      setError('Password must be at least 4 characters for new users.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && user) {
        await updateUser(user.userId, {
          username: username.trim(),
          roleId: roleId !== '' ? Number(roleId) : null,
          userType,
          employeeId: employeeId !== '' ? Number(employeeId) : null,
          isBlocked
        });
        toast({
          title: 'User Updated',
          description: `User @${username} has been updated successfully.`,
          variant: 'success'
        });
      } else {
        await createUser({
          username: username.trim(),
          password: password,
          roleId: roleId !== '' ? Number(roleId) : null,
          userType,
          employeeId: employeeId !== '' ? Number(employeeId) : null,
          isBlocked
        });
        toast({
          title: 'User Created',
          description: `User @${username} has been created successfully.`,
          variant: 'success'
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Operation failed';
      setError(typeof msg === 'string' ? msg : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit User Profile' : 'Create New User'}
      subtitle={
        isEditing
          ? `Modify user role and profile details for @${user?.username}`
          : 'Create a new user account with role and credentials'
      }
      icon={isEditing ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
      iconClassName={isEditing ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Username */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. javed_chillar"
            />
          </div>

          {/* Password (only on create) */}
          {!isEditing && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 font-mono"
                  placeholder="At least 4 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Select a Role...</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              User Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="standard">Standard User</option>
              <option value="admin">Administrator</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          {/* Linked Employee */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Link to Employee (Staff Member)
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">None (Independent Login)</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.fullName} ({emp.designation})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">
              Links this login account with employee records, salaries, or milk collection duties.
            </p>
          </div>

          {/* Blocked Status */}
          <div className="sm:col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-800">Account Access Status</span>
              <p className="text-[11px] text-gray-500">
                {isBlocked ? 'Account is currently blocked / suspended' : 'Account is active and can login'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBlocked(!isBlocked)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isBlocked ? 'bg-green-600' : 'bg-red-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  !isBlocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingMetadata}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
