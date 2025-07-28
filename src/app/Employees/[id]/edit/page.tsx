//src/app/Employees/[id]/edit/page.tsx
'use client';
import { useState, useEffect, use, useCallback } from 'react';
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
  isActive: boolean;
};

export default function EditEmployeePage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    designation: '',
    contactNumber: '',
    salary: '',
    isActive: true,
  });

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: keyof Omit<FormData, 'isActive'>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
  }, []);

  const handleSelectChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      designation: value
    }));
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  }, []);

  const handleCancel = useCallback(() => {
    router.push(`/Employees/${resolvedParams.id}`);
  }, [router, resolvedParams.id]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) {
          throw new Error('Invalid employee ID');
        }
        
        const data = await getEmployeeById(id);
        setFormData({
          fullName: data.fullName,
          designation: data.designation,
          contactNumber: data.contactNumber,
          salary: data.salary.toString(),
          isActive: data.isActive,
        });
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch employee details',
          variant: 'error',
        });
        router.push('/Employees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [resolvedParams.id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.designation || !formData.contactNumber || !formData.salary) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'error',
      });
      return;
    }

    setIsSaving(true);

    try {
      const employeeId = parseInt(resolvedParams.id);
      const updatedEmployee: Employee = {
        employeeId,
        fullName: formData.fullName,
        designation: formData.designation,
        contactNumber: formData.contactNumber,
        salary: parseFloat(formData.salary),
        isActive: formData.isActive,
      };

      await updateEmployee(employeeId, updatedEmployee);
      
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
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
            <p>Loading...</p>
          </div>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href={`/Employees/${resolvedParams.id}`} />
          <h1 className="text-2xl font-bold">Edit Employee</h1>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Employee Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange('fullName')}
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    id="designation"
                    value={formData.designation}
                    onChange={handleSelectChange}
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={handleInputChange('salary')}
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                      disabled={isSaving}
                    />
                    <Label htmlFor="isActive">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
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