import React from 'react';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
  light = false,
}) => {
  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  }[align];

  return (
    <div className={`flex flex-col max-w-3xl mb-10 sm:mb-14 ${alignClass} ${className}`}>
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#CCA02E]/10 text-[#A6801C] border border-[#CCA02E]/30 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCA02E]" />
          {badge}
        </span>
      )}
      <h2
        className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
          light ? 'text-white' : 'text-[#103858]'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base sm:text-lg leading-relaxed ${
            light ? 'text-slate-200' : 'text-[#172B3A]/80'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
