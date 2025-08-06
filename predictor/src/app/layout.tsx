import '@/app/global.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar/Navbar';
import { Toaster } from "@/components/ui/sonner" 
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Shell Hackathon',
  description: 'Shell Hackathon project with Next.js + Tailwind',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Toaster />
        <Navbar />
        <main className="pt-20 px-4">{children}</main>
      </body>
    </html>
  );
}

