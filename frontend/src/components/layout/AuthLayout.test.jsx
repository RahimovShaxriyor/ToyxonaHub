import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthLayout from './AuthLayout';

describe('AuthLayout component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders children and brand showcase', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Ichki Auth Forma</div>
        </AuthLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Ichki Auth Forma')).toBeInTheDocument();
    expect(screen.getByAltText(/ToyxonaHub Tantanalar Saroyi/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Toshkentning eng sara to'yxonalari va tantanalar saroylari/i)
    ).toBeInTheDocument();
  });

  it('displays pending booking context when saved in sessionStorage', () => {
    sessionStorage.setItem(
      'toyxonahub_pending_booking_test-123',
      JSON.stringify({
        hallName: 'Versal Saroyi',
        selectedDate: '2026-10-25',
        guestCount: 300,
      })
    );

    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Forma</div>
        </AuthLayout>
      </MemoryRouter>
    );

    expect(screen.getByText(/Siz bronni davom ettiryapsiz/i)).toBeInTheDocument();
    expect(screen.getByText('Versal Saroyi')).toBeInTheDocument();
    expect(screen.getByText(/300 mehmon/i)).toBeInTheDocument();
  });

  it('does not display pending booking context when sessionStorage is empty', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Forma</div>
        </AuthLayout>
      </MemoryRouter>
    );

    expect(screen.queryByText(/Siz bronni davom ettiryapsiz/i)).not.toBeInTheDocument();
  });
});
