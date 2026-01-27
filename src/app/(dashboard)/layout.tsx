
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { DashboardProviders } from '@/components/dashboard-providers';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), { ssr: false });
const Header = dynamic(() => import('@/components/header'), { ssr: false });

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, loading: isLoaded } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    if (!currentUser) {
      router.replace('/');
    } else {
      setIsVerifying(false);
    }
  }, [currentUser, isLoaded, router]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-foreground">Verificando acesso...</div>
      </div>
    );
  }

  return (
    <DashboardProviders>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Header />
          {children}
        </main>
      </div>
    </DashboardProviders>
  );
}
