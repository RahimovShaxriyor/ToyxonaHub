import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input component', () => {
  it('renders label and handles value changes', () => {
    render(<Input label="Ism" placeholder="Ismingizni kiriting" />);
    expect(screen.getByLabelText(/ism/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ismingizni kiriting/i)).toBeInTheDocument();
  });

  it('renders inline error with aria-invalid and aria-describedby', () => {
    render(<Input label="Email" error="Email noto'g'ri kiritildi" id="test-email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-email-error');
    expect(screen.getByText("Email noto'g'ri kiritildi")).toBeInTheDocument();
  });

  it('toggles password visibility when allowPasswordToggle is true', () => {
    render(<Input label="Parol" type="password" allowPasswordToggle={true} />);
    const input = screen.getByLabelText(/parol/i);
    expect(input).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /ko'rsatish/i });
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /yashirish/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('does not render toggle button when allowPasswordToggle is false', () => {
    render(<Input label="Parol" type="password" allowPasswordToggle={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
