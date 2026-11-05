'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/crm/types';
import { api } from '@/lib/crm/api';

/**
 * CRM session state. Signing in happens on the shared team login page
 * (/owner/login); this only reads who is signed in from the Django session.
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isManager: boolean;
  isSalesPerson: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  hasPermission: (permission: string) => boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.getMe());
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    await api.logout();
    setUser(null);
    window.location.href = '/owner/login?next=/crm';
  };

  const isManager = Boolean(user && (user.is_manager_or_admin || user.is_superuser));
  const isSalesPerson = Boolean(user && (user.role === 'sales_person' || user.role === 'counselor'));

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (isManager) return true;
    return Boolean(user.permissions && user.permissions.includes(permission));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isManager,
        isSalesPerson,
        canDelete: isManager,
        canManageUsers: isManager,
        hasPermission,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
