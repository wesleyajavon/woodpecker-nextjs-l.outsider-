'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminRoute from '@/components/AdminRoute';
import { HomeBackground } from '@/components/home/HomeBackground';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const beatIdMatch = pathname?.match(/\/admin\/beats\/([^/]+)/);
  const beatId = beatIdMatch ? beatIdMatch[1] : undefined;

  return (
    <AdminRoute>
      <div className="relative flex min-h-screen overflow-hidden bg-background">
        <HomeBackground />
        <AdminSidebar beatId={beatId} />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    </AdminRoute>
  );
}
