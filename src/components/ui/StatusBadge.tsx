import React from 'react';
import { InventoryStatus } from '../../types';
import { getInventoryStatusBadgeClasses, getInventoryStatusLabel } from '../../utils/formatters';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: InventoryStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const classes = getInventoryStatusBadgeClasses(status);
  const label = getInventoryStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs px-3 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-4 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const renderIcon = () => {
    switch (status) {
      case 'booking':
        return <CheckCircle2 className={`${iconSizes} text-[#16A34A] shrink-0`} />;
      case 'waiting':
        return <Clock className={`${iconSizes} text-[#EAB308] shrink-0`} />;
      case 'sold':
        return <XCircle className={`${iconSizes} text-[#DC2626] shrink-0`} />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${classes.bg} ${classes.border} ${sizeClasses} ${className}`}
    >
      {renderIcon()}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
