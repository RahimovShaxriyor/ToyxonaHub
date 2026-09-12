import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';

describe('HeroCarousel component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders initial slide 1 content and trust badges', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    // Initial slide headline
    expect(screen.getByText(/To'yingiz uchun eng go'zal to'yxonani/i)).toBeInTheDocument();
    expect(screen.getByText(/onlayn bron qiling/i)).toBeInTheDocument();
    expect(screen.getByText(/Toshkent to'yxonalarining yagona onlayn tizimi/i)).toBeInTheDocument();

    // Trust badges
    expect(screen.getByText(/100% rasmiy va tasdiqlangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Jonli bo'sh sanalar kalendari/i)).toBeInTheDocument();
    expect(screen.getByText(/Shaffof narxlar va qulay 20% avans/i)).toBeInTheDocument();
  });

  it('renders decoupled SearchFilterBar inputs', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    // Search bar fields
    expect(screen.getByText(/To'y sanasi/i)).toBeInTheDocument();
    expect(screen.getByText(/Mehmonlar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /qidirish/i })).toBeInTheDocument();
  });

  it('navigates to next slide on clicking next button', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /keyingi slayd/i });
    fireEvent.click(nextBtn);

    // Slide 2 text
    expect(screen.getByText(/Bayramingiz mukammal makondan/i)).toBeInTheDocument();
    expect(screen.getByText(/boshlanadi/i)).toBeInTheDocument();
  });

  it('navigates to previous slide on clicking prev button', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const prevBtn = screen.getByRole('button', { name: /oldingi slayd/i });
    // From slide 0, prev goes to slide 3 (Slide 4)
    fireEvent.click(prevBtn);

    expect(screen.getByRole('heading', { name: /Shaffof narxlar va qulay/i })).toBeInTheDocument();
    expect(screen.getByText(/Kafolatlangan xavfsiz bron/i)).toBeInTheDocument();
  });

  it('selects slide directly via indicator dot', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const slide3Dot = screen.getByRole('button', { name: /slayd 3/i });
    fireEvent.click(slide3Dot);

    expect(screen.getByText(/Barcha to'y xizmatlari/i)).toBeInTheDocument();
    expect(screen.getByText(/yagona tizimda/i)).toBeInTheDocument();
    expect(slide3Dot).toHaveAttribute('aria-current', 'true');
  });

  it('advances automatically after 5000ms', () => {
    render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    expect(screen.getByText(/To'yingiz uchun eng go'zal to'yxonani/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Bayramingiz mukammal makondan/i)).toBeInTheDocument();
  });

  it('pauses autoplay on mouse hover and resumes on mouse leave', () => {
    const { container } = render(
      <MemoryRouter>
        <HeroCarousel />
      </MemoryRouter>
    );

    const section = container.querySelector('section');

    // Hover to pause
    fireEvent.mouseEnter(section);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Still slide 1
    expect(screen.getByText(/To'yingiz uchun eng go'zal to'yxonani/i)).toBeInTheDocument();

    // Mouse leave to resume
    fireEvent.mouseLeave(section);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Advanced to slide 2
    expect(screen.getByText(/Bayramingiz mukammal makondan/i)).toBeInTheDocument();
  });
});
