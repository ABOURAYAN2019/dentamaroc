import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  Receipt,
  FileText,
  Settings,
  Sparkles,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isDentist, isAssistant, isBillingStaff, isClinicalStaff } = useAuth();

  const navigationItems = [
    {
      to: '/',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      show: true,
    },
    {
      to: '/agenda',
      label: t('nav.agenda'),
      icon: Calendar,
      show: true,
    },
    {
      to: '/patients',
      label: t('nav.patients'),
      icon: Users,
      show: true,
    },
    {
      to: '/treatments',
      label: t('nav.treatments'),
      icon: Layers,
      show: isClinicalStaff, // Only Dentist and Assistant
    },
    {
      to: '/billing',
      label: t('nav.billing'),
      icon: Receipt,
      show: isBillingStaff || isDentist, // Dentist and Secretary
    },
    {
      to: '/documents',
      label: t('nav.documents'),
      icon: FileText,
      show: isClinicalStaff,
    },
    {
      to: '/settings',
      label: t('nav.settings'),
      icon: Settings,
      show: isDentist, // Only Dentist (Admin)
    },
  ];

  return (
    <aside className="w-64 border-e border-slate-200 bg-white flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0">
      {/* Navigation links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Principale
        </div>
        {navigationItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
      </div>

      {/* Footer info: CNDP & Version */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">DentaMaroc MVP v0.1</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          Conformité Loi 09-08 (CNDP) • Heure Maroc (UTC+1)
        </p>
      </div>
    </aside>
  );
};
