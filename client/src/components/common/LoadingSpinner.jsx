import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-slate-400 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-sky-500`} />
      {text && <span className="text-sm font-medium tracking-wide text-slate-300">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
