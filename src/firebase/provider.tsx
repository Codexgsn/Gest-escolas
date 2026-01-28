'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { app, auth, database } from './client';
import { User } from '@/lib/definitions';

interface FirebaseContextValue {
  app: typeof app;
  auth: typeof auth;
  database: typeof database;
  currentUser: User | null;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserListener: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Cancelar listener anterior se existir
      if (unsubscribeUserListener) {
        unsubscribeUserListener();
        unsubscribeUserListener = null;
      }

      if (firebaseUser) {
        const userRef = ref(database, 'users/' + firebaseUser.uid);

        unsubscribeUserListener = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setCurrentUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || 'No Name',
              role: userData.role === 'Admin' ? 'Admin' : 'Usuário',
              avatarUrl: userData.avatarUrl || '/avatars/default.png',
              avatar: userData.avatar || userData.avatarUrl || '/avatars/default.png',
              createdAt: userData.createdAt || new Date().toISOString(),
            });
            setIsUserLoading(false);
          } else {
            // User not in DB, create them
            const newUser: User = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'Novo Usuário',
                role: 'Usuário', // Default role
                avatarUrl: '/avatars/default.png',
                avatar: '/avatars/default.png',
                createdAt: new Date().toISOString(),
            };
            set(userRef, newUser).catch(err => {
                console.error("Error creating user in DB:", err);
                setIsUserLoading(false);
            });
          }
        }, (error) => {
            console.error("Firebase Database onValue Error (users):", error);
            setIsUserLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsUserLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserListener) unsubscribeUserListener();
    };
  }, []);

  const value: FirebaseContextValue = {
    app,
    auth,
    database,
    currentUser,
    isUserLoading,
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a FirebaseProvider");
    }
    return { currentUser: context?.currentUser, isUserLoading: context?.isUserLoading ?? true };
};
