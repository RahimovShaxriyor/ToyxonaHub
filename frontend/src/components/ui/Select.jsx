import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder,
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-ink uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <select
          ref={ref}
          id={selectId}
          className={`appearance-none block w-full rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze cursor-pointer ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-border hover:border-border-dark'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children
            ? children
            : options.map((opt) => {
                const value = typeof opt === 'object' ? opt.value : opt;
                const labelText = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={value} value={value}>
                    {labelText}
                  </option>
                );
              })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
          <ChevronDown className="w-4 h-4" />
        </div>
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

export default Select;
