import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

describe('ProtectedRoute', () => {
  it('renders loading skeleton when auth is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Maxfiy ma'lumot</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Maxfiy ma'lumot")).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login with state', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Maxfiy ma'lumot</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Kirish sahifasi</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Kirish sahifasi')).toBeInTheDocument();
    expect(screen.queryByText("Maxfiy ma'lumot")).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'USER' },
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Maxfiy ma'lumot</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Maxfiy ma'lumot")).toBeInTheDocument();
  });
});
