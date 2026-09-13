import React, { useRef, useEffect } from 'react';

export function OtpInput({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = true,
  className = '',
}) {
  const inputRefs = useRef([]);

  // Break string into digits array
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const focusInput = (index) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index].focus();
      inputRefs.current[index].select();
    }
  };

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Keep only numbers
    const cleanVal = rawVal.replace(/\D/g, '');

    if (!cleanVal) {
      // Empty
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange?.(newDigits.join(''));
      return;
    }

    // Handle multiple digits entered (e.g. from mobile autofill)
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, length);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < length) {
          newDigits[index + i] = pasted[i];
        }
      }
      onChange?.(newDigits.join(''));
      const nextIndex = Math.min(index + pasted.length, length - 1);
      focusInput(nextIndex);
      return;
    }

    // Single digit entered
    const char = cleanVal[cleanVal.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    onChange?.(newDigits.join(''));

    // Auto advance to next input
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange?.(newDigits.join(''));
        focusInput(index - 1);
        e.preventDefault();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange?.(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    const newDigits = Array.from({ length }, (_, i) => pasteData[i] || '');
    onChange?.(newDigits.join(''));
    const focusTarget = Math.min(pasteData.length, length - 1);
    focusInput(focusTarget);
  };

  return (
    <fieldset
      role="group"
      aria-label="Tasdiqlash kodi"
      className={`flex items-center justify-between gap-2 sm:gap-3 ${className}`}
    >
      <legend className="sr-only">6 xonali tasdiqlash kodi</legend>
      {Array.from({ length }).map((_, index) => {
        const digit = digits[index];
        const hasValue = !!digit;

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            disabled={disabled}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Raqam ${index + 1}`}
            aria-invalid={error}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-white shadow-xs transition-all duration-fast select-none outline-none ${
              hasValue ? 'otp-digit-pop text-ink' : 'text-muted/40'
            } ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-border hover:border-border-dark focus:border-bronze focus:ring-2 focus:ring-bronze/25'
            } disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed`}
          />
        );
      })}
    </fieldset>
  );
}

export default OtpInput;
