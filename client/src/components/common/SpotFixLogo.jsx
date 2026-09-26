import React from 'react';

/**
 * SpotFixLogo Component
 * Precision SVG vector representation of the official SpotFix brand logo:
 * - Location Pin + Checkmark + Tools (Screw/Bolt & Wrench)
 * - "Spot" (Clean Sans-Serif) + "Fix" (Bold Serif)
 * - "Infrastructure Issue Resolution Platform" tagline
 * - Supports full brand or icon-only mode
 * - Automatically adapts to Light/Dark mode via currentColor
 */

export const SpotFixIcon = ({ className = "w-8 h-8", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Outer Location Pin with lower point */}
    <path
      d="M50 8C29.565 8 13 24.565 13 45C13 65.5 42 88 47.5 92C48.9 93.1 51.1 93.1 52.5 92C58 88 87 65.5 87 45C87 24.565 70.435 8 50 8ZM50 78C42.2 71.2 23 53.5 23 45C23 30.088 35.088 18 50 18C64.912 18 77 30.088 77 45C77 53.5 57.8 71.2 50 78Z"
      fill="currentColor"
    />

    {/* Integrated Checkmark + Tool Silhouette */}
    {/* Bold checkmark base */}
    <path
      d="M32 44L44 56L68 28L76 34L44 70L24 50L32 44Z"
      fill="currentColor"
    />

    {/* Bolt / Screw Detail atop checkmark */}
    <path
      d="M48 24H56V27H48V24ZM46 28H58V32H46V28ZM49 33H55V44H49V33Z"
      fill="currentColor"
    />

    {/* Wrench Jaw on bottom-left */}
    <path
      d="M16 66L24 58L28 62L23 67C24.5 69 27 70 29.5 69.5L34 74C30 76.5 25 76 21 73L16 78L13 75L18 70C16 68.5 15.2 67.2 16 66Z"
      fill="currentColor"
    />

    {/* Spanner Ring Eyelet on bottom-right */}
    <circle cx="70" cy="56" r="4.5" fill="none" stroke="currentColor" strokeWidth="3" />
  </svg>
);

export const SpotFixLogo = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  showTagline = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[8px]',
    md: 'text-[9.5px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`flex items-center gap-3 select-none text-slate-900 dark:text-white ${className}`}>
      {/* Brand Icon */}
      <SpotFixIcon className={`${iconSizes[size]} shrink-0`} />

      {/* Brand Typography: Spot (Sans) + Fix (Bold Serif) */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-medium tracking-tight flex items-baseline ${titleSizes[size]}`}>
          <span className="font-sans font-normal tracking-tight">Spot</span>
          <span
            className="font-serif font-black tracking-normal ml-0.5"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Fix
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-slate-600 dark:text-slate-400 font-sans tracking-tight font-medium mt-0.5 ${taglineSizes[size]}`}
          >
            Infrastructure Issue Resolution Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default SpotFixLogo;
