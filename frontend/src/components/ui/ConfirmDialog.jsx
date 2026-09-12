import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Tasdiqlang',
  message = "Haqiqatan ham bu amalni bajarmoqchimisiz? Ushbu amalni qaytarib bo'lmasligi mumkin.",
  confirmLabel = 'Ha, tasdiqlash',
  cancelLabel = 'Bekor qilish',
  variant = 'danger',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!isLoading}>
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-ink">{title}</h4>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
