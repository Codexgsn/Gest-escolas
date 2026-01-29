'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  return <>{children}</>;
}
