import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, formatFriendlyDate, formatPhone } from './formatters';

describe('formatters utility', () => {
  describe('formatPrice', () => {
    it('formats numbers with spaces and currency suffix', () => {
      expect(formatPrice(150000)).toBe("150 000 so'm");
      expect(formatPrice(15000000)).toBe("15 000 000 so'm");
      expect(formatPrice(0)).toBe("0 so'm");
    });

    it('handles undefined or null gracefully', () => {
      expect(formatPrice(null)).toBe("0 so'm");
      expect(formatPrice(undefined)).toBe("0 so'm");
      expect(formatPrice('invalid')).toBe("0 so'm");
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates correctly', () => {
      expect(formatDate('2026-09-15', 'dd.MM.yyyy')).toBe('15.09.2026');
      expect(formatDate('2026-12-31', 'yyyy/MM/dd')).toBe('2026/12/31');
    });

    it('handles empty input gracefully', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatFriendlyDate', () => {
    it('formats dates in human friendly format with Uzbek month names', () => {
      expect(formatFriendlyDate('2026-09-15')).toBe('15-sentabr, 2026');
      expect(formatFriendlyDate('2026-01-01')).toBe('1-yanvar, 2026');
    });

    it('returns empty string for empty input', () => {
      expect(formatFriendlyDate('')).toBe('');
    });
  });

  describe('formatPhone', () => {
    it('formats 12-digit Uzbekistan phone numbers', () => {
      expect(formatPhone('998901234567')).toBe('+998 (90) 123-45-67');
      expect(formatPhone('+998 90 123 45 67')).toBe('+998 (90) 123-45-67');
    });

    it('returns unformatted string if not 12-digit standard', () => {
      expect(formatPhone('12345')).toBe('12345');
    });
  });
});
