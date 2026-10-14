import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { DEMO_CLINIC_ID } from './demoData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  clinicId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  loginAsDemoRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  isDentist: boolean;
  isAssistant: boolean;
  isSecretary: boolean;
  isClinicalStaff: boolean;
  isBillingStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  dentist: {
    id: 'user-dentist-1',
    email: 'dr.tazi@cabinet-tazi.ma',
    fullName: 'Dr. Amine TAZI',
    role: 'dentist',
    phone: '+212661305070',
    clinicId: DEMO_CLINIC_ID,
    active: true,
    colorCode: '#0d9488',
    createdAt: '2026-01-01T08:00:00Z',
  },
  assistant: {
    id: 'user-assistant-1',
    email: 'fatima@cabinet-tazi.ma',
    fullName: 'Fatima Zohra BENJELLOUN',
    role: 'assistant',
    phone: '+212662445566',
    clinicId: DEMO_CLINIC_ID,
    active: true,
    colorCode: '#0284c7',
    createdAt: '2026-01-05T08:00:00Z',
  },
  secretary: {
    id: 'user-secretary-1',
    email: 'nadia@cabinet-tazi.ma',
    fullName: 'Nadia IDRISSI',
    role: 'secretary',
    phone: '+212663778899',
    clinicId: DEMO_CLINIC_ID,
    active: true,
    colorCode: '#e11d48',
    createdAt: '2026-01-08T08:00:00Z',
  },
};

const STORAGE_KEY = 'dentamaroc_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to dentist for pleasant immediate evaluation
    return DEMO_USERS.dentist;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, forcedRole: UserRole = 'dentist') => {
    setIsLoading(true);
    try {
      // Find matching demo user or create session
      const found = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
      const chosenUser = found || {
        ...DEMO_USERS[forcedRole],
        email,
      };
      setUser(chosenUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoRole = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role || null;
  const clinicId = user?.clinicId || null;
  const isAuthenticated = !!user;

  const isDentist = role === 'dentist';
  const isAssistant = role === 'assistant';
  const isSecretary = role === 'secretary';
  const isClinicalStaff = isDentist || isAssistant;
  const isBillingStaff = isDentist || isSecretary;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        clinicId,
        isAuthenticated,
        isLoading,
        login,
        loginAsDemoRole,
        logout,
        isDentist,
        isAssistant,
        isSecretary,
        isClinicalStaff,
        isBillingStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
