import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Animated AM / PM Sun–Moon Theme Toggle Switch
 * - Controls the existing SpotFix theme state (light / dark)
 * - Light (AM): Blue daytime sky with a golden sun and soft clouds
 * - Dark (PM): Deep night sky with a detailed moon with craters and twinkling stars
 * - Smooth CSS transitions and accessible checkbox input
 */
export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className={`theme-toggle-wrapper inline-flex items-center gap-1.5 select-none ${className}`}
    >
      {/* AM Label */}
      <span
        className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-300 ${
          !isDark
            ? 'text-amber-500 dark:text-amber-400 scale-105 opacity-100 font-extrabold'
            : 'text-slate-400 dark:text-slate-500 opacity-60 scale-95'
        }`}
      >
        AM
      </span>

      {/* Pill Toggle Switch */}
      <label
        className="relative inline-block w-[56px] h-[28px] cursor-pointer"
        title={`Switch to ${isDark ? 'Day / Light (AM)' : 'Night / Dark (PM)'}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isDark}
          onChange={toggleTheme}
          aria-label="Toggle Day and Night Theme"
        />

        {/* Switch Track Background */}
        <div
          className={`relative w-full h-full rounded-full transition-all duration-500 ease-in-out shadow-inner overflow-hidden border ${
            isDark
              ? 'bg-[#1b2234] border-[#2c3755] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
              : 'bg-[#4da8da] border-[#3792c7] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
          }`}
        >
          {/* Day Mode Clouds (visible when !isDark) */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              !isDark ? 'opacity-100' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="absolute right-[4px] bottom-[-4px] w-5 h-3.5 bg-white/80 rounded-full blur-[0.3px]" />
            <div className="absolute right-[12px] bottom-[-2px] w-4 h-3 bg-white/95 rounded-full" />
            <div className="absolute right-[18px] bottom-[-5px] w-4 h-3 bg-white/70 rounded-full" />
            <div className="absolute right-[8px] top-[4px] w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.2px]" />
          </div>

          {/* Night Mode Stars (visible when isDark) */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
              isDark ? 'opacity-100' : 'opacity-0 -translate-y-3'
            }`}
          >
            <div className="absolute left-[8px] top-[6px] w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_3px_#fff] animate-pulse" />
            <div className="absolute left-[16px] top-[15px] w-[2px] h-[2px] bg-white/90 rounded-full shadow-[0_0_2px_#fff]" />
            <div className="absolute left-[22px] top-[7px] w-[2.5px] h-[2.5px] bg-cyan-200 rounded-full shadow-[0_0_3px_#a5f3fc]" />
            <div className="absolute left-[10px] top-[18px] w-[2px] h-[2px] bg-white/80 rounded-full" />
            <div className="absolute left-[26px] top-[18px] w-[1.5px] h-[1.5px] bg-white/60 rounded-full" />
          </div>

          {/* Sun / Moon Orb (Slides left to right) */}
          <div
            className={`absolute top-[2px] w-[22px] h-[22px] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center ${
              isDark
                ? 'left-[2px] translate-x-[28px] bg-[#d9e2ec] shadow-[0_0_8px_rgba(255,255,255,0.4),inset_-2px_-2px_0_rgba(0,0,0,0.15)]'
                : 'left-[2px] translate-x-0 bg-[#f6ad55] shadow-[0_0_10px_#f6ad55,inset_-2px_-2px_0_#dd6b20]'
            }`}
          >
            {/* Sun Rays / Corona Glow (AM Mode) */}
            <div
              className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                !isDark ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'radial-gradient(circle at 35% 35%, #fed7aa 0%, #f6ad55 60%, #dd6b20 100%)',
              }}
            />

            {/* Moon Craters (PM Mode) */}
            <div
              className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${
                isDark ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute top-[4px] left-[5px] w-[4.5px] h-[4.5px] rounded-full bg-[#9fb3c8]/70 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.2)]" />
              <div className="absolute top-[11px] left-[11px] w-[3.5px] h-[3.5px] rounded-full bg-[#9fb3c8]/60 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.2)]" />
              <div className="absolute top-[12px] left-[4px] w-[2.5px] h-[2.5px] rounded-full bg-[#9fb3c8]/50 shadow-[inset_0.5px_0.5px_0.5px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>
      </label>

      {/* PM Label */}
      <span
        className={`text-[10px] font-mono font-bold tracking-wider transition-all duration-300 ${
          isDark
            ? 'text-cyan-400 scale-105 opacity-100 font-extrabold'
            : 'text-slate-400 dark:text-slate-500 opacity-60 scale-95'
        }`}
      >
        PM
      </span>
    </div>
  );
};

export default ThemeToggle;
