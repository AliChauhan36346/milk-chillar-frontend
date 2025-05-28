'use client';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Edit, Lock, Unlock, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { UserPermissions } from './UserPermissions';

export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  
  // Mock data - replace with API call that fetches from your users table
  const user = {
    id: params.userId,
    username: 'ALiAbbas',
    password_hash: 'hashed_password_123',
    user_type: 'employee',
    is_blocked: false,
    created_at: '2023-01-15T10:30:00Z',
    tenant: 'North Farm',
    linked_entity: 'John Doe (Employee)',
    role: 'Manager',
    permissions: ['dashboard.access', 'reports.view', 'settings.manage', 'users.manage']
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          User Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <Badge variant={user.role === 'Admin' ? 'primary' : 'secondary'} className="mt-2">
                {user.role}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/users/edit/${user.id}`)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button 
                variant={user.is_blocked ? 'success' : 'destructive'}
                onClick={() => console.log('Toggle block status')}
                className="flex items-center gap-2"
              >
                {user.is_blocked ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {user.is_blocked ? 'Unblock' : 'Block'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Username</h3>
              <p className="mt-1">{user.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Password</h3>
              <p className="mt-1 font-mono text-sm">••••••••</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge variant={user.is_blocked ? 'destructive' : 'success'} className="mt-1">
                {user.is_blocked ? 'Blocked' : 'Active'}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">User Type</h3>
              <p className="mt-1 capitalize">{user.user_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tenant</h3>
              <p className="mt-1">{user.tenant}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Linked Entity</h3>
              <p className="mt-1">{user.linked_entity}</p>
            </div>
          </div>
        </Card>

        {/* Permissions Card */}
        <div>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-semibold">Permissions</h2>
              
            </div>
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/users/${user.id}/permissions`)}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Edit Permissions
              </Button>
            <UserPermissions permissions={user.permissions} />
          </Card>
        </div>
      </div>
    </div>
  );
}