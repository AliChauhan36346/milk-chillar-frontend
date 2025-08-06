//src/app/Employees/create/page.tsx
'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';
import { createEmployee } from '@/lib/api/employees';
import { useToast } from '@/hooks/useToast';

const designations = [
  { value: 'dodhi', label: 'Dodhi' },
  { value: 'chillarIncharge', label: 'Chillar Incharge' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

import { getChillars, Chillar } from '@/lib/api/chillar';

type FormData = {
  fullName: string;
  designation: string;
  contactNumber: string;
  salary: string;
  chillarId: string;
};

export default function CreateEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    designation: '',
    contactNumber: '',
    salary: '',
    chillarId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chillars, setChillars] = useState<Chillar[]>([]);

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: keyof FormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
  }, []);

  const handleSelectChange = useCallback((field: 'designation' | 'chillarId') => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  useEffect(() => {
    const fetchChillars = async () => {
      try {
        const data = await getChillars();
        setChillars(data);
      } catch (error) {
        console.error('Error fetching chillars:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch chillars',
          variant: 'error',
        });
      }
    };

    fetchChillars();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.designation || !formData.contactNumber || !formData.salary || !formData.chillarId) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      await createEmployee({
        fullName: formData.fullName,
        designation: formData.designation,
        contactNumber: formData.contactNumber,
        salary: parseFloat(formData.salary),
        isActive: true,
        chillarId: parseInt(formData.chillarId, 10)
      });

      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });
      router.push('/Employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to create employee',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    router.push('/Employees');
  }, [router]);

  return (
    <DynamicLayout allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/Employees" />
          <h1 className="text-2xl font-bold">Add New Employee</h1>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleInputChange('contactNumber')}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chillar">Chillar</Label>
                  <Select
                    id="chillar"
                    value={formData.chillarId}
                    onChange={handleSelectChange('chillarId')}
                    options={chillars.map(chillar => ({
                      value: chillar.chillarId.toString(),
                      label: `${chillar.name} (${chillar.location})`
                    }))}
                    placeholder="Select chillar"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Employee'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DynamicLayout>
  );
}