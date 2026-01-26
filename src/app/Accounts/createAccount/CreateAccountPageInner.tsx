'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import AccountFormModal from '@/components/modals/AccountFormModal';
import ProtectedRoute from '@/components/ProtectedRoutes';
import {
  getMainAccounts,
  getSubAccounts,
  createMainAccount,
  createSubAccount,
  createAccount,
  updateAccount,
  getAccountById,
  getMainAccountById,
  getSubAccountById,
  MainAccount,
  SubAccount,
  type CreateAccountRequest
} from '@/lib/api/accounts';
import { useAuth } from '@/lib/auth/AuthContext';
import { SuccessMessage } from '@/components/ui/SuccessMessage';

type AccountFormData = {
  mainAccountId?: number;
  subAccountId?: number;
  name: string;
};

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const accountId = searchParams.get('id');
  const mainAccountId = searchParams.get('mainId');
  const subAccountId = searchParams.get('subId');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [formData, setFormData] = useState<AccountFormData>({
    mainAccountId: mainAccountId ? parseInt(mainAccountId) : undefined,
    subAccountId: subAccountId ? parseInt(subAccountId) : undefined,
    name: ''
  });

  // Modal states
  const [isMainAccountModalOpen, setIsMainAccountModalOpen] = useState(false);
  const [isSubAccountModalOpen, setIsSubAccountModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Always fetch main accounts list for the dropdown
        await fetchMainAccounts();

        if (accountId) {
          // Edit Mode: Fetch account details
          const account = await getAccountById(parseInt(accountId));
          if (account) {
            // We need to find the mainAccountId from the subAccountId
            // But the getAccountById response might not include the full hierarchy directly if the API doesn't support it purely.
            // Assuming Account model has subAccountId.

            // We need to get subAccount details to know the mainAccountId
            const subAccount = await getSubAccountById(account.subAccountId);

            setFormData({
              mainAccountId: subAccount.mainAccountId,
              subAccountId: account.subAccountId,
              name: account.name
            });

            // Load subaccounts for the selected main account
            await fetchSubAccounts(subAccount.mainAccountId);
          }
        } else if (mainAccountId) {
          // Create Mode: Pre-select Main Account
          const mainId = parseInt(mainAccountId);
          setFormData(prev => ({ ...prev, mainAccountId: mainId }));
          await fetchSubAccounts(mainId);

          if (subAccountId) {
            // Create Mode: Pre-select Sub Account
            setFormData(prev => ({ ...prev, subAccountId: parseInt(subAccountId) }));
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [accountId, mainAccountId, subAccountId]);

  const fetchMainAccounts = async () => {
    try {
      if (!user?.tenantId) return;
      const data = await getMainAccounts(user.tenantId);
      setMainAccounts(data);
      return data;
    } catch (error) {
      console.error('Error fetching main accounts:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const fetchSubAccounts = async (mainId?: number) => {
    if (!user?.tenantId) return;
    const mainAccountId = mainId || formData.mainAccountId;
    if (!mainAccountId) return;

    try {
      const data = await getSubAccounts(user.tenantId, mainAccountId);
      setSubAccounts(data);
      return data;
    } catch (error) {
      console.error('Error fetching sub accounts:', error);
      return null;
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setIsSubmitting(true);

    try {
      if (accountId) {
        if (formData.subAccountId === undefined) {
          throw new Error('subAccountId is required');
        }

        await updateAccount(parseInt(accountId), {
          tenantId: user.tenantId,
          subAccountId: formData.subAccountId,
          name: formData.name
        });

        setSuccessMessage('Account updated successfully');
        setTimeout(() => {
          router.push('/Accounts/chartOfAccounts');
        }, 1500);
      } else {
        if (formData.subAccountId === undefined) {
          throw new Error('subAccountId is required');
        }
        await createAccount({
          tenantId: user.tenantId,
          subAccountId: formData.subAccountId,
          name: formData.name
        });

        setSuccessMessage('Account created successfully');
        setTimeout(() => {
          router.push('/Accounts/chartOfAccounts');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMainAccount = async (data: any) => {
    try {
      if (!user?.tenantId) return;
      await createMainAccount({ tenantId: user.tenantId, ...data });
      await fetchMainAccounts();
      setIsMainAccountModalOpen(false);
    } catch (error) {
      console.error('Error creating main account:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !formData.subAccountId) return;

    try {
      const request: CreateAccountRequest = {
        tenantId: user.tenantId,
        subAccountId: formData.subAccountId,
        name: formData.name
      };
      await createAccount(request);
      setSuccessMessage('Account created successfully');
      setTimeout(() => {
        router.push('/Accounts/chartOfAccounts');
      }, 1500);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleMainAccountChange = async (mainAccountId: number) => {
    setFormData(prev => ({
      ...prev,
      mainAccountId,
      // Clear subAccountId when manually changing main account
      subAccountId: undefined
    }));
    // Fetch sub accounts whenever main account changes
    await fetchSubAccounts(mainAccountId);
  };

  const handleMainAccountSubmit = async (data: any) => {
    try {
      if (!user?.tenantId) return;
      await createMainAccount({
        tenantId: user.tenantId,
        name: data.name,
        financialStatementComponent: data.financial_statement_component
      });
      await fetchMainAccounts();
      setIsMainAccountModalOpen(false);
      setSuccessMessage('Main account created successfully');
    } catch (error) {
      console.error('Error creating main account:', error);
    }
  };

  const handleSubAccountSubmit = async (data: any) => {
    try {
      if (!user?.tenantId || !formData.mainAccountId) return;
      await createSubAccount({
        tenantId: user.tenantId,
        mainAccountId: formData.mainAccountId,
        name: data.name
      });
      await fetchSubAccounts();
      setIsSubAccountModalOpen(false);
      setSuccessMessage('Sub account created successfully');
    } catch (error) {
      console.error('Error creating sub account:', error);
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
        <div className="p-6">
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          )}

          <div className="flex items-center gap-4 mb-8">
            <BackButton href="/Accounts/chartOfAccounts" />
            <h1 className="text-2xl font-bold text-gray-900">{accountId ? 'Edit Account' : 'Create Account'}</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="mainAccount">Main Account</Label>
                  <div className="flex gap-2">
                    <Select
                      id="mainAccount"
                      value={formData.mainAccountId?.toString() || ''}
                      onChange={(value) => handleMainAccountChange(parseInt(value))}
                      className="flex-1"
                      options={mainAccounts.map(acc => ({
                        value: acc.mainAccountId.toString(),
                        label: acc.name
                      }))}
                    />
                    <button
                      type="button"
                      onClick={() => setIsMainAccountModalOpen(true)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subAccount">Sub Account</Label>
                  <div className="flex gap-2">
                    <Select
                      id="subAccount"
                      value={formData.subAccountId?.toString() || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, subAccountId: parseInt(value) }))}
                      className="flex-1"
                      options={subAccounts.map(acc => ({
                        value: acc.subAccountId.toString(),
                        label: acc.name
                      }))}
                      placeholder={!formData.mainAccountId ? "Select main account first" : "Select sub account"}
                    />
                    <button
                      type="button"
                      onClick={() => setIsSubAccountModalOpen(true)}
                      disabled={!formData.mainAccountId}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/Accounts/chartOfAccounts')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.subAccountId || !formData.name || isSubmitting}
                >
                  {accountId ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>

          <AccountFormModal
            isOpen={isMainAccountModalOpen}
            onClose={() => setIsMainAccountModalOpen(false)}
            onSubmit={handleMainAccountSubmit}
            type="main"
          />

          <AccountFormModal
            isOpen={isSubAccountModalOpen}
            onClose={() => setIsSubAccountModalOpen(false)}
            onSubmit={handleSubAccountSubmit}
            type="sub"
            mainAccounts={mainAccounts.map(acc => ({
              main_account_code: acc.mainAccountCode,
              name: acc.name
            }))}
            initialMainAccount={
              formData.mainAccountId ? {
                main_account_code: mainAccounts.find(acc => acc.mainAccountId === formData.mainAccountId)?.mainAccountCode || '',
                name: mainAccounts.find(acc => acc.mainAccountId === formData.mainAccountId)?.name || ''
              } : undefined
            }
          />
        </div>
      </DynamicLayout>
    </ProtectedRoute>
  );
} 