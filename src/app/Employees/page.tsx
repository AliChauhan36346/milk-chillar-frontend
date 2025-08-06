//src/app/Employees/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { DynamicLayout } from '@/components/layouts/DynamicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table/Table';
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '@/components/ui/Dropdown/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { getPagedEmployees, deleteEmployee, Employee } from '@/lib/api/employees';
import { useToast } from '@/hooks/useToast';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await getPagedEmployees(currentPage, 10, undefined, searchQuery);
      setEmployees(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchQuery]);

  const handleDelete = async (id: number) => {
    try {
      await deleteEmployee(id);
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      fetchEmployees();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'error',
      });
    }
  };

  const getDesignationBadgeColor = (designation: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      dodhi: 'bg-green-100 text-green-800',
      chillarIncharge: 'bg-purple-100 text-purple-800',
    };
    return colors[designation.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DynamicLayout allowedRoles={['admin', 'manager']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employees</h1>
          <Link href="/Employees/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Designation</Table.Head>
                <Table.Head>Contact</Table.Head>
                <Table.Head>Salary</Table.Head>
                <Table.Head>Chillar</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center">Loading...</Table.Cell>
                </Table.Row>
              ) : employees.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center">No employees found</Table.Cell>
                </Table.Row>
              ) : (
                employees.map((employee) => (
                  <Table.Row key={employee.employeeId}>
                    <Table.Cell className="font-medium">{employee.fullName}</Table.Cell>
                    <Table.Cell>
                      <Badge className={getDesignationBadgeColor(employee.designation)}>
                        {employee.designation}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>{employee.contactNumber}</Table.Cell>
                    <Table.Cell>Rs. {employee.salary.toLocaleString()}</Table.Cell>
                    <Table.Cell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {employee.chillarName}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        className={
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <DropdownMenu>
                        <DropdownTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end">
                          <DropdownItem asChild>
                            <Link href={`/Employees/${employee.employeeId}`}>
                              <span className="flex items-center">
                                View Details
                              </span>
                            </Link>
                          </DropdownItem>
                          <DropdownItem asChild>
                            <Link href={`/Employees/${employee.employeeId}/edit`}>
                              <span className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </span>
                            </Link>
                          </DropdownItem>
                          <DropdownItem asChild>
                            <Link href={`/Users/create?employeeId=${employee.employeeId}`}>
                              <span className="flex items-center">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create User Account
                              </span>
                            </Link>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => handleDelete(employee.employeeId)}
                            className="text-red-600 cursor-pointer"
                          >
                            <span className="flex items-center">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </span>
                          </DropdownItem>
                        </DropdownContent>
                      </DropdownMenu>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </DynamicLayout>
  );
} 