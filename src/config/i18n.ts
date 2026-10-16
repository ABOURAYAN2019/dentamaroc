import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frTranslation from '../locales/fr/translation.json';
import arTranslation from '../locales/ar/translation.json';
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';

export type SupportedLanguage = 'fr' | 'ar' | 'en' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  shortLabel: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortLabel: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', shortLabel: 'AR', dir: 'rtl' },
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortLabel: 'ES', dir: 'ltr' },
];

export const resources = {
  fr: {
    translation: frTranslation,
  },
  ar: {
    translation: arTranslation,
  },
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar', 'en', 'es'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Handle RTL direction when language changes
export function applyDirection(lng: string) {
  const normalized = lng.split('-')[0].toLowerCase();
  const dir = normalized === 'ar' ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', normalized);
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
  return dir;
}

i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
});

// Initial direction setup
applyDirection(i18n.language || 'fr');

export default i18n;
