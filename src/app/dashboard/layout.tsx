'use client';

import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen w-full flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 flex-col items-center bg-background">
          <Header />
          <main className="w-full flex-1 p-4 sm:px-6 md:gap-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
