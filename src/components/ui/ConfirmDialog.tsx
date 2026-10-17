import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={!loading}>
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#103858] mb-1">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex items-center gap-3 w-full justify-center">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
