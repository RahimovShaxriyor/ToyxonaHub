import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number into currency string with spaces (e.g., "150 000 so'm")
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "0 so'm";
  }
  const numeric = Math.round(Number(amount));
  const formatted = numeric.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} so'm`;
}

/**
 * Format a calendar date string (YYYY-MM-DD or ISO) into readable display
 * @param {string|Date} dateStr
 * @param {string} formatPattern
 * @returns {string}
 */
export function formatDate(dateStr, formatPattern = 'dd.MM.yyyy') {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return String(dateStr);
    return format(date, formatPattern);
  } catch {
    return String(dateStr);
  }
}

/**
 * Format date for friendly human display (e.g., "15-sentabr, 2026")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr.slice(0, 10)) : dateStr;
    if (!isValid(date)) return String(dateStr);
    return `${date.getDate()}-${months[date.getMonth()]}, ${date.getFullYear()}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Normalize and format phone number for display (+998 90 123 45 67)
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('998')) {
    return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10, 12)}`;
  }
  return phone;
}
