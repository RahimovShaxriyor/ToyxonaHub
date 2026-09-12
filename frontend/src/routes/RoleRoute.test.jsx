import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import * as AuthContext from '../context/AuthContext';

describe('RoleRoute', () => {
  it('renders children when user role matches allowedRoles', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'admin1', role: 'ADMIN' },
    });

    render(
      <MemoryRouter initialEntries={['/admin/test']}>
        <Routes>
          <Route
            path="/admin/test"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <div>Admin sahifasi</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin sahifasi')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/owner/test']}>
        <Routes>
          <Route
            path="/owner/test"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <div>Mulkdor sahifasi</div>
              </RoleRoute>
            }
          />
          <Route path="/login" element={<div>Kirish sahifasi</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Kirish sahifasi')).toBeInTheDocument();
    expect(screen.queryByText('Mulkdor sahifasi')).not.toBeInTheDocument();
  });

  it('redirects to / when user does not have required role', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1', role: 'USER' },
    });

    render(
      <MemoryRouter initialEntries={['/admin/test']}>
        <Routes>
          <Route
            path="/admin/test"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <div>Admin sahifasi</div>
              </RoleRoute>
            }
          />
          <Route path="/" element={<div>Bosh sahifa</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Bosh sahifa')).toBeInTheDocument();
    expect(screen.queryByText('Admin sahifasi')).not.toBeInTheDocument();
  });
});
