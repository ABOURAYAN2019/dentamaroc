import { appConfig } from '@/config/app.config';

export interface CurrencyFormatOptions {
  includeSymbol?: boolean;
  locale?: string;
  currency?: string;
}

/**
 * Formats an amount using the configured currency and locale (defaults to MAD / fr-MA).
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    includeSymbol = true,
    locale = appConfig.regional.locale,
    currency = appConfig.regional.currency,
  } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? `${formatted} ${currency}` : formatted;
}

/**
 * Alias for `formatCurrency` kept for Moroccan context clarity.
 */
export const formatMAD = formatCurrency;

/**
 * Formats a phone number to international (`+<dialCode> X XX XX XX XX`) or national (`0X XX XX XX XX`).
 */
export function formatPhoneNumber(
  phone: string,
  international = true,
  dialCode = appConfig.regional.countryDialCode
): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  const prefix = `+${dialCode}`;

  if (cleaned.startsWith(prefix)) {
    const local = cleaned.slice(prefix.length);
    if (!international) return `0${local}`;
    return `${prefix} ${local.slice(0, 1)} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`.trim();
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    if (international) {
      return `${prefix} ${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone;
}

/**
 * Alias for `formatPhoneNumber` kept for Moroccan context clarity.
 */
export const formatMoroccanPhone = formatPhoneNumber;

/**
 * Generates a direct WhatsApp (`wa.me`) URL with a pre-filled reminder message.
 */
export function getWhatsAppReminderLink(
  phone: string,
  message: string,
  dialCode = appConfig.regional.countryDialCode
): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = dialCode + cleaned.slice(1);
  } else if (!cleaned.startsWith(dialCode)) {
    cleaned = dialCode + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
