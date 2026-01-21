
'use client';

import { useEffect, useState } from 'react';
import { useLayoutStore } from '@/lib/store';
import { ViewportSync } from '@/components/viewport-sync';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const { setOpen, toggle } = useLayoutStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Efeito para ler o estado do cookie
  useEffect(() => {
    if (isMounted) {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split('=')[1];
      if (cookieValue) {
        setOpen(cookieValue === 'true');
      }
    }
  }, [setOpen, isMounted]);

  // Efeito para o atalho de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return (
    <>
      <ViewportSync />
      {children}
    </>
  );
}
