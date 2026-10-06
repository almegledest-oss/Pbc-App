import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AppInstallButtonProps {
  variant?: 'compact' | 'full' | 'nav';
  className?: string;
}

export const AppInstallButton: React.FC<AppInstallButtonProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useApp();
  const isBn = language === 'bn';

  // If already installed and running standalone, do not show
  if (isInstalled) {
    return null;
  }

  // Handle click
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Browser didn't trigger prompt yet or desktop
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'nav' ? (
        <button
          onClick={handleClick}
          title={isBn ? 'মোবাইল অ্যাপ ইনস্টল করুন' : 'Install Mobile App'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all border border-amber-300/40 ${className}`}
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">{isBn ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
        </button>
      ) : variant === 'full' ? (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all border border-amber-300/50 ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isBn ? 'ফোনে PBC অ্যাপ ইনস্টল করুন' : 'Install PBC App on Phone'}</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isBn ? 'অ্যাপ ডাউনলোড' : 'Download App'}</span>
        </button>
      )}

      {/* Guidance Modal for iOS or manual install */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                <img src="/pwa-192x192.png" alt="PBC Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-400">
                  {isBn ? 'প্রবাসী বিজনেস ক্লাব অ্যাপ' : 'Probashi Business Club App'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isBn ? 'ফোনের হোমস্ক্রিনে যুক্ত করুন' : 'Add to Mobile Home Screen'}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  ১
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white flex items-center gap-1.5">
                    <span>{isBn ? 'ব্রাউজার মেনু খুলুন' : 'Open browser menu'}</span>
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isBn ? 'Safari বা Chrome ব্রাউজারের নিচে বা উপরের Share / ৩-ডট মেনুতে ট্যাপ করুন।' : 'Tap Share in Safari or 3-dots in Chrome.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  ২
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white flex items-center gap-1.5">
                    <span>{isBn ? 'হোমস্ক্রিনে যুক্ত করুন' : 'Add to Home Screen'}</span>
                    <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isBn ? 'তালিকা থেকে "Add to Home Screen" বা "হোম স্ক্রিনে যোগ করুন" চাপুন।' : 'Select "Add to Home Screen" from the menu options.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  ৩
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {isBn ? 'অ্যাপ হিসেবে সরাসরি চালু করুন' : 'Launch like a native app'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isBn ? 'এখন থেকে সাধারণ অ্যাপের মতো ক্লাবের আইকনে ক্লিক করলেই ওপেন হবে।' : 'You can now tap the PBC Club icon on your phone anytime.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              {isBn ? 'বুঝেছি, ধন্যবাদ' : 'Got it, thank you'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
