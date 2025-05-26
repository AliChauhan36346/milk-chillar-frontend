// components/ui/SummaryCard.tsx
import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  className = '' 
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600',
    green: 'border-green-100 bg-green-50 text-green-600',
    red: 'border-red-100 bg-red-50 text-red-600',
    yellow: 'border-yellow-100 bg-yellow-50 text-yellow-600',
    purple: 'border-purple-100 bg-purple-50 text-purple-600',
    gray: 'border-gray-100 bg-gray-50 text-gray-600',
  };

  const iconClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500',
  };

  return (
    <div className={`p-2 rounded-xl shadow-sm border ${colorClasses[color]} ${className}`}>
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <span className={iconClasses[color]}>{icon}</span>
        <span className="font-medium text-lg">{title}</span>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}