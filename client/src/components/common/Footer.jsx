import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-auto py-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white">
              SPOT<span className="text-emerald-400">FIX</span>
            </span>
            <span className="text-xs text-slate-500">| Smart Local Issue Reporting & Resolution Platform</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <span className="text-emerald-400">“Spot it. Track it. Fix it.”</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Role-Based Workflow</span>
            <span className="hidden sm:inline text-slate-700">•</span>
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
