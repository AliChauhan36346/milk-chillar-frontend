'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';
import { Switch } from '@/components/ui/Switch';

const designations = [
  { value: 'dodhi', label: 'Dodhi' },
  { value: 'chillarIncharge', label: 'Chillar Incharge' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    contact_number: '',
    salary: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`https://localhost:7013/api/Employees/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employee');
        }
        const data = await response.json();
        setFormData({
          full_name: data.full_name,
          designation: data.designation,
          contact_number: data.contact_number,
          salary: data.salary.toString(),
          is_active: data.is_active,
        });
      } catch (error) {
        console.error('Error fetching employee:', error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`https://localhost:7013/api/Employees/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: parseFloat(formData.salary),
          tenant_id: 1, // TODO: Get from auth context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      router.push('/Employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DynamicLayout allowedRoles={['admin', 'manager']}>
        <div className="flex items-center justify-center h-screen">
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
          <BackButton href="/Employees" />
          <h1 className="text-2xl font-bold">Edit Employee</h1>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Employee Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    id="designation"
                    value={formData.designation}
                    onChange={(value) => setFormData({ ...formData, designation: value })}
                    options={designations}
                    placeholder="Select designation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/Employees')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </DynamicLayout>
  );
} 