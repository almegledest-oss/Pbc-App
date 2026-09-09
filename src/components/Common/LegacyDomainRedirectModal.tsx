import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, Globe } from 'lucide-react';

export function checkIsLegacyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();

  // Official production domains - strictly allowed
  if (host === 'probashibusinessclub.com' || host === 'www.probashibusinessclub.com') {
    return false;
  }

  // Local development and AI Studio internal preview containers - strictly allowed
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.run.app') ||
    host.endsWith('.cloudshell.dev') ||
    host.includes('ais-dev') ||
    host.includes('ais-pre')
  ) {
    return false;
  }

  // Legacy member links to intercept and lock down
  if (
    host.includes('vercel.app') ||
    host.includes('pbc-club.ai.studio') ||
    host.includes('firebaseapp.com') ||
    host.includes('web.app')
  ) {
    return true;
  }

  return false;
}

export const LegacyDomainRedirectModal: React.FC = () => {
  const [countdown, setCountdown] = useState(4);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const officialUrl = 'https://probashibusinessclub.com';

  const handleRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.replace(officialUrl);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] bg-[#030712] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-[#0A1022]/95 border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center backdrop-blur-xl">
        
        {/* Top Lock Badge */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-10 h-10 text-amber-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1 rounded-full shadow border-2 border-[#0A1022]">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide mb-1">
          PROBASHI BUSINESS CLUB
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          অফিশিয়াল সিকিউরিটি সুরক্ষা পোর্টাল
        </p>

        {/* Notice Box */}
        <div className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 text-left mb-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            পুরনো লিংক স্থায়ীভাবে নিষ্ক্রিয় করা হয়েছে
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ক্লাবের আর্থিক হিসাব ও সদস্যদের তথ্যের ১০০% গোপনীয়তা বজায় রাখতে <span className="font-mono text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded text-[11px]">{currentHost || 'পুরনো লিংক'}</span> ঠিকানায় সকল ডেটা প্রদর্শন বন্ধ করা হয়েছে।
          </p>
        </div>

        {/* Official Target Box */}
        <div className="w-full bg-gradient-to-r from-amber-950/30 to-blue-950/30 border border-amber-500/40 rounded-xl p-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/80">নতুন অফিশিয়াল ডোমেন</div>
              <div className="text-xs sm:text-sm font-black text-white font-mono">probashibusinessclub.com</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            অফিশিয়াল
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRedirect}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
        >
          <span>অফিশিয়াল ওয়েবসাইটে প্রবেশ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Countdown Indicator */}
        <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <span>স্বয়ংক্রিয়ভাবে পাঠানো হচ্ছে</span>
          <span className="font-mono font-bold text-amber-400 text-sm">{countdown}</span>
          <span>সেকেন্ডে...</span>
        </div>

      </div>
    </div>
  );
};
