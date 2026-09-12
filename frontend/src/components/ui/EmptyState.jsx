import React from 'react';
import Button from './Button';
import { Sparkles } from 'lucide-react';

export function EmptyState({
  icon: Icon = Sparkles,
  title = "Ma'lumot topilmadi",
  description = "Qidiruv parametrlarini o'zgartirib ko'ring yoki keyinroq qayta urinib ko'ring.",
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-bronze-100 text-bronze flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1 font-serif">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
