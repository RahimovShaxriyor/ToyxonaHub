import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function TestComponent() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.error('Xatolik yuz berdi')}>Trigger Error</button>
      <button onClick={() => toast.success('Muvaffaqiyatli!')}>Trigger Success</button>
      <button
        onClick={() => {
          toast.info('Toast 1');
          toast.info('Toast 2');
          toast.info('Toast 3');
          toast.info('Toast 4');
        }}
      >
        Trigger Many
      </button>
    </div>
  );
}

describe('ToastContext', () => {
  it('suppresses duplicate identical toast calls in rapid succession', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByText('Trigger Error');

    // Click twice rapidly
    act(() => {
      btn.click();
      btn.click();
    });

    const alerts = screen.getAllByRole('alert');
    // Exactly 1 alert rendered instead of 2!
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent('Xatolik yuz berdi');
  });

  it('caps maximum visible toasts at 3', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByText('Trigger Many');
    act(() => {
      btn.click();
    });

    const alerts = screen.getAllByRole('alert');
    // At most 3 visible toasts
    expect(alerts).toHaveLength(3);
    // Oldest (Toast 1) was dropped
    expect(screen.queryByText('Toast 1')).toBeNull();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
  });
});
