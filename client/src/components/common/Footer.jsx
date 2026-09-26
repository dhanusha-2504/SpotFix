import React from 'react';
import { SpotFixLogo } from './SpotFixLogo';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-slate-200 dark:border-slate-800/80 mt-auto py-8 text-slate-500 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SpotFixLogo size="sm" showTagline={false} />

          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span className="text-sky-600 dark:text-sky-400 font-semibold">“Spot it. Track it. Fix it.”</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>Role-Based Workflow</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>AI Duplicate Detection</span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            Built for smart municipal community operations
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
