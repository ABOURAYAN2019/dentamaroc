import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TIMEZONE_CASABLANCA = 'Africa/Casablanca';

/**
 * Format a Date or ISO string into Moroccan standard format: JJ/MM/AAAA
 */
export function formatDateMA(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '-';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

/**
 * Format date & time: JJ/MM/AAAA à HH:mm
 */
export function formatDateTimeMA(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '-';
    return format(d, 'dd/MM/yyyy à HH:mm', { locale: fr });
  } catch {
    return '-';
  }
}

/**
 * Format time only: HH:mm
 */
export function formatTimeMA(date: Date | string | number | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(d)) return '-';
    return format(d, 'HH:mm');
  } catch {
    return '-';
  }
}

/**
 * Calculate age from YYYY-MM-DD birthdate
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}
