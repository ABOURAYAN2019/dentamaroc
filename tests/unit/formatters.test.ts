import { describe, it, expect } from 'vitest';
import { formatMAD, formatMoroccanPhone, getWhatsAppReminderLink } from '@/lib/formatters';
import { formatDateMA, calculateAge } from '@/lib/date-utils';

describe('Moroccan Formatters & Date Utilities', () => {
  it('formats currency in Moroccan Dirhams (MAD)', () => {
    const formatted = formatMAD(1250);
    expect(formatted).toContain('1');
    expect(formatted).toContain('250');
    expect(formatted).toContain('MAD');
  });

  it('formats Moroccan phone numbers correctly', () => {
    const international = formatMoroccanPhone('+212661234567');
    expect(international).toContain('+212 6');

    const national = formatMoroccanPhone('0661234567', false);
    expect(national).toBe('06 61 23 45 67');
  });

  it('generates compliant WhatsApp web links with wa.me', () => {
    const link = getWhatsAppReminderLink('+212661234567', 'Rappel RDV DentaMaroc');
    expect(link).toContain('https://wa.me/212661234567');
    expect(link).toContain(encodeURIComponent('Rappel RDV DentaMaroc'));
  });

  it('formats dates in DD/MM/YYYY format', () => {
    const formatted = formatDateMA('2026-10-14');
    expect(formatted).toBe('14/10/2026');
  });

  it('calculates patient age correctly from birthdate', () => {
    const age = calculateAge('1990-01-01');
    expect(age).toBeGreaterThanOrEqual(34);
  });
});
