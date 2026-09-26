import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initial theme from localStorage or system preference (defaults to dark for digital twin look)
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('spotfix_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const [rainEnabled, setRainEnabled] = useState(() => {
    const saved = localStorage.getItem('spotfix_rain');
    return saved !== null ? saved === 'true' : true;
  });

  // 0.0 = Pure Day / Light mode, 1.0 = Pure Night / Dark mode
  const [transitionProgress, setTransitionProgress] = useState(theme === 'dark' ? 1 : 0);
  const targetProgress = useRef(theme === 'dark' ? 1 : 0);
  const currentProgress = useRef(theme === 'dark' ? 1 : 0);
  const animFrameId = useRef(null);

  // Synchronize DOM root class with theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('spotfix_theme', theme);
    targetProgress.current = theme === 'dark' ? 1 : 0;
  }, [theme]);

  // Smooth interpolation loop for 3D environment transition (approx 2.0s duration)
  useEffect(() => {
    let lastTime = performance.now();

    const animateTransition = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const target = targetProgress.current;
      const current = currentProgress.current;
      const speed = 0.8; // Transition speed factor (~1.8-2.2 seconds full sweep)

      if (Math.abs(target - current) > 0.001) {
        if (target > current) {
          currentProgress.current = Math.min(target, current + delta * speed);
        } else {
          currentProgress.current = Math.max(target, current - delta * speed);
        }
        setTransitionProgress(currentProgress.current);
      } else {
        currentProgress.current = target;
        setTransitionProgress(target);
      }

      animFrameId.current = requestAnimationFrame(animateTransition);
    };

    animFrameId.current = requestAnimationFrame(animateTransition);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  };

  const toggleRain = () => {
    setRainEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('spotfix_rain', String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setTheme,
        transitionProgress,
        rainEnabled,
        toggleRain,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
