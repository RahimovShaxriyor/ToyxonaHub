import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiClient from './axios';

describe('apiClient Axios Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('attaches Authorization Bearer token if present in localStorage', async () => {
    localStorage.setItem('toyxonahub_access_token', 'test-access-token-123');

    // Simulate interceptor request handler
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer test-access-token-123');
  });

  it('does not attach Authorization header if no token in localStorage', async () => {
    const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('dispatches auth:logout and clears localStorage on 401 when no refresh token', async () => {
    localStorage.setItem('toyxonahub_access_token', 'expired-token');
    // No refresh token

    const logoutEventSpy = vi.fn();
    window.addEventListener('auth:logout', logoutEventSpy);

    const responseInterceptorErr = apiClient.interceptors.response.handlers[0].rejected;
    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/wedding-halls', headers: {} },
    };

    await expect(responseInterceptorErr(error)).rejects.toBeDefined();

    expect(localStorage.getItem('toyxonahub_access_token')).toBeNull();
    expect(logoutEventSpy).toHaveBeenCalled();
  });
});
