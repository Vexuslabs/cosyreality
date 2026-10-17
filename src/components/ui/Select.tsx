import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, leftIcon, className = '', id, children, ...props }, ref) => {
    const selectId = id || props.name || 'select_' + Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[#103858] mb-1.5">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`w-full bg-white text-[#172B3A] border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#103858] focus:border-[#103858] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${
              leftIcon ? 'pl-10' : ''
            } ${
              error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 hover:border-slate-300'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
