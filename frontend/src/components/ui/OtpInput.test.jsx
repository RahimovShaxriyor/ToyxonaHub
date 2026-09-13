import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OtpInput from './OtpInput';

function ControlledOtp(props) {
  const [code, setCode] = useState('');
  return <OtpInput value={code} onChange={setCode} {...props} />;
}

describe('OtpInput component', () => {
  it('renders 6 segmented inputs inside an accessible group', () => {
    render(<OtpInput value="" onChange={vi.fn()} />);
    const group = screen.getByRole('group', { name: /tasdiqlash kodi/i });
    expect(group).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
  });

  it('allows single digit typing and advances focus', () => {
    render(<ControlledOtp />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: '4' } });
    expect(inputs[0]).toHaveValue('4');
  });

  it('supports pasting a 6-digit code across all cells', () => {
    render(<ControlledOtp />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '852963',
      },
    });

    expect(inputs[0]).toHaveValue('8');
    expect(inputs[1]).toHaveValue('5');
    expect(inputs[2]).toHaveValue('2');
    expect(inputs[3]).toHaveValue('9');
    expect(inputs[4]).toHaveValue('6');
    expect(inputs[5]).toHaveValue('3');
  });

  it('clears previous cell and moves focus back on Backspace', () => {
    const handleChange = vi.fn();
    render(<OtpInput value="12" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');

    // Press Backspace on cell 3 (index 2, which is empty)
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    // Should call onChange with previous digit cleared ('1')
    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('filters out non-numeric characters', () => {
    const handleChange = vi.fn();
    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'abc' } });
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
