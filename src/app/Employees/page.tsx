'use client';
import { useState } from 'react';
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

// Mock data for testing
const mockEmployees = [
  {
    employee_id: 1,
    full_name: 'John Doe',
    designation: 'dodhi',
    contact_number: '+92 300 1234567',
    salary: 25000,
    is_active: true,
  },
  {
    employee_id: 2,
    full_name: 'Jane Smith',
    designation: 'chillarIncharge',
    contact_number: '+92 301 2345678',
    salary: 30000,
    is_active: true,
  },
];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = mockEmployees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDesignationBadgeColor = (designation: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      dodhi: 'bg-green-100 text-green-800',
      chillarIncharge: 'bg-purple-100 text-purple-800',
    };
    return colors[designation] || 'bg-gray-100 text-gray-800';
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
                <Table.Head>Status</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredEmployees.map((employee) => (
                <Table.Row key={employee.employee_id}>
                  <Table.Cell className="font-medium">{employee.full_name}</Table.Cell>
                  <Table.Cell>
                    <Badge className={getDesignationBadgeColor(employee.designation)}>
                      {employee.designation}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{employee.contact_number}</Table.Cell>
                  <Table.Cell>Rs. {employee.salary.toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    <Badge className={employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <DropdownMenu>
                      <DropdownTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownContent align="end">
                        <DropdownItem asChild>
                          <Link href={`/Employees/${employee.employee_id}`}>
                            View Details
                          </Link>
                        </DropdownItem>
                        <DropdownItem asChild>
                          <Link href={`/Employees/${employee.employee_id}/edit`}>
                            Edit
                          </Link>
                        </DropdownItem>
                        <DropdownItem asChild>
                          <Link href={`/Users/create?employeeId=${employee.employee_id}`}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create User Account
                          </Link>
                        </DropdownItem>
                        <DropdownItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenu>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </DynamicLayout>
  );
} 