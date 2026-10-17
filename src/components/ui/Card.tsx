import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  id,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
