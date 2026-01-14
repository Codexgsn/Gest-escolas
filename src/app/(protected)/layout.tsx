
'use client';

import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Para a exportação estática, o login não é funcional.
  // Esta lógica pode ser removida ou adaptada se a autenticação
  // for tratada de outra forma (por exemplo, em uma SPA com API).
  const { currentUser, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Na versão estática, não há login, então essa verificação pode ser comentada
    // if (isLoaded && !currentUser) {
    //   router.push('/');
    // }
  }, [currentUser, isLoaded, router]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-row">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <div className="relative flex flex-1 flex-col items-center bg-background">
              <Header />
              <main className="w-full flex-1 p-4 sm:px-6 md:gap-8">{children}</main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
