'use client';

import React from 'react';
import Link from 'next/link';
import './button.css';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'ghost';
  className?: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  variant = 'ghost',
  className = '',
  children,
  isActive = false,
}) => {
  const classes = `custom-button ${variant} ${isActive ? 'active' : ''} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;