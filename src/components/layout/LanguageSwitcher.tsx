import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/config/i18n';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'login' | 'cards';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'navbar' }) => {
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'fr') as SupportedLanguage;

  const handleSelect = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
  };

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={t('languages.label')}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              aria-pressed={active}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                active
                  ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{lang.nativeLabel}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {lang.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div
        className="inline-flex items-center gap-1 rounded-xl bg-white/10 p-1 backdrop-blur border border-white/15"
        role="group"
        aria-label={t('languages.label')}
      >
        <Globe className="w-3.5 h-3.5 text-teal-300 ms-1.5 me-0.5" />
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              aria-pressed={active}
              title={lang.nativeLabel}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              {lang.nativeLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
      <Globe className="h-3.5 w-3.5 text-teal-600 shrink-0" />
      <select
        aria-label={t('languages.label')}
        value={currentLang}
        onChange={(e) => handleSelect(e.target.value as SupportedLanguage)}
        className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pe-1"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.shortLabel} — {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
};
