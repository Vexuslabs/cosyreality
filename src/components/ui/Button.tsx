import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-[#103858] text-white hover:bg-[#0A243A] focus:ring-[#103858] shadow-sm hover:shadow',
    gold:
      'bg-[#CCA02E] text-[#103858] font-bold hover:bg-[#E3B94D] focus:ring-[#CCA02E] shadow-sm hover:shadow',
    outline:
      'bg-transparent border-2 border-[#103858] text-[#103858] hover:bg-[#103858]/5 focus:ring-[#103858]',
    secondary:
      'bg-[#FAF8F3] text-[#172B3A] border border-slate-200 hover:bg-slate-100 focus:ring-slate-400',
    ghost:
      'bg-transparent text-[#172B3A] hover:bg-[#103858]/5 focus:ring-[#103858]',
    danger:
      'bg-[#DC2626] text-white hover:bg-rose-700 focus:ring-[#DC2626] shadow-sm',
    success:
      'bg-[#16A34A] text-white hover:bg-emerald-700 focus:ring-[#16A34A] shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
