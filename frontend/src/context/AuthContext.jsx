import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'toyxonahub_access_token';
const STORAGE_KEY_REFRESH = 'toyxonahub_refresh_token';
const STORAGE_KEY_USER = 'toyxonahub_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_USER);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getMe();
        if (isMounted) {
          setUser(currentUser);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
        }
      } catch (_err) {
        // Token might be invalid or expired
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_REFRESH);
          localStorage.removeItem(STORAGE_KEY_USER);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
      localStorage.removeItem(STORAGE_KEY_USER);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const data = res.data || res;

    // Check if OTP is required (e.g. for owner first login)
    if (data.requireOtp) {
      return {
        requireOtp: true,
        email: data.email,
        message: data.message || 'Iltimos, elektron pochtangizga yuborilgan tasdiqlash kodini kiriting.',
      };
    }

    const { user: authUser, tokens } = data;
    if (tokens?.accessToken) {
      localStorage.setItem(STORAGE_KEY_TOKEN, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken);
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
      setToken(tokens.accessToken);
      setUser(authUser);
    }
    return { success: true, user: authUser };
  }, []);

  const verifyOtp = useCallback(async (email, code) => {
    const res = await authApi.verifyOtp({ email, code });
    const data = res.data || res;
    const { user: authUser, tokens } = data;

    if (tokens?.accessToken) {
      localStorage.setItem(STORAGE_KEY_TOKEN, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken);
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
      setToken(tokens.accessToken);
      setUser(authUser);
    }
    return { success: true, user: authUser };
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    const data = res.data || res;
    const { user: authUser, tokens } = data;

    if (tokens?.accessToken) {
      localStorage.setItem(STORAGE_KEY_TOKEN, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken);
      }
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));
      setToken(tokens.accessToken);
      setUser(authUser);
    }
    return { success: true, user: authUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_USER);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    return updated;
  }, []);

  // Pending booking resumption methods
  const savePendingBooking = useCallback((hallId, draft) => {
    try {
      sessionStorage.setItem(`toyxonahub_pending_booking_${hallId}`, JSON.stringify(draft));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, []);

  const getPendingBooking = useCallback((hallId) => {
    try {
      const raw = sessionStorage.getItem(`toyxonahub_pending_booking_${hallId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const clearPendingBooking = useCallback((hallId) => {
    try {
      sessionStorage.removeItem(`toyxonahub_pending_booking_${hallId}`);
    } catch {
      // Storage unavailable
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    isOwner: user?.role === 'OWNER',
    isUser: user?.role === 'USER',
    login,
    register,
    verifyOtp,
    logout,
    updateProfile,
    savePendingBooking,
    getPendingBooking,
    clearPendingBooking,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
