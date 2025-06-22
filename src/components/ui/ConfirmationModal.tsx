import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
      <div className="relative z-10 w-full">
        <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>{title}</div>
            <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
          </div>
          <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase">{message}</div>
          <div className="flex justify-between gap-4 mt-6">
            <button
              className="flex-1 px-6 py-3 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="flex-1 px-6 py-3 border border-red-500 bg-red-100 text-red-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-red-200 transition-colors"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 