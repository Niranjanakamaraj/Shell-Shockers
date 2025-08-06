'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './Navbar.css';
import Button from '@/components/ui/button/button';
import { Menu, Home, LineChart, HelpCircle, Brain } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Predict', href: '/predict', icon: Brain },
    { name: 'Visualize', href: '/visualize', icon: LineChart },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          <div className="brand-icon">S</div>
          <span className="brand-name">Shell Fuel Blend Tool</span>
        </a>

        <nav className="navbar-links">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                href={item.href}
                variant={pathname === item.href ? 'default' : 'ghost'}
                isActive={pathname === item.href}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Button>
            );
          })}
        </nav>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="menu-icon" />
        </div>

        {isOpen && (
          <div className="mobile-menu">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  href={item.href}
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  isActive={pathname === item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;