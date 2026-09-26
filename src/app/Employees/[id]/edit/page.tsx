//src/app/Employees/[id]/edit/page.tsx
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';
import { Switch } from '@/components/ui/Switch';
import { getEmployeeById, updateEmployee, Employee } from '@/lib/api/employees';
import { getChillars, Chillar } from '@/lib/api/chillar';
import { useToast } from '@/hooks/useToast';

const designations = [
  { value: 'dodhi', label: 'Dodhi' },
  { value: 'chillarIncharge', label: 'Chillar Incharge' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

type FormData = {
  fullName: string;
  designation: string;
  contactNumber: string;
  salary: string;
  chillarId: string;
  isActive: boolean;
};

export default function EditEmployeePage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chillars, setChillars] = useState<Chillar[]>([]);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    designation: '',
    contactNumber: '',
    salary: '',
    chillarId: '',
    isActive: true,
  });

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: 'designation' | 'chillarId') => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleCancel = () => {
    router.push(`/Employees/${resolvedParams.id}`);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const id = parseInt(resolvedParams.id, 10);
        if (isNaN(id)) {
          throw new Error('Invalid employee ID');
        }
        
        const [employeeData, chillarsData] = await Promise.all([
          getEmployeeById(id),
          getChillars().catch(() => [] as Chillar[])
        ]);

        if (!isMounted) return;

        setChillars(chillarsData);
        setFormData({
          fullName: employeeData.fullName || '',
          designation: employeeData.designation || '',
          contactNumber: employeeData.contactNumber || '',
          salary: employeeData.salary !== undefined && employeeData.salary !== null ? employeeData.salary.toString() : '',
          chillarId: employeeData.chillarId ? employeeData.chillarId.toString() : '',
          isActive: employeeData.isActive ?? true,
        });
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching employee:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch employee details',
          variant: 'error',
        });
        router.push('/Employees');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter employee name',
        variant: 'error',
      });
      return;
    }

    if (!formData.designation) {
      toast({
        title: 'Error',
        description: 'Please select a designation',
        variant: 'error',
      });
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter contact number',
        variant: 'error',
      });
      return;
    }

    const parsedSalary = parseFloat(formData.salary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid salary',
        variant: 'error',
      });
      return;
    }

    setIsSaving(true);

    try {
      const employeeId = parseInt(resolvedParams.id, 10);
      const selectedChillar = chillars.find(c => c.chillarId.toString() === formData.chillarId);

      const updatedEmployee: Employee = {
        employeeId,
        fullName: formData.fullName.trim(),
        designation: formData.designation,
        contactNumber: formData.contactNumber.trim(),
        salary: parsedSalary,
        isActive: formData.isActive,
        chillarId: formData.chillarId ? parseInt(formData.chillarId, 10) : undefined,
        chillarName: selectedChillar?.name,
      };

      await updateEmployee(employeeId, updatedEmployee);
      
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
        variant: 'success',
      });
      router.push(`/Employees/${employeeId}`);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DynamicLayout allowedRoles={['admin', 'manager']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-sm text-slate-500">Loading employee details...</p>
          </div>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout allowedRoles={['admin', 'manager']}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <BackButton href={`/Employees/${resolvedParams.id}`} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Employee</h1>
            <p className="text-xs text-slate-500">Update employee profile, contact information, and role</p>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-6">Employee Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    disabled={isSaving}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    id="designation"
                    value={formData.designation}
                    onChange={handleSelectChange('designation')}
                    options={designations}
                    placeholder="Select designation"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleInputChange('contactNumber')}
                    disabled={isSaving}
                    placeholder="e.g. 03001234567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Rs.)</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={handleInputChange('salary')}
                    disabled={isSaving}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chillarId">Chillar Assignment</Label>
                  <Select
                    id="chillarId"
                    value={formData.chillarId}
                    onChange={handleSelectChange('chillarId')}
                    options={chillars.map(c => ({
                      value: c.chillarId.toString(),
                      label: c.name,
                    }))}
                    placeholder="Select chillar (optional)"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                      disabled={isSaving}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer font-medium text-xs">
                      {formData.isActive ? (
                        <span className="text-emerald-600">Active</span>
                      ) : (
                        <span className="text-rose-600">Inactive</span>
                      )}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DynamicLayout>
  );
}