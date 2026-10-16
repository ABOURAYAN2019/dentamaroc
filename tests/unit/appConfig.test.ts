import { describe, it, expect } from 'vitest';
import { parseAppConfig } from '@/config/app.config';
import { formatCurrency, formatPhoneNumber, getWhatsAppReminderLink } from '@/lib/formatters';

describe('appConfig & Third-Party Customization', () => {
  it('provides Moroccan defaults out of the box when no env variables are set', () => {
    const cfg = parseAppConfig({});
    expect(cfg.app.name).toBe('DentaMaroc');
    expect(cfg.regional.currency).toBe('MAD');
    expect(cfg.regional.countryDialCode).toBe('212');
    expect(cfg.regional.countryDialPrefix).toBe('+212');
    expect(cfg.regional.timezone).toBe('Africa/Casablanca');
    expect(cfg.regional.regulatoryAuthority).toBe('CNDP');
    expect(cfg.firebase.region).toBe('europe-west9');
  });

  it('allows third parties to rebrand and localize for another country via env variables', () => {
    const cfg = parseAppConfig({
      VITE_APP_NAME: 'DentaTunis',
      VITE_DEFAULT_CURRENCY: 'TND',
      VITE_DEFAULT_LOCALE: 'fr-TN',
      VITE_COUNTRY_DIAL_CODE: '216',
      VITE_TIMEZONE: 'Africa/Tunis',
      VITE_DEFAULT_CITY: 'Tunis',
      VITE_REGULATORY_AUTHORITY: 'INPDP',
      VITE_REGULATORY_LAW: 'Loi Organique 2004-63',
      VITE_ENABLE_ROLE_SWITCHER: 'false',
      VITE_USE_EMULATORS: 'false',
    });

    expect(cfg.app.name).toBe('DentaTunis');
    expect(cfg.app.enableRoleSwitcher).toBe(false);
    expect(cfg.regional.currency).toBe('TND');
    expect(cfg.regional.countryDialPrefix).toBe('+216');
    expect(cfg.regional.defaultCity).toBe('Tunis');
    expect(cfg.regional.regulatoryAuthority).toBe('INPDP');
    expect(cfg.firebase.useEmulators).toBe(false);
  });

  it('formats currency and phone numbers for custom country configurations', () => {
    expect(formatCurrency(850, { currency: 'EUR', locale: 'fr-FR' })).toContain('EUR');
    expect(formatPhoneNumber('0612345678', true, '33')).toBe('+33 6 12 34 56 78');
    expect(getWhatsAppReminderLink('0612345678', 'Bonjour', '33')).toBe(
      'https://wa.me/33612345678?text=Bonjour'
    );
  });
});
