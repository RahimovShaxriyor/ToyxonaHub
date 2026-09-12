import React from 'react';

export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'text',
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-ink uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze ${
            LeftIcon ? 'pl-10' : ''
          } ${RightIcon ? 'pr-10' : ''} ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-border hover:border-border-dark'
          } ${className}`}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
