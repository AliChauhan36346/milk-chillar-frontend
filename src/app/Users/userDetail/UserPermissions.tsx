'use client';
import { Badge } from '@/components/ui/Badge';
import { Check, X } from 'lucide-react';

interface UserPermissionsProps {
  permissions: string[];
}

export function UserPermissions({ permissions }: UserPermissionsProps) {
  if (!permissions || permissions.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No permissions assigned
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
        {permissions.map((permission) => (
          <Badge 
            key={permission}
            variant="secondary"
            className="flex items-center gap-2 w-fit"
          >
            <Check className="w-3 h-3 text-green-500" />
            {permission}
          </Badge>
        ))}
      </div>
    </div>
  );
}