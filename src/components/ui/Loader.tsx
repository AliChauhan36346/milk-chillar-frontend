// src/components/ui/Loader.tsx
'use client';
import React from 'react';
import { Spinner } from './spinner';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

/**
 * Standard Application Loader matching the clean circular design used in Buyer & Supplier loading.
 * Replaces the previous heavy animated bottle with an enterprise, responsive loading spinner.
 */
export default function MilkLoader({
  message = 'Loading...',
  size = 'md',
  fullScreen = true
}: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <Spinner size={size} color="blue" />
      {message && (
        <span className="text-xs font-medium text-slate-500">
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50/70 backdrop-blur-2xs z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 min-w-[200px] flex items-center justify-center">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}

export function SmallMilkLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-600">
      <Spinner size="sm" color="blue" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}

export function DataProcessingLoader({ message = 'Processing data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 p-6">
      <Spinner size="md" color="blue" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}