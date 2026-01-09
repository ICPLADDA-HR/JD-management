import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for testing
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: AuthContextType = {
    user: mockUser, // Always return mock user for testing
    loading: false,
    signIn: async () => {
      // Mock sign in
      console.log('Mock sign in');
    },
    signOut: async () => {
      // Mock sign out
      console.log('Mock sign out');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};