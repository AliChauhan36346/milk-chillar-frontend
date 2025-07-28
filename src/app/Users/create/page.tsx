'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Save, Lock, Unlock, Check, X, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/useToast';

// Mock data
const mockRoles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Dodhi' },
  { id: 4, name: 'Buyer' },
];

export default function UserForm({ params }: { params: { action: string, id?: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(params.action === 'edit');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data for edit
  useEffect(() => {
    if (params.action === 'edit' && params.id) {
      setTimeout(() => {
        setFormData({
          username: 'manager1',
          password: '',
          confirmPassword: '',
          roleId: '2',
          isActive: true,
        });
        setIsLoading(false);
      }, 800);
    }
  }, [params.action, params.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (params.action === 'create' && !formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.roleId) newErrors.roleId = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: params.action === 'create' ? 'User created' : 'User updated',
        description: `User ${formData.username} has been ${params.action === 'create' ? 'created' : 'updated'} successfully.`,
      });
      router.push('/users');
    }, 1000);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto p-6 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          {params.action === 'create' ? 'Create New User' : 'Edit User'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Username *" error={errors.username}>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                />
              </Field>
              
              {params.action === 'create' && (
                <>
                  <Field label="Password *" error={errors.password}>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                  </Field>
                  
                  <Field label="Confirm Password *" error={errors.confirmPassword}>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    />
                  </Field>
                </>
              )}
            </div>
          </Section>

          <Section title="Role & Status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Role *" error={errors.roleId}>
                <Select
                  value={formData.roleId}
                  onChange={(value) => handleChange('roleId', value)}
                  options={mockRoles.map(role => ({
                    value: role.id.toString(),
                    label: role.name,
                  }))}
                  error={errors.roleId}
                />
              </Field>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Account Status</Label>
                  <p className="text-sm text-gray-500">
                    {formData.isActive ? 'Active' : 'Blocked'}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </Section>

          <Section title="Permissions">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">
                User permissions are derived from their role. To modify permissions, edit the role or:
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/roles/${formData.roleId}/permissions`)}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Edit Role Permissions
              </Button>
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => router.push('/users')} className="flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {params.action === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Helper components
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <Label>{label}</Label>
    {children}
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);