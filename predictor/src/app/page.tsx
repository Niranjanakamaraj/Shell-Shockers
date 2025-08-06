import Navbar from '@/components/Navbar/Navbar';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import React from 'react';
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6 py-12">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Shell Hackathon Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8">Empowering energy innovation with AI and data-driven tools</p>
    </main>
  );
}