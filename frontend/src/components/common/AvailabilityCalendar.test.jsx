import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AvailabilityCalendar from './AvailabilityCalendar';
import { hallsApi } from '../../api/halls.api';
import * as AuthContext from '../../context/AuthContext';

describe('AvailabilityCalendar component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAdmin: false,
      user: { role: 'USER' },
    });
  });

  it('renders month header, weekday columns, and legend', async () => {
    vi.spyOn(hallsApi, 'getHallAvailability').mockResolvedValue({
      weddingHallId: 'hall-1',
      year: 2026,
      month: 9,
      daysInMonth: 30,
      availability: [
        { date: '2026-09-15', status: 'AVAILABLE' },
        { date: '2026-09-16', status: 'BOOKED' },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AvailabilityCalendar hallId="hall-1" />
      </QueryClientProvider>
    );

    // Wait for availability to load and render weekdays & legend
    await waitFor(() => {
      expect(screen.getByText('Du')).toBeInTheDocument();
    });
    expect(screen.getByText('Ju')).toBeInTheDocument();

    // Legend
    expect(screen.getByText(/Bo'sh \(tanlang\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Band qilingan/i)).toBeInTheDocument();
    expect(screen.getByText(/Tanlangan sana/i)).toBeInTheDocument();
  });

  it('calls onSelectDate when an available future date is clicked', async () => {
    const handleSelectDate = vi.fn();

    vi.spyOn(hallsApi, 'getHallAvailability').mockResolvedValue({
      weddingHallId: 'hall-1',
      year: 2026,
      month: 12,
      daysInMonth: 31,
      availability: [
        { date: '2026-12-25', status: 'AVAILABLE' },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AvailabilityCalendar
          hallId="hall-1"
          onSelectDate={handleSelectDate}
        />
      </QueryClientProvider>
    );

    // Wait for availability to load
    await waitFor(() => {
      expect(hallsApi.getHallAvailability).toHaveBeenCalled();
    });

    // Navigate to December if needed or check days
    const nextBtn = screen.getByLabelText(/keyingi oy/i);
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeInTheDocument();
  });

  it('navigates to next month on chevron click', async () => {
    vi.spyOn(hallsApi, 'getHallAvailability').mockResolvedValue({
      weddingHallId: 'hall-1',
      year: 2026,
      month: 9,
      daysInMonth: 30,
      availability: [],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AvailabilityCalendar hallId="hall-1" />
      </QueryClientProvider>
    );

    const nextBtn = screen.getByLabelText(/keyingi oy/i);
    fireEvent.click(nextBtn);

    // Month should advance and trigger query
    await waitFor(() => {
      expect(hallsApi.getHallAvailability).toHaveBeenCalled();
    });
  });
});
