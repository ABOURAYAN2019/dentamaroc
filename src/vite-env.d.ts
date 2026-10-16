/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Application Branding & Mode
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_ENABLE_ROLE_SWITCHER?: string;

  // Regional & Medical Compliance Settings
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_DEFAULT_LOCALE?: string;
  readonly VITE_TIMEZONE?: string;
  readonly VITE_COUNTRY_DIAL_CODE?: string;
  readonly VITE_DEFAULT_CITY?: string;
  readonly VITE_REGULATORY_AUTHORITY?: string;
  readonly VITE_REGULATORY_LAW?: string;

  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_REGION?: string;
  readonly VITE_USE_EMULATORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
