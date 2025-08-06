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
import { getMainAccounts, getSubAccounts, getSubAccountsByMainCode, getAccounts, createAccount, MainAccount, SubAccount, Account } from '@/lib/api/accounts';
import { createSupplier, updateSupplier, getSupplierById, Supplier } from '@/lib/api/suppliers';
import { getEmployees, Employee } from '@/lib/api/employees'; // Import getEmployees
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/hooks/useToast';


export default function CreateSupplierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth?.() || {};
  const supplierId = searchParams.get('id');
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!supplierId);
  const [subAccounts,   setSubAccounts] = useState<SubAccount[]>([]);
  const [selectedSubAccount, setSelectedSubAccount] = useState<SubAccount | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [generatedAccountCode, setGeneratedAccountCode] = useState('');
  const [createdAccountId, setCreatedAccountId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    khataNumber: '',
    rate: 0,
    creditLimit: 0,
    address: '',
    dodhiId: undefined as number | undefined,
    giveCreditOnParchi: false,
    isActive: true,
  });

  // Fetch all main accounts for suppliers
  const fetchMainAccounts = async () => {
    try {
      const tenantId = user?.tenantId || 3;
      const accounts = await getMainAccounts(tenantId);
      setMainAccounts(accounts);
    } catch (error) {
      toast({ title: 'Error fetching main accounts', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    }
  };

  // Update useEffect to fetch main accounts on mount and after main account creation
  useEffect(() => {
    fetchMainAccounts();
    fetchSuppliersSubAccounts();
    fetchEmployees();
    if (supplierId) {
      fetchSupplierDetails();
    }
    // eslint-disable-next-line
  }, [supplierId]);

  const fetchSuppliersSubAccounts = async () => {
    try {
      const tenantId = user?.tenantId || 3;
      const subAccs = await getSubAccountsByMainCode(tenantId, '200');
      setSubAccounts(subAccs);
    } catch (error) {
      toast({ title: 'Error fetching sub accounts', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    }
  };

  // Placeholder: Replace with your real API call to fetch employees/dodhis
  const fetchEmployees = async () => {
    try {
      // Use the new getEmployees function
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast({ title: 'Error fetching employees', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
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

  // If editing, fetch supplier details
  const fetchSupplierDetails = async () => {
    try {
      const data: Supplier = await getSupplierById(Number(supplierId));
      setFormData({
        fullName: data.fullName,
        khataNumber: data.khataNumber,
        rate: data.rate,
        creditLimit: data.creditLimit,
        address: data.address,
        dodhiId: data.dodhiId,
        giveCreditOnParchi: data.giveCreditOnParchi,
        isActive: data.isActive,
      });
      setCreatedAccountId(data.accountId);
      setGeneratedAccountCode(data.accountCode);
      // Set selected sub account if possible (optional)
    } catch (error) {
      toast({ title: 'Error fetching supplier details', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // On submit: create account, then supplier
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tenantId = user?.tenantId || 3;
      let accountId = createdAccountId;
      // Only create account if not editing
      if (!supplierId && selectedSubAccount) {
        const accountRes = await createAccount({
          tenantId,
          subAccountId: selectedSubAccount.subAccountId,
          name: formData.fullName,
        });
        accountId = accountRes.accountId;
      }
      if (!accountId) throw new Error('Account creation failed');
      if (supplierId) {
        await updateSupplier(Number(supplierId), {
          accountId,
          fullName: formData.fullName,
          rate: formData.rate,
          khataNumber: formData.khataNumber,
          creditLimit: formData.creditLimit,
          address: formData.address,
          dodhiId: formData.dodhiId || 0,
          giveCreditOnParchi: formData.giveCreditOnParchi,
          isActive: formData.isActive,
        });
        toast({ title: 'Supplier updated successfully!', variant: 'success' });
      } else {
        await createSupplier({
          accountId,
          fullName: formData.fullName,
          rate: formData.rate,
          khataNumber: formData.khataNumber,
          creditLimit: formData.creditLimit,
          address: formData.address,
          dodhiId: formData.dodhiId || 0,
          giveCreditOnParchi: formData.giveCreditOnParchi,
          isActive: formData.isActive,
        });
        toast({ title: 'Supplier created successfully!', variant: 'success' });
      }
      router.push('/Suppliers/supplierList');
    } catch (error) {
      toast({ title: 'Error saving supplier', description: (error as Error)?.message || 'An error occurred', variant: 'error' });
    } finally {
      setIsSubmitting(false);
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
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">
              {supplierId ? 'Edit Supplier' : 'Create New Supplier'}
            </h1>
                </div>

                {/* Sub Account Selection */}
          {!supplierId && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <Label htmlFor="subAccount">Select Supplier Sub Account</Label>
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

          {/* Supplier Details Form */}
          {(supplierId || selectedSubAccount) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                    <Label htmlFor="fullName">Full Name</Label>
                  <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter supplier full name"
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
                {/* Dodhi */}
                <div>
                    <Label htmlFor="dodhiId">Dodhi</Label>
                  <Select
                      id="dodhiId"
                      value={formData.dodhiId?.toString() || ''}
                      onChange={value => setFormData(prev => ({ ...prev, dodhiId: value ? Number(value) : undefined }))}
                    options={employees.map(emp => ({
                      value: emp.employeeId.toString(), // Use employeeId
                        label: `${emp.fullName} (${emp.designation})`, // Use fullName
                    }))}
                    placeholder="Select dodhi"
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
                    placeholder="Enter supplier's address..."
                  />
                </div>
                {/* Give Credit on Parchi */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                    id="giveCreditOnParchi"
                    checked={formData.giveCreditOnParchi}
                    onChange={e => setFormData(prev => ({ ...prev, giveCreditOnParchi: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  <Label htmlFor="giveCreditOnParchi">Allow Credit on Parchi</Label>
                </div>
                <div className="flex justify-end gap-3">
                <button
                  type="button"
                    onClick={() => router.push('/Suppliers/supplierList')}
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
                  {isSubmitting ? 'Saving...' : supplierId ? 'Update Supplier' : 'Create Supplier'}
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
