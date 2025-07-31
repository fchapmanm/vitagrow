import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';

type AuthContextType = {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkGuest = async () => {
      const guest = await AsyncStorage.getItem('isGuest');
      setIsGuest(guest === 'true');
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
      
      // Si no hay usuario autenticado, asegurar que esté en modo invitado
      if (!firebaseUser) {
        checkGuest();
      }
    });

    checkGuest();
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('isGuest');
    await auth.signOut();
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


