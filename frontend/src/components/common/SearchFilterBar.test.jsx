import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchFilterBar from './SearchFilterBar';

describe('SearchFilterBar component', () => {
  it('renders all 4 search fields: district, date, guests, budget', () => {
    render(
      <MemoryRouter>
        <SearchFilterBar />
      </MemoryRouter>
    );

    // District select
    expect(screen.getAllByText(/tuman/i).length).toBeGreaterThan(0);
    // Date input
    expect(screen.getByText(/to'y sanasi/i)).toBeInTheDocument();
    // Guests input
    expect(screen.getByText(/mehmonlar/i)).toBeInTheDocument();
    // Budget input
    expect(screen.getByText(/maksimal narx/i)).toBeInTheDocument();
    // Search button
    expect(screen.getByRole('button', { name: /qidirish/i })).toBeInTheDocument();
  });

  it('calls onSearch when submitted', () => {
    const handleSearch = vi.fn();
    render(
      <MemoryRouter>
        <SearchFilterBar onSearch={handleSearch} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /qidirish/i });
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
