/**
 * Phone number sanitization and formatting utilities
 */

/**
 * Strips formatting, whitespace, hyphens, and parentheses from a phone input.
 * Ensures the international +998 format where applicable.
 *
 * Examples:
 * "+998 90 123 45 67" -> "+998901234567"
 * "90 123 45 67"       -> "+998901234567"
 * "998901234567"       -> "+998901234567"
 */
export function cleanPhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return '';

  // Remove any whitespace, hyphens, parentheses, or dots
  let cleaned = raw.trim().replace(/[\s\-().]/g, '');

  // If starts with 998 without +, prepend +
  if (cleaned.startsWith('998') && !cleaned.startsWith('+998')) {
    cleaned = '+' + cleaned;
  } else if (/^\d{9}$/.test(cleaned)) {
    // 9 digits without country code (e.g. 901234567)
    cleaned = '+998' + cleaned;
  }

  return cleaned;
}

/**
 * Formats a raw phone string into standard display format: +998 (90) 123-45-67
 */
export function formatPhoneDisplay(raw) {
  const cleaned = cleanPhoneNumber(raw);
  if (!cleaned) return '';

  // Match +998 followed by 9 digits
  const match = cleaned.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    const [, code, part1, part2, part3] = match;
    return `+998 (${code}) ${part1}-${part2}-${part3}`;
  }

  return cleaned;
}
