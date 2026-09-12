import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    bronze: 'bg-bronze-100 text-bronze-700 border-bronze-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
