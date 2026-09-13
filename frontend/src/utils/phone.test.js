import { describe, it, expect } from 'vitest';
import { cleanPhoneNumber, formatPhoneDisplay } from './phone';

describe('phone utility', () => {
  it('cleans spaced phone number into international +998 format', () => {
    expect(cleanPhoneNumber('+998 90 123 45 67')).toBe('+998901234567');
  });

  it('cleans raw 9-digit phone number without prefix', () => {
    expect(cleanPhoneNumber('901234567')).toBe('+998901234567');
  });

  it('cleans 998 without plus', () => {
    expect(cleanPhoneNumber('998901234567')).toBe('+998901234567');
  });

  it('strips dashes and brackets', () => {
    expect(cleanPhoneNumber('+998 (90) 123-45-67')).toBe('+998901234567');
  });

  it('handles empty or non-string input safely', () => {
    expect(cleanPhoneNumber('')).toBe('');
    expect(cleanPhoneNumber(null)).toBe('');
    expect(cleanPhoneNumber(undefined)).toBe('');
  });

  it('formats display correctly', () => {
    expect(formatPhoneDisplay('+998901234567')).toBe('+998 (90) 123-45-67');
    expect(formatPhoneDisplay('+998 90 123 45 67')).toBe('+998 (90) 123-45-67');
  });
});
