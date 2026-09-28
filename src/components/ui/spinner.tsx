// src/components/ui/spinner.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'blue' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'h-5 w-5 border-b-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-10 w-10 border-b-2',
  xl: 'h-12 w-12 border-b-2',
};

const colorClasses = {
  blue: 'border-blue-600',
  white: 'border-white',
  gray: 'border-slate-600',
};

export function Spinner({ size = 'md', className = '', color = 'blue' }: SpinnerProps) {
  return (
    <div
      className={twMerge('animate-spin rounded-full', sizeClasses[size], colorClasses[color], className)}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page / centered view spinner wrapper
export function FullPageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16 gap-2.5">
      <Spinner size="lg" color="blue" />
      {message && <span className="text-xs font-medium text-slate-500">{message}</span>}
    </div>
  );
}

// Centered spinner for cards/sections/tables
export function CenteredSpinner({ message = 'Loading...', size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <Spinner size={size} color="blue" />
      {message && <span className="text-xs font-medium text-slate-500">{message}</span>}
    </div>
  );
}