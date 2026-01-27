
'use client';

import { useFirebase } from '@/firebase/provider';

export function useAuth() {
  const { currentUser, isUserLoading } = useFirebase();

  return {
    user: currentUser,
    loading: isUserLoading,
    currentUser,
    isUserLoading
  };
}
