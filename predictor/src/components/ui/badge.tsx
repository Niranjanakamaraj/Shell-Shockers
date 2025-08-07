// src/components/ui/badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800 ${className}`}>
      {children}
    </span>
  );
}