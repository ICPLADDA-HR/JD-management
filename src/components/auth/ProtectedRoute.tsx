import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary-200"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-accent-500 border-t-transparent animate-spin"></div>
          </div>
          {/* Loading text */}
          <div className="text-center">
            <p className="text-lg font-medium text-primary-600">กำลังโหลด...</p>
            <p className="text-sm text-primary-400 mt-1">กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

  // For testing, always allow access
  return <>{children}</>;
};