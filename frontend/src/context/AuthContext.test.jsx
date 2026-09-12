import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext and Draft Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves, retrieves, and clears booking draft in sessionStorage', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    const hallId = 'hall-123';
    const draftData = {
      selectedDate: '2026-10-15',
      guestCount: 350,
      selectedSingerId: 'singer-1',
      openModal: true,
    };

    // Initially draft is null
    expect(result.current.getPendingBooking(hallId)).toBeNull();

    // Save draft
    act(() => {
      result.current.savePendingBooking(hallId, draftData);
    });

    // Retrieve draft
    const retrieved = result.current.getPendingBooking(hallId);
    expect(retrieved).toEqual(draftData);
    expect(sessionStorage.getItem(`toyxonahub_pending_booking_${hallId}`)).toBeTruthy();

    // Clear draft
    act(() => {
      result.current.clearPendingBooking(hallId);
    });

    expect(result.current.getPendingBooking(hallId)).toBeNull();
    expect(sessionStorage.getItem(`toyxonahub_pending_booking_${hallId}`)).toBeNull();
  });

  it('provides correct role helpers based on user', () => {
    localStorage.setItem(
      'toyxonahub_user',
      JSON.stringify({ id: 'admin1', role: 'ADMIN', email: 'admin@toyxonahub.uz' })
    );
    localStorage.setItem('toyxonahub_access_token', 'mock-token');

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isUser).toBe(false);
  });

  it('clears state on logout', () => {
    localStorage.setItem('toyxonahub_access_token', 'mock-token');
    localStorage.setItem('toyxonahub_user', JSON.stringify({ id: 'u1', role: 'USER' }));

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('toyxonahub_access_token')).toBeNull();
  });
});
