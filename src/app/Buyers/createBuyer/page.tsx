'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Plus } from 'lucide-react';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { BackButton } from '@/components/ui/BackButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import ProtectedRoute from '@/components/ProtectedRoutes';
import { getMainAccounts, getSubAccounts, getAccounts, createAccount, MainAccount, SubAccount, Account } from '@/lib/api/accounts';
import { createBuyer, updateBuyer, getBuyerById, Buyer } from '@/lib/api/buyers';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Suspense } from 'react';
import MilkLoader from '@/components/ui/Loader';


export default function CreateBuyerPage() {
  return (
    <Suspense fallback={<MilkLoader />}>
      <CreateBuyerPageInner />
    </Suspense>
  );
}

function CreateBuyerPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth?.() || {};
  const buyerId = searchParams.get('id');
  console.log('CreateBuyerPageInner rendered, buyerId:', buyerId);
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!buyerId);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [selectedSubAccount, setSelectedSubAccount] = useState<SubAccount | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [generatedAccountCode, setGeneratedAccountCode] = useState('');
  const [createdAccountId, setCreatedAccountId] = useState<number | null>(null);

  // Change all 'buyerName' to 'buyerAccountName' in state and form
  const [formData, setFormData] = useState({
    buyerAccountName: '',
    khataNumber: '',
    rate: 0,
    creditLimit: 0,
    address: '',
    isActive: true,
  });

  const [accountFormData, setAccountFormData] = useState({
    main_account_id: undefined,
    sub_account_id: undefined,
    sub_account_code: '',
    name: '',
  });

  // Fetch sub accounts for main account code '105' on mount
  useEffect(() => {
    fetchBuyersSubAccounts();
    if (buyerId) {
      fetchBuyerDetails();
    }
    // eslint-disable-next-line
  }, [buyerId]);

  const fetchBuyersSubAccounts = async () => {
    try {
      const tenantId = user?.tenantId || 3;
      const mainAccounts = await getMainAccounts(tenantId);
      const buyersMain = mainAccounts.find(acc => acc.mainAccountCode === '100');
      if (!buyersMain) {
        toast({ title: 'Buyers main account not found (code 105)', variant: 'error' });
        return;
      }
      const subAccs = await getSubAccounts(tenantId, buyersMain.mainAccountId);
      setSubAccounts(subAccs);
    } catch (error) {
      toast({ title: 'Error fetching sub accounts', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    }
  };

  // When sub account is selected, fetch accounts and simulate next code
  const handleSubAccountSelect = async (subAccountId: number) => {
    const subAccount = subAccounts.find(acc => acc.subAccountId === subAccountId) || null;
    setSelectedSubAccount(subAccount);
    setCreatedAccountId(null);
    setGeneratedAccountCode('');
    if (!subAccount) return;
    try {
      const tenantId = user?.tenantId || 3;
      const accs = await getAccounts(tenantId, subAccountId);
      setAccounts(accs);
      // Simulate next account code
      let maxNum = 0;
      accs.forEach(acc => {
        // Account code is subAccountCode + XX (e.g. 10501XX)
        const suffix = acc.accountCode.replace(subAccount.subAccountCode, '');
        const num = parseInt(suffix, 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const nextNum = maxNum + 1;
      const nextCode = subAccount.subAccountCode + nextNum.toString().padStart(2, '0');
      setGeneratedAccountCode(nextCode);
    } catch (error) {
      toast({ title: 'Error simulating account code', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    }
  };

  // If editing, fetch buyer details
  const fetchBuyerDetails = async () => {
    try {
      const data: Buyer = await getBuyerById(Number(buyerId));
      setFormData({
        buyerAccountName: data.accountName,
        khataNumber: data.khataNumber,
        rate: data.rate,
        creditLimit: data.creditLimit,
        address: data.address,
        isActive: data.isActive,
      });
      setCreatedAccountId(data.accountId);
      setGeneratedAccountCode(data.accountCode);
    } catch (error) {
      toast({ title: 'Error fetching buyer details', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // On submit: create account, then buyer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tenantId = user?.tenantId || 3;
      let accountId = createdAccountId;
      // Only create account if not editing
      if (!buyerId && selectedSubAccount) {
        const accountRes = await createAccount({
          tenantId,
          subAccountId: selectedSubAccount.subAccountId,
          name: formData.buyerAccountName,
        });
        accountId = accountRes.accountId;
      }
      if (buyerId) {
        if (!accountId) throw new Error('Account ID is missing for update');
        await updateBuyer(Number(buyerId), {
          accountId,
          rate: formData.rate,
          khataNumber: formData.khataNumber,
          creditLimit: formData.creditLimit,
          address: formData.address,
          isActive: formData.isActive,
          tenantId,
        });
        toast({ title: 'Buyer updated successfully!', variant: 'success' });
      } else {
        if (!accountId) throw new Error('Account creation failed');
        await createBuyer({
          accountId,
          rate: formData.rate,
          khataNumber: formData.khataNumber,
          creditLimit: formData.creditLimit,
          address: formData.address,
          isActive: formData.isActive,
          tenantId,
        });
        toast({ title: 'Buyer created successfully!', variant: 'success' });
      }
      router.push('/Buyers/buyerList');
    } catch (error) {
      toast({ title: 'Error saving buyer', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DynamicLayout>
          <MilkLoader />
        </DynamicLayout>
      </ProtectedRoute>
    );
  }

  return (

    <ProtectedRoute>
      <DynamicLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">
              {buyerId ? 'Edit Buyer' : 'Create New Buyer'}
            </h1>
          </div>

          {/* Sub Account Selection */}
          {!buyerId && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <Label htmlFor="subAccount">Select Buyer Sub Account</Label>
              <Select
                id="subAccount"
                value={selectedSubAccount?.subAccountId?.toString() || ''}
                onChange={value => handleSubAccountSelect(Number(value))}
                options={subAccounts.map(acc => ({
                  value: acc.subAccountId.toString(),
                  label: `${acc.name} (${acc.subAccountCode})`,
                }))}
                placeholder="Select sub account"
              />
              {generatedAccountCode && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-800 font-medium">Next Account Code: {generatedAccountCode}</span>
                </div>
              )}
            </div>
          )}

          {/* Buyer Details Form */}
          {(buyerId || selectedSubAccount) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Buyer Name */}
                  <div>
                    <Label htmlFor="buyerAccountName">Buyer Account Name</Label>
                    <Input
                      id="buyerAccountName"
                      value={formData.buyerAccountName}
                      onChange={e => setFormData(prev => ({ ...prev, buyerAccountName: e.target.value }))}
                      placeholder="Enter buyer account name"
                      required
                    />
                  </div>
                  {/* Khata Number */}
                  <div>
                    <Label htmlFor="khataNumber">Khata Number</Label>
                    <Input
                      id="khataNumber"
                      value={formData.khataNumber}
                      onChange={e => setFormData(prev => ({ ...prev, khataNumber: e.target.value }))}
                      placeholder="Enter khata number"
                      required
                    />
                  </div>
                  {/* Rate */}
                  <div>
                    <Label htmlFor="rate">Rate per Liter (₨)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={formData.rate}
                      onChange={e => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {/* Credit Limit */}
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit (₨)</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      value={formData.creditLimit}
                      onChange={e => setFormData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={value => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </div>
                </div>
                {/* Address */}
                <div>
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter buyer's address..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/Buyers/buyerList')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Saving...' : buyerId ? 'Update Buyer' : 'Create Buyer'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DynamicLayout>
    </ProtectedRoute>

  );
}
