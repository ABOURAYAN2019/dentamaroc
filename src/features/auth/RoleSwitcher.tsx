import React from 'react';
import { useAuth } from './AuthContext';
import { UserRole } from '@/types';
import { Stethoscope, UserCheck, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RoleSwitcher: React.FC = () => {
  const { role, loginAsDemoRole } = useAuth();
  const { t } = useTranslation();

  const roles: Array<{
    key: UserRole;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      key: 'dentist',
      label: t('roles.dentist'),
      shortLabel: t('roles.dentistShort'),
      icon: Stethoscope,
      color: 'bg-teal-700 text-white border-teal-600',
    },
    {
      key: 'assistant',
      label: t('roles.assistant'),
      shortLabel: t('roles.assistantShort'),
      icon: UserCheck,
      color: 'bg-sky-700 text-white border-sky-600',
    },
    {
      key: 'secretary',
      label: t('roles.secretary'),
      shortLabel: t('roles.secretaryShort'),
      icon: Shield,
      color: 'bg-rose-700 text-white border-rose-600',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 text-xs shadow-md">
      <span className="text-slate-400 font-medium hidden sm:inline">{t('roles.activeRole')}</span>
      <div className="flex gap-1">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => loginAsDemoRole(r.key)}
              title={t('roles.switchRole', { role: r.label })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? `${r.color} shadow-sm ring-2 ring-white/20 scale-105`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
