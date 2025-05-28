'use client';
import { useState } from 'react';
import { User, Search, Plus, Edit, Lock, Unlock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table/Table';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown/Dropdown';
import { useRouter } from 'next/navigation';

// Mock data - replace with API calls
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    role: 'Admin',
    status: 'active',
    lastActive: '2023-06-15T10:30:00Z',
    tenant: 'Main Dairy',
    linkedEntity: 'System Admin'
  },
  {
    id: 2,
    username: 'manager1',
    role: 'Manager',
    status: 'active',
    lastActive: '2023-06-14T15:45:00Z',
    tenant: 'North Farm',
    linkedEntity: 'Operations'
  },
];

export default function UserListPage() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (userId: number) => {
    router.push(`/users/edit/${userId}`);
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } 
        : user
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <Badge variant="secondary" className="text-sm">
            {filteredUsers.length} users
          </Badge>
        </div>
        
        <Button 
          variant="primary" 
          onClick={() => router.push('/users/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </header>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <DropdownMenu>
            <DropdownTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {statusFilter === 'all' ? 'All Statuses' : statusFilter === 'active' ? 'Active' : 'Blocked'}
              </Button>
            </DropdownTrigger>
            <DropdownContent align="start">
              <DropdownItem onClick={() => setStatusFilter('all')}>
                All Statuses
              </DropdownItem>
              <DropdownItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownItem>
              <DropdownItem onClick={() => setStatusFilter('blocked')}>
                Blocked
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Username</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head>Tenant</Table.Head>
              <Table.Head>Linked Entity</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Last Active</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedUsers.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell className="font-medium">{user.username}</Table.Cell>
                <Table.Cell>
                  <Badge variant={user.role === 'Admin' ? 'primary' : 'secondary'}>
                    {user.role}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{user.tenant}</Table.Cell>
                <Table.Cell>{user.linkedEntity}</Table.Cell>
                <Table.Cell>
                  <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                    {user.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {new Date(user.lastActive).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(user.id)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(user.id)}
                      className={user.status === 'active' 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'}
                    >
                      {user.status === 'active' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {paginatedUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found matching your criteria
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}