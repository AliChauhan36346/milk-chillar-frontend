// components/ui/SummaryCard.tsx
/*import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
  titleSize?: string; // Add this
  valueSize?: string; // Add this
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  className = '',
  titleSize = 'text-lg', // Default value
  valueSize = 'text-3xl' // Default value
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
        <span className={`font-medium  ${titleSize}`}>{title}</span>
        <p className={`font-bold ${valueSize}`}>{value}</p>
      </div>
    </div>
  );
}*/

// components/ui/SummaryCard.tsx (Enhanced version)
import { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  className?: string;
  subtitle?: string;
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color, 
  className = '',
  subtitle 
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'

  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`ml-4 ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}