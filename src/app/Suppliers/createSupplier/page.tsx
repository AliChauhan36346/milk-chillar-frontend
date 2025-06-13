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

type SupplierFormData = {
  account_id?: number;
  full_name: string;
  rate: number;
  khata_number: string;
  credit_limit: number;
  address: string;
  dodhi_id?: number;
  give_credit_on_parchi: boolean;
  is_active: boolean;
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

type Employee = {
  employee_id: number;
  full_name: string;
  designation: string;
};

export default function CreateSupplierPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!supplierId);
  const [mainAccounts, setMainAccounts] = useState<MainAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accountFormData, setAccountFormData] = useState<AccountFormData>({
    main_account_id: undefined,
    sub_account_id: undefined,
    sub_account_code: '',
    name: ''
  });
  const [supplierFormData, setSupplierFormData] = useState<SupplierFormData>({
    full_name: '',
    rate: 0,
    khata_number: '',
    credit_limit: 0,
    address: '',
    dodhi_id: undefined,
    give_credit_on_parchi: false,
    is_active: true
  });

  // Modal states
  const [isMainAccountModalOpen, setIsMainAccountModalOpen] = useState(false);
  const [isSubAccountModalOpen, setIsSubAccountModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'account' | 'supplier'>('account');

  useEffect(() => {
    fetchMainAccounts();
    fetchEmployees();
    if (supplierId) {
      fetchSupplierDetails();
    }
  }, [supplierId]);

  useEffect(() => {
    if (accountFormData.main_account_id) {
      fetchSubAccounts(accountFormData.main_account_id);
    }
  }, [accountFormData.main_account_id]);

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

  const fetchEmployees = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const fetchSupplierDetails = async () => {
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch(`/api/suppliers/${supplierId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch supplier details');
      }
      const data = await response.json();
      setSupplierFormData(data);
      setAccountFormData({
        main_account_id: data.account.main_account_id,
        sub_account_id: data.account.sub_account_id,
        sub_account_code: data.account.sub_account_code,
        name: data.account.name
      });
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsLoading(false);
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

      if (accountFormData.main_account_id) {
        await fetchSubAccounts(accountFormData.main_account_id);
      }
      setIsSubAccountModalOpen(false);
    } catch (error) {
      console.error('Error creating sub account:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const data = await response.json();
      setSupplierFormData(prev => ({ ...prev, account_id: data.account_id }));
      setCurrentStep('supplier');
    } catch (error) {
      console.error('Error creating account:', error);
      // TODO: Add proper error handling/notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/suppliers', {
        method: supplierId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to save supplier');
      }

      router.push('/Suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
      // TODO: Add proper error handling/notification
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
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-800">
              {supplierId ? 'Edit Supplier' : 'Create New Supplier'}
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className={`flex items-center ${currentStep === 'account' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'account' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2">Account Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${currentStep === 'supplier' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'supplier' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2">Supplier Details</span>
              </div>
            </div>
          </div>

          {currentStep === 'account' ? (
            <form onSubmit={handleAccountSubmit} className="bg-white rounded-xl shadow-sm p-6">
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
                    value={accountFormData.main_account_id?.toString() || ''}
                    onChange={(value) => setAccountFormData(prev => ({ 
                      ...prev, 
                      main_account_id: value ? parseInt(value) : undefined,
                      sub_account_id: undefined // Reset sub account when main account changes
                    }))}
                    options={mainAccounts.map(acc => ({
                      value: acc.main_account_id.toString(),
                      label: `${acc.name} (${acc.main_account_code})`
                    }))}
                    placeholder="Select a main account"
                    required
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
                      disabled={!accountFormData.main_account_id}
                    >
                      <Plus className="w-4 h-4" />
                      Create New
                    </button>
                  </div>
                  <Select
                    value={accountFormData.sub_account_id?.toString() || ''}
                    onChange={(value) => setAccountFormData(prev => ({ 
                      ...prev, 
                      sub_account_id: value ? parseInt(value) : undefined 
                    }))}
                    options={subAccounts.map(acc => ({
                      value: acc.sub_account_id.toString(),
                      label: `${acc.name} (${acc.sub_account_code})`
                    }))}
                    placeholder="Select a sub account"
                    required
                    disabled={!accountFormData.main_account_id}
                  />
                </div>

                {/* Account Code */}
                <div>
                  <Label htmlFor="sub_account_code">Account Code</Label>
                  <Input
                    id="sub_account_code"
                    value={accountFormData.sub_account_code}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, sub_account_code: e.target.value }))}
                    placeholder="Enter account code"
                    required
                  />
                </div>

                {/* Account Name */}
                <div>
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    value={accountFormData.name}
                    onChange={(e) => setAccountFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  {isSubmitting ? 'Saving...' : 'Next: Supplier Details'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSupplierSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={supplierFormData.full_name}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter supplier's full name"
                    required
                  />
                </div>

                {/* Khata Number */}
                <div>
                  <Label htmlFor="khata_number">Khata Number</Label>
                  <Input
                    id="khata_number"
                    value={supplierFormData.khata_number}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, khata_number: e.target.value }))}
                    placeholder="Enter khata number"
                    required
                  />
                </div>

                {/* Rate */}
                <div>
                  <Label htmlFor="rate">Rate per Liter (₹)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={supplierFormData.rate}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    placeholder="Enter rate"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Credit Limit */}
                <div>
                  <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    value={supplierFormData.credit_limit}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) }))}
                    placeholder="Enter credit limit"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Dodhi */}
                <div>
                  <Label htmlFor="dodhi_id">Dodhi</Label>
                  <Select
                    value={supplierFormData.dodhi_id?.toString() || ''}
                    onChange={(value) => setSupplierFormData(prev => ({ 
                      ...prev, 
                      dodhi_id: value ? parseInt(value) : undefined 
                    }))}
                    options={employees.map(emp => ({
                      value: emp.employee_id.toString(),
                      label: `${emp.full_name} (${emp.designation})`
                    }))}
                    placeholder="Select dodhi"
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <Select
                    value={supplierFormData.is_active ? 'active' : 'inactive'}
                    onChange={(value) => setSupplierFormData(prev => ({ 
                      ...prev, 
                      is_active: value === 'active' 
                    }))}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    placeholder="Select status"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <textarea
                    id="address"
                    value={supplierFormData.address}
                    onChange={(e) => setSupplierFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter supplier's address..."
                  />
                </div>

                {/* Credit on Parchi */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="give_credit_on_parchi"
                      checked={supplierFormData.give_credit_on_parchi}
                      onChange={(e) => setSupplierFormData(prev => ({ 
                        ...prev, 
                        give_credit_on_parchi: e.target.checked 
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="give_credit_on_parchi">Allow Credit on Parchi</Label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('account')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Account
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
          )}
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
