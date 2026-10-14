import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { RoleSwitcher } from '@/features/auth/RoleSwitcher';
import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Building2 } from 'lucide-react';
import { DEMO_CLINIC } from '@/features/auth/demoData';

export const Navbar: React.FC<{ onMenuToggle?: () => void }> = () => {
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'ar' ? 'fr' : 'ar';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      {/* Clinic identity */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-base shadow-sm">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">
            {DEMO_CLINIC.name}
          </h2>
          <p className="text-xs text-slate-500">
            {DEMO_CLINIC.address.city} • <span className="text-teal-700 font-semibold">{DEMO_CLINIC.licenseNumber}</span>
          </p>
        </div>
      </div>

      {/* Role switcher & utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        <RoleSwitcher />

        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          title="Changer de langue (FR / AR)"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-teal-600" />
          <span>{i18n.language === 'ar' ? 'Français' : 'العربية'}</span>
        </button>

        {/* User profile & logout */}
        <div className="flex items-center gap-2 ps-2 border-s border-slate-200">
          <div className="hidden md:block text-end">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              {user?.fullName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {user?.email}
            </div>
          </div>

          <button
            onClick={() => logout()}
            title="Se déconnecter"
            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
