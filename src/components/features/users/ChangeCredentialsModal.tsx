'use client';

import React, { useState, useEffect } from 'react';
import { BaseModal } from '@/components/ui/Modal/BaseModal';
import { KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { User, updateUser } from '@/lib/api/users';
import { useToast } from '@/hooks/useToast';

interface ChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const ChangeCredentialsModal: React.FC<ChangeCredentialsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUser(user.userId, {
        username: username.trim(),
        password: newPassword ? newPassword : undefined,
        roleId: user.roleId,
        userType: user.userType,
        isBlocked: user.isBlocked,
        employeeId: user.employeeId,
        supplierId: user.supplierId,
        buyerId: user.buyerId,
      });

      toast({
        title: 'Credentials Updated',
        description: `Credentials for "${username}" have been updated successfully.`,
        variant: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to update credentials';
      setError(typeof msg === 'string' ? msg : 'Failed to update credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Credentials"
      subtitle={user ? `Update login credentials for @${user.username}` : undefined}
      icon={<KeyRound className="w-5 h-5" />}
      iconClassName="bg-amber-50 text-amber-600"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Enter username"
          />
        </div>

        {/* New Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              New Password
            </label>
            <span className="text-[11px] text-gray-400">Leave blank to keep existing</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10 transition-all font-mono"
              placeholder="Enter new password (optional)"
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

        {/* Confirm Password Input */}
        {newPassword && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
              placeholder="Re-type new password"
            />
            {newPassword && confirmPassword && (
              <p
                className={`text-[11px] mt-1 flex items-center gap-1 ${
                  newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {newPassword === confirmPassword ? (
                  <>
                    <Check className="w-3 h-3" /> Passwords match
                  </>
                ) : (
                  'Passwords do not match'
                )}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Save Credentials
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
