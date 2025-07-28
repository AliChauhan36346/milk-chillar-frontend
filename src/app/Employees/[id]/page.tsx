//src/app/Employees/[id]/page.tsx
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Employee, getEmployeeById, deleteEmployee } from '@/lib/api/employees';
import { useToast } from '@/hooks/useToast';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) {
          throw new Error('Invalid employee ID');
        }
        const data = await getEmployeeById(id);
        setEmployee(data);
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

  const getDesignationBadgeColor = (designation: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      dodhi: 'bg-green-100 text-green-800',
      chillarIncharge: 'bg-purple-100 text-purple-800',
    };
    return colors[designation.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async () => {
    if (!employee) return;
    
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEmployee(employee.employeeId);
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      router.push('/Employees');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'error',
      });
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

  if (!employee) {
    return (
      <DynamicLayout allowedRoles={['admin', 'manager']}>
        <div className="flex items-center justify-center min-h-[400px]">
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
            <Link href={`/Employees/${employee.employeeId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Link href={`/Users/create?employeeId=${employee.employeeId}`}>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User Account
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg font-medium">{employee.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <Badge className={getDesignationBadgeColor(employee.designation)}>
                  {employee.designation}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="text-lg font-medium">{employee.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-lg font-medium">Rs. {employee.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge
                  className={
                    employee.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DynamicLayout>
  );
}