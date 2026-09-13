import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import OwnerHallFormPage from './OwnerHallFormPage';
import { hallsApi } from '../../api/halls.api';
import * as ToastContext from '../../context/ToastContext';

describe('OwnerHallFormPage Regression Tests', () => {
  let queryClient;
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.spyOn(ToastContext, 'useToast').mockReturnValue(mockToast);
  });

  it('submits valid payload with numeric coercion, uppercase district enum, and cleaned phone', async () => {
    const createSpy = vi.spyOn(hallsApi, 'createHall').mockResolvedValue({
      id: 'hall-new',
      name: 'Yangi Zafar Saroyi',
      status: 'PENDING',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OwnerHallFormPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/To'yxona nomi/i), {
      target: { value: 'Yangi Zafar Saroyi' },
    });
    fireEvent.change(screen.getByLabelText(/Tuman/i), {
      target: { value: 'YUNUSOBOD' },
    });
    fireEvent.change(screen.getByLabelText(/Manzil/i), {
      target: { value: 'Amir Temur ko\'chasi, 25' },
    });
    fireEvent.change(screen.getByLabelText(/Sig'im/i), {
      target: { value: '450' },
    });
    fireEvent.change(screen.getByLabelText(/O'rindiq narxi/i), {
      target: { value: '250000' },
    });
    fireEvent.change(screen.getByLabelText(/Aloqa telefoni/i), {
      target: { value: '+998 90 987 65 43' },
    });

    const submitBtn = screen.getByRole('button', { name: /To'yxonani yaratish/i });
    fireEvent.submit(submitBtn.closest('form'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Yangi Zafar Saroyi',
        district: 'YUNUSOBOD',
        address: 'Amir Temur ko\'chasi, 25',
        capacity: 450, // number
        pricePerSeat: 250000, // number
        phone: '+998909876543', // cleaned international format
      });
    });
  });

  it('displays field errors when backend responds with VALIDATION_ERROR', async () => {
    vi.spyOn(hallsApi, 'createHall').mockRejectedValue({
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [
              { field: 'capacity', message: 'Capacity must be at least 10' },
            ],
          },
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OwnerHallFormPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText(/To'yxona nomi/i), {
      target: { value: 'Yangi Zafar Saroyi' },
    });
    fireEvent.change(screen.getByLabelText(/Manzil/i), {
      target: { value: 'Amir Temur ko\'chasi, 25' },
    });
    fireEvent.change(screen.getByLabelText(/Sig'im/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/O'rindiq narxi/i), {
      target: { value: '150000' },
    });
    fireEvent.change(screen.getByLabelText(/Aloqa telefoni/i), {
      target: { value: '+998901234567' },
    });

    const submitBtn = screen.getByRole('button', { name: /To'yxonani yaratish/i });
    fireEvent.submit(submitBtn.closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Capacity must be at least 10')).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith("Iltimos, kiritilgan ma'lumotlarni tekshiring.");
    });
  });
});
