import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Chargement de DentaMaroc...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RoleGuard: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback }) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900 my-4">
        <p className="font-semibold text-base mb-1">Accès Restreint par la Politique du Cabinet</p>
        <p className="text-sm text-amber-700">
          Votre rôle actuel ne dispose pas des autorisations nécessaires pour consulter ou modifier ce module clinique.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
