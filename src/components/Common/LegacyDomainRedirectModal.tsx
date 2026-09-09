import React from 'react';
import { Landmark, Globe } from 'lucide-react';

export function checkIsLegacyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();

  // Official production domains - strictly allowed
  if (host === 'probashibusinessclub.com' || host === 'www.probashibusinessclub.com') {
    return false;
  }

  // Internal AI Studio dev editor preview container & localhost - allow during coding
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.cloudshell.dev') ||
    host.includes('ais-dev')
  ) {
    return false;
  }

  // Any other domain, including:
  // - pbc-club.ai.studio
  // - ais-pre-*.run.app (the shared public app URL backing pbc-club.ai.studio)
  // - *.vercel.app
  // - *.web.app / *.firebaseapp.com
  return true;
}

export const LegacyDomainScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999999] bg-[#030712] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-64 sm:h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 max-w-lg w-full bg-[#0A1022]/95 border border-amber-500/30 rounded-3xl shadow-2xl p-6 sm:p-9 text-center flex flex-col items-center backdrop-blur-xl">
        {/* Landmark Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-5">
          <Landmark className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
        </div>

        {/* Club Title */}
        <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider mb-1">
          প্রবাসী বিজনেস ক্লাব
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 mb-6">
          সম্মানিত সদস্যদের অবগতির জন্য বিশেষ নোটিশ:
        </p>

        {/* Notice Body */}
        <div className="w-full bg-black/40 border border-slate-800/90 rounded-2xl p-5 sm:p-6 text-center mb-6">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            &ldquo;ক্লাবের নিরাপত্তা ও আধুনিকায়নের স্বার্থে এই পুরনো লিংকটির কার্যক্রম স্থায়ীভাবে সমাপ্ত ঘোষণা করা হয়েছে।
            <br className="hidden sm:block" />
            <span className="mt-2 block sm:inline">
              ক্লাবের সকল প্রাতিষ্ঠানিক কার্যক্রম, হিসাব-নিকাশ এবং মেম্বার সার্ভিস এখন থেকে আমাদের নিজস্ব অফিশিয়াল ডোমেনে পরিচালিত হচ্ছে।&rdquo;
            </span>
          </p>
        </div>

        {/* Official Domain Box - Pure Text Display */}
        <div className="w-full bg-gradient-to-r from-amber-950/40 via-[#0E172F] to-blue-950/40 border border-amber-500/40 rounded-2xl py-3.5 px-4 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>অফিশিয়াল ওয়েবসাইট:</span>
          </div>
          <span className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wide select-all">
            probashibusinessclub.com
          </span>
        </div>
      </main>
    </div>
  );
};
