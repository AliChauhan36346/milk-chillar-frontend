'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Employee = {
  employee_id: number;
  full_name: string;
  designation: string;
  contact_number: string;
  salary: number;
  is_active: boolean;
  tenant_id: number;
};

export default function EmployeeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`https://localhost:7013/api/Employees/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employee');
        }
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        console.error('Error fetching employee:', error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id]);

  const getDesignationBadgeColor = (designation: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      dodhi: 'bg-green-100 text-green-800',
      chillarIncharge: 'bg-purple-100 text-purple-800',
    };
    return colors[designation] || 'bg-gray-100 text-gray-800';
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

  if (!employee) {
    return (
      <DynamicLayout allowedRoles={['admin', 'manager']}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p>Employee not found</p>
          </div>
        </div>
      </DynamicLayout>
    );
  }

  return (
    <DynamicLayout allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/Employees" />
            <h1 className="text-2xl font-bold">Employee Details</h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/Employees/${employee.employee_id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/Users/create?employeeId=${employee.employee_id}`}>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User Account
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{employee.full_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                <Badge className={`mt-1 ${getDesignationBadgeColor(employee.designation)}`}>
                  {employee.designation}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                <p className="mt-1">{employee.contact_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                <p className="mt-1">Rs. {employee.salary.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className={`mt-1 ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No user account created yet</p>
                <Link href={`/Users/create?employeeId=${employee.employee_id}`}>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DynamicLayout>
  );
} 