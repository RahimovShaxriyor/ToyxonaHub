import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HallDetailPage from './HallDetailPage';
import { hallsApi } from '../../api/halls.api';
import { servicesApi } from '../../api/services.api';
import { bookingsApi } from '../../api/bookings.api';
import * as AuthContext from '../../context/AuthContext';
import * as ToastContext from '../../context/ToastContext';

describe('HallDetailPage Booking and Conflict Handling', () => {
  let queryClient;
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.restoreAllMocks();

    vi.spyOn(ToastContext, 'useToast').mockReturnValue(mockToast);

    vi.spyOn(hallsApi, 'getHallById').mockResolvedValue({
      id: 'hall-1',
      name: 'Versal Tantanalar Saroyi',
      district: 'Yunusobod',
      address: 'Amir Temur shoh ko\'chasi, 120',
      capacity: 500,
      pricePerSeat: 200000,
      contactPhone: '+998901234567',
      images: [],
    });

    vi.spyOn(servicesApi, 'getHallServices').mockResolvedValue([]);
    vi.spyOn(hallsApi, 'getHallAvailability').mockResolvedValue({
      weddingHallId: 'hall-1',
      year: 2026,
      month: 9,
      daysInMonth: 30,
      availability: [],
    });
  });

  it('renders hall details and pricing calculation accurately', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567' },
      getPendingBooking: vi.fn().mockReturnValue(null),
      clearPendingBooking: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/halls/hall-1']}>
          <Routes>
            <Route path="/halls/:id" element={<HallDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Versal Tantanalar Saroyi')).toBeInTheDocument();
    });

    expect(screen.getByText(/500 kishilik sig'im/i)).toBeInTheDocument();
    expect(screen.getAllByText(/200 000 so'm/i).length).toBeGreaterThan(0);
  });

  it('handles 409 conflict error when booking date is already taken', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567' },
      getPendingBooking: vi.fn().mockReturnValue({
        selectedDate: '2026-10-20',
        guestCount: 200,
        openModal: true,
      }),
      clearPendingBooking: vi.fn(),
    });

    const conflictError = {
      response: {
        status: 409,
        data: {
          code: 'BOOKING_DATE_UNAVAILABLE',
          message: 'Ushbu sana band qilingan',
        },
      },
    };

    vi.spyOn(bookingsApi, 'createBooking').mockRejectedValue(conflictError);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/halls/hall-1']}>
          <Routes>
            <Route path="/halls/:id" element={<HallDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Form should be open because draft had openModal: true
    await waitFor(() => {
      expect(screen.getByText("To'yxonani bron qilish")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /tasdiqlash va bron qilish/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('allaqachon band qilingan')
      );
    });
  });

  it('triggers mock payment successfully and displays confirmation', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      user: { id: 'u1', firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567' },
      getPendingBooking: vi.fn().mockReturnValue({
        selectedDate: '2026-10-20',
        guestCount: 200,
        openModal: true,
      }),
      clearPendingBooking: vi.fn(),
    });

    const mockBooking = {
      id: 'book-123',
      totalPrice: 40000000,
      advancePayment: 8000000,
      status: 'ACTIVE',
      paymentStatus: 'UNPAID',
    };

    vi.spyOn(bookingsApi, 'createBooking').mockResolvedValue({
      success: true,
      data: mockBooking,
    });

    vi.spyOn(bookingsApi, 'payBooking').mockResolvedValue({
      success: true,
      message: "Muvaffaqiyatli to'landi",
      data: { ...mockBooking, paymentStatus: 'PAID' },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/halls/hall-1']}>
          <Routes>
            <Route path="/halls/:id" element={<HallDetailPage />} />
            <Route path="/my-bookings" element={<div>Mening buyurtmalarim sahifasi</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("To'yxonani bron qilish")).toBeInTheDocument();
    });

    // Submit booking
    const submitBtn = screen.getByRole('button', { name: /tasdiqlash va bron qilish/i });
    fireEvent.click(submitBtn);

    // Payment modal appears
    await waitFor(() => {
      expect(screen.getByText("20% Avans to'lovini amalga oshirish")).toBeInTheDocument();
    });

    // Click pay advance button
    const payBtn = screen.getByRole('button', { name: /20% avansni to'lash/i });
    fireEvent.click(payBtn);

    await waitFor(() => {
      expect(bookingsApi.payBooking).toHaveBeenCalledWith('book-123');
      expect(mockToast.success).toHaveBeenCalledWith("Muvaffaqiyatli to'landi");
    });
  });
});
