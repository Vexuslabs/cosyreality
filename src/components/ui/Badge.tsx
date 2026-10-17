import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'navy' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  id,
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    navy: 'bg-[#103858]/10 text-[#103858] border-[#103858]/20 font-semibold',
    gold: 'bg-[#CCA02E]/15 text-[#8A6711] border-[#CCA02E]/30 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    danger: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
    outline: 'bg-transparent border border-slate-300 text-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-xs px-3 py-1 rounded-full',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 border leading-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
