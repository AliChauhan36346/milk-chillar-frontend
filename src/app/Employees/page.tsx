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

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
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

        {/* Mobile Card List */}
        <div className="md:hidden space-y-2.5">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No employees found
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.employeeId} className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs space-y-2">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-xs text-slate-800">{employee.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge className={getDesignationBadgeColor(employee.designation)}>
                        {employee.designation}
                      </Badge>
                      {employee.chillarName && (
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                          {employee.chillarName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      employee.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }
                  >
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Contact</span>
                    <span className="text-slate-700">{employee.contactNumber || '-'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Salary</span>
                    <span className="font-bold text-slate-900">Rs. {employee.salary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                  <Link
                    href={`/Employees/${employee.employeeId}`}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                  >
                    View
                  </Link>
                  <Link
                    href={`/Employees/${employee.employeeId}/edit`}
                    className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(employee.employeeId)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs shadow-xs">
            <span className="text-slate-500 font-medium">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DynamicLayout>
  );
} 