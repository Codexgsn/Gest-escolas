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
    const authInstance = getAuth(app);
    const dbInstance = getDatabase(app);

    const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = ref(dbInstance, 'users/' + firebaseUser.uid);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setCurrentUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || 'No Name',
              role: userData.role || 'User',
              avatarUrl: userData.avatarUrl || '/avatars/default.png',
            });
          } else {
            // User not in DB, create them
            const newUser: User = {
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'New User',
                role: 'User', // Default role
                avatarUrl: '/avatars/default.png'
            };
            set(userRef, newUser).then(() => {
                setCurrentUser(newUser);
            });
          }
          setIsUserLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setCurrentUser(null);
            setIsUserLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsUserLoading(false);
      }
    });

    return () => unsubscribe();
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
