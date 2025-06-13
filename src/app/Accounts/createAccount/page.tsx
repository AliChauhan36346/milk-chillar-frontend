'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { AccountFormModal } from '@/components/modals/AccountFormModal';
import ProtectedRoute from '@/components/ProtectedRoutes';

type AccountFormData = {
  main_account_id?: number;
  sub_account_id?: number;
  sub_account_code: string;
  name: string;
};

type MainAccount = {
  main_account_id: number;
  main_account_code: string;
  name: string;
  financial_statement_component: string;
};

type SubAccount = {
  sub_account_id: number;
  sub_account_code: string;
  name: string;
};

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams.get('id');
  const mainAccountId = searchParams.get('mainId');
  const subAccountId = searchParams.get('subId');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!accountId);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [formData, setFormData] = useState<AccountFormData>({
    main_account_id: mainAccountId ? parseInt(mainAccountId) : undefined,
    sub_account_id: subAccountId ? parseInt(subAccountId) : undefined,
    sub_account_code: '',
    name: ''
  });

  // Modal states
  const [isMainAccountModalOpen, setIsMainAccountModalOpen] = useState(false);
  const [isSubAccountModalOpen, setIsSubAccountModalOpen] = useState(false);

  useEffect(() => {
    fetchMainAccounts();
    if (accountId) {
      fetchAccountDetails();
    }
  }, [accountId]);

  useEffect(() => {
    if (formData.main_account_id) {
      fetchSubAccounts(formData.main_account_id);
    }
  }, [formData.main_account_id]);

  const fetchMainAccounts = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts/main');
      if (!response.ok) {
        throw new Error('Failed to fetch main accounts');
      }
      const data = await response.json();
      setMainAccounts(data);
    } catch (error) {
      console.error('Error fetching main accounts:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const fetchSubAccounts = async (mainAccountId: number) => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/accounts/sub?mainId=${mainAccountId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sub accounts');
      }
      const data = await response.json();
      setSubAccounts(data);
    } catch (error) {
      console.error('Error fetching sub accounts:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const fetchAccountDetails = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/accounts/${accountId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch account details');
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching account details:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts', {
        method: accountId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save account');
      }

      router.push('/Accounts/chartOfAccounts');
    } catch (error) {
      console.error('Error saving account:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMainAccount = async (data: any) => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts/main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create main account');
      }

      await fetchMainAccounts();
      setIsMainAccountModalOpen(false);
    } catch (error) {
      console.error('Error creating main account:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const handleCreateSubAccount = async (data: any) => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts/sub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create sub account');
      }

      if (formData.main_account_id) {
        await fetchSubAccounts(formData.main_account_id);
      }
      setIsSubAccountModalOpen(false);
    } catch (error) {
      console.error('Error creating sub account:', error);
      // TODO: Add proper error handling/notification
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">
              {accountId ? 'Edit Account' : 'Create New Account'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Main Account Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="main_account">Main Account</Label>
                  <button
                    type="button"
                    onClick={() => setIsMainAccountModalOpen(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>
                <Select
                  value={formData.main_account_id?.toString() || ''}
                  onChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    main_account_id: value ? parseInt(value) : undefined,
                    sub_account_id: undefined // Reset sub account when main account changes
                  }))}
                  options={mainAccounts.map(acc => ({
                    value: acc.main_account_id.toString(),
                    label: `${acc.name} (${acc.main_account_code})`
                  }))}
                  placeholder="Select a main account"
                  required={!accountId}
                  disabled={!!accountId || !!mainAccountId}
                />
              </div>

              {/* Sub Account Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="sub_account">Sub Account</Label>
                  <button
                    type="button"
                    onClick={() => setIsSubAccountModalOpen(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    disabled={!formData.main_account_id}
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>
                <Select
                  value={formData.sub_account_id?.toString() || ''}
                  onChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    sub_account_id: value ? parseInt(value) : undefined 
                  }))}
                  options={subAccounts.map(acc => ({
                    value: acc.sub_account_id.toString(),
                    label: `${acc.name} (${acc.sub_account_code})`
                  }))}
                  placeholder="Select a sub account"
                  required={!accountId}
                  disabled={!!accountId || !!subAccountId || !formData.main_account_id}
                />
              </div>

              {/* Account Code */}
              <div>
                <Label htmlFor="sub_account_code">Account Code</Label>
                <Input
                  id="sub_account_code"
                  value={formData.sub_account_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, sub_account_code: e.target.value }))}
                  placeholder="Enter account code"
                  required
                />
              </div>

              {/* Account Name */}
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter account name"
                  required
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Saving...' : accountId ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Create Main Account Modal */}
        <AccountFormModal
          isOpen={isMainAccountModalOpen}
          onClose={() => setIsMainAccountModalOpen(false)}
          onSubmit={handleCreateMainAccount}
          type="main"
        />

        {/* Create Sub Account Modal */}
        <AccountFormModal
          isOpen={isSubAccountModalOpen}
          onClose={() => setIsSubAccountModalOpen(false)}
          onSubmit={handleCreateSubAccount}
          type="sub"
          mainAccounts={mainAccounts}
        />
      </DynamicLayout>
    </ProtectedRoute>
  );
} 