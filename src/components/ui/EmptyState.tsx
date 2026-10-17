import React, { ReactNode } from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no items matching your criteria at this moment.',
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200/80 max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F3] border border-slate-200 flex items-center justify-center text-[#103858] mb-4">
        {icon || <FolderSearch className="w-7 h-7 text-[#103858]/70" />}
      </div>
      <h3 className="text-lg font-bold text-[#103858]">{title}</h3>
      <p className="text-sm text-slate-600 mt-1.5 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
