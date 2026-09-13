import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'text',
    allowPasswordToggle = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType && allowPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-ink uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze ${
            LeftIcon ? 'pl-10' : ''
          } ${
            isPasswordType && allowPasswordToggle ? 'pr-11' : RightIcon ? 'pr-10' : ''
          } ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-border hover:border-border-dark'
          } ${className}`}
          {...props}
        />

        {isPasswordType && allowPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Yashirish" : "Ko'rsatish"}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-ink transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-r-xl"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 transition-opacity duration-fast" />
            ) : (
              <Eye className="w-4 h-4 transition-opacity duration-fast" />
            )}
          </button>
        ) : (
          RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
              <RightIcon className="w-4 h-4" />
            </div>
          )
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-rose-600 font-medium transition-all duration-fast">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
