// src/components/ui/spinner.tsx
import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'blue' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-10 w-10 border-2',
  xl: 'h-14 w-14 border-[3px]',
};

const colorClasses = {
  blue: 'border-slate-200 border-t-blue-600',
  white: 'border-white/30 border-t-white',
  gray: 'border-slate-200 border-t-slate-700',
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-16">
      <Spinner size="lg" />
      {message && <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
}

// Centered spinner for cards/sections
export function CenteredSpinner({ message = 'Loading...', size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Spinner size={size} />
      {message && <p className="mt-2.5 text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
}