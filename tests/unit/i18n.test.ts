import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, resources, applyDirection } from '@/config/i18n';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n 4-Language Support (FR, AR, EN, ES)', () => {
  it('registers French, Arabic, English, and Spanish in SUPPORTED_LANGUAGES', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(['fr', 'ar', 'en', 'es']);
  });

  it('maintains 100% translation key parity across FR, AR, EN, and ES', () => {
    const frKeys = flattenKeys(resources.fr.translation);
    const arKeys = flattenKeys(resources.ar.translation);
    const enKeys = flattenKeys(resources.en.translation);
    const esKeys = flattenKeys(resources.es.translation);

    expect(frKeys.length).toBeGreaterThan(100);
    expect(arKeys).toEqual(frKeys);
    expect(enKeys).toEqual(frKeys);
    expect(esKeys).toEqual(frKeys);
  });

  it('applies RTL direction for Arabic and LTR for FR, EN, and ES', () => {
    expect(applyDirection('ar')).toBe('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.body.classList.contains('rtl')).toBe(true);

    for (const lng of ['fr', 'en', 'es']) {
      expect(applyDirection(lng)).toBe('ltr');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(document.body.classList.contains('rtl')).toBe(false);
    }
  });
});
