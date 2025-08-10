// src/components/ui/input.tsx
'use client';

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className={`border rounded-md px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ''}`}
    />
  );
};