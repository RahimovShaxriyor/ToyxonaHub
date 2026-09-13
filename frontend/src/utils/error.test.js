import { describe, it, expect } from 'vitest';
import { normalizeApiError } from './error';

describe('normalizeApiError', () => {
  it('normalizes backend validation error with field details', () => {
    const error = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [
              { field: 'phone', message: 'Invalid phone number format' },
              { field: 'capacity', message: 'Capacity must be at least 10' },
            ],
          },
        },
      },
    };

    const normalized = normalizeApiError(error);
    expect(normalized.status).toBe(400);
    expect(normalized.code).toBe('VALIDATION_ERROR');
    expect(normalized.fieldErrors).toEqual({
      phone: 'Invalid phone number format',
      capacity: 'Capacity must be at least 10',
    });
  });

  it('translates EMAIL_ALREADY_EXISTS to friendly Uzbek message', () => {
    const error = {
      response: {
        status: 409,
        data: {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'A user with this email already exists',
          },
        },
      },
    };

    const normalized = normalizeApiError(error);
    expect(normalized.status).toBe(409);
    expect(normalized.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(normalized.message).toBe("Ushbu elektron pochta manzili allaqachon ro'yxatdan o'tgan.");
  });

  it('translates USERNAME_ALREADY_EXISTS to friendly Uzbek message', () => {
    const error = {
      response: {
        status: 409,
        data: {
          success: false,
          error: {
            code: 'USERNAME_ALREADY_EXISTS',
            message: 'A user with this username already exists',
          },
        },
      },
    };

    const normalized = normalizeApiError(error);
    expect(normalized.status).toBe(409);
    expect(normalized.code).toBe('USERNAME_ALREADY_EXISTS');
    expect(normalized.message).toBe("Ushbu foydalanuvchi nomi allaqachon band qilingan.");
  });

  it('handles network disconnection gracefully', () => {
    const error = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };

    const normalized = normalizeApiError(error);
    expect(normalized.status).toBe(0);
    expect(normalized.code).toBe('NETWORK_ERROR');
    expect(normalized.message).toContain('Internet');
  });

  it('falls back to custom fallbackMessage if unmapped error', () => {
    const error = {
      response: {
        status: 500,
        data: {},
      },
    };

    const normalized = normalizeApiError(error, 'Maxsus xatolik');
    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe('Maxsus xatolik');
  });
});
