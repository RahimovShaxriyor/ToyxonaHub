import React from 'react';

export function Card({
  children,
  className = '',
  as: Component = 'div',
  hover = false,
  ...props
}) {
  return (
    <Component
      className={`bg-white rounded-2xl border border-border transition-all duration-200 ${
        hover ? 'hover:border-border-dark hover:shadow-card-hover' : 'shadow-card'
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-5 border-b border-border/80 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 bg-canvas/40 border-t border-border/80 rounded-b-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
