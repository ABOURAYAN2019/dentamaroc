import { z } from 'zod';

/**
 * Schema validating environment variables with sensible defaults for out-of-the-box usage.
 * Third parties can customize branding, regional standards (currency, phone prefix, timezone),
 * regulatory labels, and Firebase endpoints solely through `.env` variables.
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('DentaMaroc'),
  VITE_APP_TAGLINE: z
    .string()
    .default('Logiciel Médical & Gestion de Cabinet Dentaire'),
  VITE_APP_VERSION: z.string().default('0.2.0'),
  VITE_DEMO_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  VITE_ENABLE_ROLE_SWITCHER: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  // Regional & Compliance defaults (Morocco out of the box, configurable for any country)
  VITE_DEFAULT_CURRENCY: z.string().min(1).default('MAD'),
  VITE_DEFAULT_LOCALE: z.string().min(2).default('fr-MA'),
  VITE_TIMEZONE: z.string().min(1).default('Africa/Casablanca'),
  VITE_COUNTRY_DIAL_CODE: z.string().regex(/^\d{1,4}$/).default('212'),
  VITE_DEFAULT_CITY: z.string().default('Casablanca'),
  VITE_REGULATORY_AUTHORITY: z.string().default('CNDP'),
  VITE_REGULATORY_LAW: z.string().default('Loi 09-08'),

  // Firebase Backend
  VITE_FIREBASE_API_KEY: z.string().default('demo-api-key-for-emulator'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().default('dentamaroc-dev.firebaseapp.com'),
  VITE_FIREBASE_PROJECT_ID: z.string().default('dentamaroc-dev'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().default('dentamaroc-dev.appspot.com'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().default('1234567890'),
  VITE_FIREBASE_APP_ID: z.string().default('1:1234567890:web:abcdef123456'),
  VITE_FIREBASE_REGION: z.string().default('europe-west9'),
  VITE_USE_EMULATORS: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export interface AppConfig {
  app: {
    name: string;
    tagline: string;
    version: string;
    demoMode: boolean;
    enableRoleSwitcher: boolean;
  };
  regional: {
    currency: string;
    locale: string;
    timezone: string;
    countryDialCode: string;
    countryDialPrefix: string;
    defaultCity: string;
    regulatoryAuthority: string;
    regulatoryLaw: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    region: string;
    useEmulators: boolean;
  };
}

/**
 * Parses a raw environment dictionary into a strongly-typed `AppConfig`.
 * Exported as a pure function to allow unit testing custom third-party configurations.
 */
export function parseAppConfig(
  rawEnv: Record<string, string | boolean | undefined>
): AppConfig {
  const stringified: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(rawEnv)) {
    if (value !== undefined && value !== '') {
      stringified[key] = String(value);
    }
  }

  const parsed = envSchema.safeParse(stringified);
  const data = parsed.success ? parsed.data : envSchema.parse({});
  const isDev = rawEnv.DEV === true || rawEnv.DEV === 'true';

  return {
    app: {
      name: data.VITE_APP_NAME,
      tagline: data.VITE_APP_TAGLINE,
      version: data.VITE_APP_VERSION,
      demoMode: data.VITE_DEMO_MODE,
      enableRoleSwitcher: data.VITE_ENABLE_ROLE_SWITCHER,
    },
    regional: {
      currency: data.VITE_DEFAULT_CURRENCY,
      locale: data.VITE_DEFAULT_LOCALE,
      timezone: data.VITE_TIMEZONE,
      countryDialCode: data.VITE_COUNTRY_DIAL_CODE,
      countryDialPrefix: `+${data.VITE_COUNTRY_DIAL_CODE}`,
      defaultCity: data.VITE_DEFAULT_CITY,
      regulatoryAuthority: data.VITE_REGULATORY_AUTHORITY,
      regulatoryLaw: data.VITE_REGULATORY_LAW,
    },
    firebase: {
      apiKey: data.VITE_FIREBASE_API_KEY,
      authDomain: data.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: data.VITE_FIREBASE_PROJECT_ID,
      storageBucket: data.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: data.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: data.VITE_FIREBASE_APP_ID,
      region: data.VITE_FIREBASE_REGION,
      useEmulators: data.VITE_USE_EMULATORS ?? isDev,
    },
  };
}

export const appConfig: AppConfig = parseAppConfig(
  import.meta.env as unknown as Record<string, string | boolean | undefined>
);
