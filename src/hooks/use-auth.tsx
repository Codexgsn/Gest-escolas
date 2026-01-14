
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById as getUserByIdAction } from '@/app/actions/data';
import type { User } from '@/lib/data';

interface AuthContextType {
  currentUser: User | null;
  isLoaded: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This code runs only on the client
    const loadUser = async () => {
        try {
            const storedUserId = localStorage.getItem('loggedInUserId');
            if (storedUserId) {
                const user = await getUserByIdAction(storedUserId);
                if (user) {
                    setCurrentUser(user);
                }
            }
        } catch (error) {
            console.error("Failed to access localStorage or get user", error);
        } finally {
            setIsLoaded(true);
        }
    };
    loadUser();
  }, []);

  const login = async (userId: string) => {
    try {
        localStorage.setItem('loggedInUserId', userId);
        const user = await getUserByIdAction(userId);
        if (user) {
            setCurrentUser(user);
        }
    } catch (error) {
        console.error("Failed to login", error)
    }
  };

  const logout = () => {
    try {
        localStorage.removeItem('loggedInUserId');
        setCurrentUser(null);
    } catch (error) {
        console.error("Failed to logout", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
