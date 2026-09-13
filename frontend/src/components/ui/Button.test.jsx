import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button component', () => {
  it('renders button text properly', () => {
    render(<Button>Boshlash</Button>);
    expect(screen.getByRole('button', { name: /boshlash/i })).toBeInTheDocument();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Bosish</Button>);
    fireEvent.click(screen.getByRole('button', { name: /bosish/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables clicks when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Nofaol</Button>);
    const btn = screen.getByRole('button', { name: /nofaol/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disables button and shows spinner when isLoading is true', () => {
    render(<Button isLoading loadingText="Kuting...">Yuklanmoqda</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Kuting...')).toBeInTheDocument();
  });

  it('renders checkmark and disables clicks when isSuccess is true', () => {
    render(<Button isSuccess>Muvaffaqiyatli</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Muvaffaqiyatli')).toBeInTheDocument();
  });
});
