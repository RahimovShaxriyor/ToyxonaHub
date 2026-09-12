import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element or modal container
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-border shadow-2xl p-6 sm:p-7 z-10 my-8 transform transition-all focus:outline-none max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h3 id="modal-title" className="text-lg font-bold text-ink tracking-tight font-serif">
                {title}
              </h3>
            )}
            {description && (
              <p id="modal-desc" className="text-sm text-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-muted hover:text-ink rounded-lg hover:bg-canvas transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-bronze focus:outline-none"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
