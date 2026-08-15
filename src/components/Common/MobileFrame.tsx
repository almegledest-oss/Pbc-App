import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { viewMode, setViewMode } = useApp();

  if (viewMode === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      
      {/* Phone Simulator Frame Controls Header */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm text-xs text-slate-400">
        <span className="font-mono text-emerald-400">iOS / Android Mobile Device Simulator</span>
        <button
          onClick={() => setViewMode('desktop')}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold"
        >
          Exit Phone View
        </button>
      </div>

      {/* Realistic Mobile Device Body Shell */}
      <div className="relative w-full max-w-[390px] h-[812px] bg-slate-900 rounded-[50px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700 flex flex-col overflow-hidden">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2">
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
        </div>

        {/* Mobile Status Bar */}
        <div className="h-8 bg-slate-900 text-white px-6 flex items-center justify-between text-[10px] font-mono font-bold z-40 shrink-0 pt-1">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-white" />
            <Wifi className="w-3 h-3 text-white" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Screen Content Container */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto rounded-[38px] relative text-slate-900 dark:text-white pt-2">
          {children}
        </div>

        {/* Mobile Home Indicator Bar */}
        <div className="h-5 bg-slate-900 flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>

      </div>
    </div>
  );
};
