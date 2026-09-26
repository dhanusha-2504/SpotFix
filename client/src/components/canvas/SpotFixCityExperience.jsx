import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Minimal Themed City HD Background
 * - Displays the ultra-clean, high-definition Minimal Smart City environment (Day / Night)
 * - Seamless theme cross-fade
 * - Crisp, unobtrusive presentation that lets all foreground application components shine
 */
const SpotFixCityExperience = ({ scrollProgress = 0 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      {/* 1. Day City HD Layer */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${
          isDark ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'url(/assets/city-day.jpg)',
          filter: 'brightness(1.02) contrast(1.02)',
        }}
      />

      {/* 2. Night City HD Layer */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'url(/assets/city-night.jpg)',
          filter: 'brightness(0.95) contrast(1.08)',
        }}
      />

      {/* 3. Soft Contrast Overlays for Text Readability */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(3,7,18,0.72) 0%, rgba(3,7,18,0.55) 50%, rgba(3,7,18,0.85) 100%)'
            : 'linear-gradient(180deg, rgba(248,250,252,0.75) 0%, rgba(248,250,252,0.55) 50%, rgba(248,250,252,0.82) 100%)',
        }}
      />
    </div>
  );
};

export default SpotFixCityExperience;
