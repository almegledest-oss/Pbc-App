import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Building2, TrendingUp } from 'lucide-react';
import { PbcLogo } from './Common/PbcLogo';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0D2A52] via-[#091D3A] to-[#040E1D] text-white overflow-hidden select-none"
    >
      {/* Background ambient glowing shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2E7D32]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo & Crest */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center p-6 z-10"
      >
        <div className="relative mb-6">
          <PbcLogo variant="gold" className="w-32 h-32" />

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 rounded-3xl border border-dashed border-amber-400/40 pointer-events-none"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
          PROBASHI BUSINESS CLUB
        </h1>
        <p className="text-amber-400 font-medium text-sm md:text-base tracking-wide max-w-sm">
          Probashi Business Club
        </p>
        <p className="text-slate-400 text-xs mt-1 font-light tracking-wider uppercase">
          Real Estate Investment & Fund System
        </p>
      </motion.div>

      {/* Progress Bar & Loader */}
      <div className="w-64 z-10 mt-6">
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2E7D32] via-[#4CAF50] to-[#D4AF37] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
          <span>INITIALIZING SYSTEM</span>
          <span className="text-amber-400">{progress}%</span>
        </div>
      </div>

      {/* Security Badge Footnote */}
      <div className="absolute bottom-8 flex items-center gap-2 text-slate-400 text-xs font-sans opacity-80">
        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
        <span>Firebase Cloud Encrypted • Version 2.4</span>
      </div>
    </motion.div>
  );
};
