import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import * as AuthContext from '../../context/AuthContext';
import * as ToastContext from '../../context/ToastContext';

describe('RegisterPage Regression Tests', () => {
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ToastContext, 'useToast').mockReturnValue(mockToast);
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      register: mockRegister,
    });
  });

  it('normalizes spaced phone input and submits successfully', async () => {
    mockRegister.mockResolvedValue({ success: true, user: { id: '1' } });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Ism/i), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText(/Familiya/i), { target: { value: 'Valiyev' } });
    fireEvent.change(screen.getByLabelText(/Foydalanuvchi nomi/i), { target: { value: 'alivaliyev' } });
    fireEvent.change(screen.getByLabelText(/Elektron pochta/i), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText(/Telefon raqami/i), { target: { value: '+998 90 123 45 67' } });
    fireEvent.change(screen.getByLabelText(/Parol/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Ro'yxatdan o'tish/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledTimes(1);
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'Ali',
        lastName: 'Valiyev',
        username: 'alivaliyev',
        email: 'ali@example.com',
        phone: '+998901234567', // Normalized!
        password: 'Password123',
      });
    });
  });

  it('shows inline validation error and suppresses multiple toasts on invalid phone', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Ism/i), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText(/Familiya/i), { target: { value: 'Valiyev' } });
    fireEvent.change(screen.getByLabelText(/Foydalanuvchi nomi/i), { target: { value: 'alivaliyev' } });
    fireEvent.change(screen.getByLabelText(/Elektron pochta/i), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText(/Telefon raqami/i), { target: { value: '12345' } }); // Invalid
    fireEvent.change(screen.getByLabelText(/Parol/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Ro'yxatdan o'tish/i }));

    await waitFor(() => {
      expect(mockRegister).not.toHaveBeenCalled();
      expect(screen.getByText(/Telefon raqamini to'g'ri formatda kiriting/i)).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledTimes(1);
    });
  });

  it('displays backend field-level validation errors inline on 400 failure', async () => {
    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [{ field: 'username', message: 'Username must be at least 3 characters' }],
          },
        },
      },
    };
    mockRegister.mockRejectedValue(apiError);

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Ism/i), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText(/Familiya/i), { target: { value: 'Valiyev' } });
    fireEvent.change(screen.getByLabelText(/Foydalanuvchi nomi/i), { target: { value: 'al' } });
    fireEvent.change(screen.getByLabelText(/Elektron pochta/i), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText(/Telefon raqami/i), { target: { value: '+998901234567' } });
    fireEvent.change(screen.getByLabelText(/Parol/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Ro'yxatdan o'tish/i }));

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith("Iltimos, kiritilgan ma'lumotlarni tekshiring.");
    });
  });
});
