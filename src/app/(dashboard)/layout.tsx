
'use client';

import { useAppUser } from '@/hooks/use-app-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AppSidebar = dynamic(() => import('@/components/app-sidebar'), { ssr: false });
const Header = dynamic(() => import('@/components/header'), { ssr: false });

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentUser, isLoaded } = useAppUser();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!isLoaded) {
      // Wait for the user's auth status to be determined.
      return;
    }

    if (!currentUser) {
      // If the user is not logged in, redirect them to the login page.
      router.replace('/');
    } else {
      // If the user is logged in, stop verifying and allow content to render.
      setIsVerifying(false);
    }
  }, [currentUser, isLoaded, router]);

  // While verifying the user's status, show a loading screen.
  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-foreground">Verificando acesso...</div>
      </div>
    );
  }

  // If verification is complete and the user is logged in, render the dashboard layout.
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <Header />
        {children}
      </main>
    </div>
  );
}
