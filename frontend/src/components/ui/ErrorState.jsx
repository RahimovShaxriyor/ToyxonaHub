import React from 'react';
import Button from './Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function ErrorState({
  title = "Xatolik yuz berdi",
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, internet aloqasini tekshiring yoki qayta urinib ko'ring.",
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw className="w-4 h-4" />
          Qayta urinish
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
