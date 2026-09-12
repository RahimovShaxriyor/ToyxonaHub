import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-bronze text-white hover:bg-bronze-hover focus-visible:ring-bronze shadow-sm',
    secondary: 'bg-white text-ink border border-border hover:bg-canvas hover:border-border-dark focus-visible:ring-bronze shadow-sm',
    outline: 'bg-transparent text-ink border border-border hover:border-bronze hover:text-bronze focus-visible:ring-bronze',
    ghost: 'bg-transparent text-muted hover:text-ink hover:bg-canvas focus-visible:ring-bronze',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
    dangerOutline: 'bg-transparent text-rose-600 border border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
});

export default Button;
