
'use client';

import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayoutStore } from '@/lib/store';

export function ViewportSync() {
  const isMobile = useIsMobile();
  const setIsMobile = useLayoutStore((s) => s.setIsMobile);

  useEffect(() => {
    if (isMobile === null) return;
    
    // Verifica o estado atual para evitar atualizações redundantes
    if (useLayoutStore.getState().isMobile !== isMobile) {
        setIsMobile(isMobile);
    }
  }, [isMobile, setIsMobile]);

  return null;
}
