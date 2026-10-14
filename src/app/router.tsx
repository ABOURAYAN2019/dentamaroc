import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard, RoleGuard } from '@/features/auth/AuthGuard';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PatientsPage } from '@/features/patients/PatientsPage';
import { PatientDetailPage } from '@/features/patients/PatientDetailPage';
import { AgendaPage } from '@/features/agenda/AgendaPage';
import { TreatmentsPage } from '@/features/treatments/TreatmentsPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'agenda',
        element: <AgendaPage />,
      },
      {
        path: 'patients',
        element: <PatientsPage />,
      },
      {
        path: 'patients/:id',
        element: <PatientDetailPage />,
      },
      {
        path: 'treatments',
        element: (
          <RoleGuard allowedRoles={['dentist', 'assistant']}>
            <TreatmentsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'billing',
        element: (
          <RoleGuard allowedRoles={['dentist', 'secretary']}>
            <BillingPage />
          </RoleGuard>
        ),
      },
      {
        path: 'documents',
        element: (
          <RoleGuard allowedRoles={['dentist', 'assistant']}>
            <DocumentsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleGuard allowedRoles={['dentist']}>
            <SettingsPage />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
