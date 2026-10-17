import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  label = 'Loading...',
  size = 'md',
  fullScreen = false,
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
      <Loader2 className={`${iconSizes} text-[#103858] animate-spin`} />
      {label && <p className="text-sm font-medium text-slate-600 animate-pulse">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};
