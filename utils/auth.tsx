import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, User } from '../types';
import { Storage } from './storage';

interface AuthContextType {
  authState: AuthState;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load saved auth state on mount
    Storage.getAuthState()
      .then(setAuthState)
      .finally(() => setIsInitialized(true));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Basic validation - no actual backend
    // In a real app, you'd validate against a backend
    const user: User = { email };
    const newAuthState: AuthState = {
      isAuthenticated: true,
      user,
    };
    setAuthState(newAuthState);
    await Storage.saveAuthState(newAuthState);
    return true;
  };

  const logout = async (): Promise<void> => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      user: null,
    };
    setAuthState(newAuthState);
    await Storage.clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ authState, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

