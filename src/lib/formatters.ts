/**
 * Format currency in Moroccan Dirhams (MAD)
 */
export function formatMAD(amount: number, options: { includeSymbol?: boolean; locale?: string } = {}): string {
  const { includeSymbol = true, locale = 'fr-MA' } = options;
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return includeSymbol ? `${formatted} MAD` : formatted;
}

/**
 * Format Moroccan phone number to +212 X XX XX XX XX or national 0X XX XX XX XX
 */
export function formatMoroccanPhone(phone: string, international = true): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  
  if (cleaned.startsWith('+212')) {
    const local = cleaned.slice(4);
    if (!international) return `0${local}`;
    return `+212 ${local.slice(0, 1)} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`.trim();
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    if (international) {
      return `+212 ${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone;
}

/**
 * Generate WhatsApp direct link with pre-filled message for Morocco
 */
export function getWhatsAppReminderLink(phone: string, message: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '212' + cleaned.slice(1);
  } else if (!cleaned.startsWith('212')) {
    cleaned = '212' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
